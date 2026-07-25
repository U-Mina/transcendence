import { friendshipRepository } from "../friendship.repository";
import { userRepository } from "../user.repository";
import { UserServiceError } from "./user.service";
import type { FriendUser, FriendshipRecord, InternalUserEntity } from "../users.types";

/** A user is online if they heartbeated within this window. */
export const ONLINE_THRESHOLD_MS = 90_000;

export function isUserOnline(lastSeenAt?: Date | null, now: Date = new Date()): boolean {
    if (!lastSeenAt) return false;
    return now.getTime() - lastSeenAt.getTime() <= ONLINE_THRESHOLD_MS;
}

function toFriendUser(
    user: InternalUserEntity,
    friendship: FriendshipRecord,
    now: Date = new Date(),
): FriendUser {
    return {
        id: user.id,
        userName: user.userName,
        friendshipId: friendship.id,
        status: friendship.status,
        isOnline: isUserOnline(user.lastSeenAt, now),
        ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
        ...(user.lastSeenAt ? { lastSeenAt: user.lastSeenAt.toISOString() } : {}),
    };
}

function otherUserId(friendship: FriendshipRecord, currentUserId: string): string {
    return friendship.userId === currentUserId ? friendship.friendId : friendship.userId;
}

class FriendshipService {
    async heartbeat(userId: string): Promise<{ lastSeenAt: string; isOnline: boolean; onlineThresholdSeconds: number }> {
        const updated = await userRepository.touchLastSeen(userId);
        if (!updated?.lastSeenAt) {
            throw new UserServiceError("User not found.", 404);
        }
        return {
            lastSeenAt: updated.lastSeenAt.toISOString(),
            isOnline: true,
            onlineThresholdSeconds: ONLINE_THRESHOLD_MS / 1000,
        };
    }

    async sendFriendRequest(currentUserId: string, targetUserId: string): Promise<FriendUser> {
        if (currentUserId === targetUserId) {
            throw new UserServiceError("You cannot add yourself as a friend.", 400);
        }
        const target = await userRepository.getUserById(targetUserId);
        if (!target) {
            throw new UserServiceError("User not found.", 404);
        }

        const existing = await friendshipRepository.findBetween(currentUserId, targetUserId);
        if (existing?.status === "accepted") {
            throw new UserServiceError("You are already friends.", 409);
        }
        if (existing?.status === "pending") {
            throw new UserServiceError("Friend request already sent.", 409);
        }

        const reverse = await friendshipRepository.findBetween(targetUserId, currentUserId);
        if (reverse?.status === "accepted") {
            throw new UserServiceError("You are already friends.", 409);
        }
        // They already asked you — accepting is the friendly move.
        if (reverse?.status === "pending") {
            const accepted = await friendshipRepository.updateStatus(reverse.id, "accepted");
            if (!accepted) {
                throw new UserServiceError("Friend request not found.", 404);
            }
            return toFriendUser(target, accepted);
        }

        const created = await friendshipRepository.create({
            id: crypto.randomUUID(),
            userId: currentUserId,
            friendId: targetUserId,
            status: "pending",
        });
        return toFriendUser(target, created);
    }

    async listFriends(currentUserId: string): Promise<FriendUser[]> {
        const rows = await friendshipRepository.listAcceptedForUser(currentUserId);
        const now = new Date();
        const friends: FriendUser[] = [];
        for (const row of rows) {
            const otherId = otherUserId(row, currentUserId);
            const other = await userRepository.getUserById(otherId);
            if (other) {
                friends.push(toFriendUser(other, row, now));
            }
        }
        return friends;
    }

    async listIncomingRequests(currentUserId: string): Promise<FriendUser[]> {
        const rows = await friendshipRepository.listPendingReceived(currentUserId);
        const now = new Date();
        const requests: FriendUser[] = [];
        for (const row of rows) {
            const requester = await userRepository.getUserById(row.userId);
            if (requester) {
                requests.push(toFriendUser(requester, row, now));
            }
        }
        return requests;
    }

    async listOutgoingRequests(currentUserId: string): Promise<FriendUser[]> {
        const rows = await friendshipRepository.listPendingSent(currentUserId);
        const now = new Date();
        const requests: FriendUser[] = [];
        for (const row of rows) {
            const target = await userRepository.getUserById(row.friendId);
            if (target) {
                requests.push(toFriendUser(target, row, now));
            }
        }
        return requests;
    }

    async acceptRequest(currentUserId: string, requesterId: string): Promise<FriendUser> {
        const pending = await friendshipRepository.findBetween(requesterId, currentUserId);
        if (!pending || pending.status !== "pending") {
            throw new UserServiceError("Friend request not found.", 404);
        }
        const accepted = await friendshipRepository.updateStatus(pending.id, "accepted");
        if (!accepted) {
            throw new UserServiceError("Friend request not found.", 404);
        }
        const requester = await userRepository.getUserById(requesterId);
        if (!requester) {
            throw new UserServiceError("User not found.", 404);
        }
        return toFriendUser(requester, accepted);
    }

    async rejectRequest(currentUserId: string, requesterId: string): Promise<void> {
        const pending = await friendshipRepository.findBetween(requesterId, currentUserId);
        if (!pending || pending.status !== "pending") {
            throw new UserServiceError("Friend request not found.", 404);
        }
        await friendshipRepository.deleteById(pending.id);
    }

    async removeFriend(currentUserId: string, friendId: string): Promise<void> {
        const direct = await friendshipRepository.findBetween(currentUserId, friendId);
        const reverse = await friendshipRepository.findBetween(friendId, currentUserId);
        const row = direct ?? reverse;
        if (!row) {
            throw new UserServiceError("Friendship not found.", 404);
        }
        await friendshipRepository.deleteById(row.id);
    }
}

export const friendshipService = new FriendshipService();
