import { Prisma, type Friendship as FriendshipRow } from "@prisma/client";
import type { FriendshipRecord, FriendshipStatus } from "./users.types";
import { prisma } from "./libs/prisma";

function mapFriendship(row: FriendshipRow): FriendshipRecord {
    return {
        id: row.id,
        userId: row.userId,
        friendId: row.friendId,
        status: row.status as FriendshipStatus,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

class FriendshipRepository {
    async findBetween(userId: string, friendId: string): Promise<FriendshipRecord | undefined> {
        const row = await prisma.friendship.findUnique({
            where: { userId_friendId: { userId, friendId } },
        });
        return row ? mapFriendship(row) : undefined;
    }

    async create(input: {
        id: string;
        userId: string;
        friendId: string;
        status?: FriendshipStatus;
    }): Promise<FriendshipRecord> {
        const row = await prisma.friendship.create({
            data: {
                id: input.id,
                userId: input.userId,
                friendId: input.friendId,
                status: input.status ?? "pending",
            },
        });
        return mapFriendship(row);
    }

    async updateStatus(id: string, status: FriendshipStatus): Promise<FriendshipRecord | undefined> {
        try {
            const row = await prisma.friendship.update({
                where: { id },
                data: { status },
            });
            return mapFriendship(row);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                return undefined;
            }
            throw error;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        try {
            await prisma.friendship.delete({ where: { id } });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                return false;
            }
            throw error;
        }
    }

    /** Accepted friendships where the user is either side. */
    async listAcceptedForUser(userId: string): Promise<FriendshipRecord[]> {
        const rows = await prisma.friendship.findMany({
            where: {
                status: "accepted",
                OR: [{ userId }, { friendId: userId }],
            },
            orderBy: { updatedAt: "desc" },
        });
        return rows.map(mapFriendship);
    }

    /** Incoming pending requests addressed to this user. */
    async listPendingReceived(userId: string): Promise<FriendshipRecord[]> {
        const rows = await prisma.friendship.findMany({
            where: { friendId: userId, status: "pending" },
            orderBy: { createdAt: "desc" },
        });
        return rows.map(mapFriendship);
    }

    /** Outgoing pending requests sent by this user. */
    async listPendingSent(userId: string): Promise<FriendshipRecord[]> {
        const rows = await prisma.friendship.findMany({
            where: { userId, status: "pending" },
            orderBy: { createdAt: "desc" },
        });
        return rows.map(mapFriendship);
    }
}

export const friendshipRepository = new FriendshipRepository();
