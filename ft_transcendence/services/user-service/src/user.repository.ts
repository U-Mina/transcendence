/**
 * add middle layer to handle the database operations
 * Prisma-backed implementation
 */
import { Prisma, type User as UserRow } from "@prisma/client";
import type { InternalUserEntity, UpdateUserDTO } from "./users.types";
import { prisma } from "./libs/prisma";

function mapUserRow(row: UserRow): InternalUserEntity {
    const mapped: InternalUserEntity = {
        id: row.id,
        userName: row.userName,
        userEmail: row.userEmail,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };

    if (row.passwordHash !== null) {
        mapped.passwordHash = row.passwordHash;
    }
    if (row.friendList !== null) {
        mapped.friendList = row.friendList;
    }
    if (row.userContact !== null) {
        mapped.userContact = row.userContact;
    }
    if (row.intraName !== null) {
        mapped.intraName = row.intraName;
    }
    if (row.intraUrl !== null) {
        mapped.intraUrl = row.intraUrl;
    }
    if (row.avatarUrl !== null) {
        mapped.avatarUrl = row.avatarUrl;
    }

    return mapped;
}

class UserRepository {
    async getAllUser(): Promise<InternalUserEntity[]> {
        const rows = await prisma.user.findMany();
        return rows.map(mapUserRow);
    }

    async getUserById(userId: string): Promise<InternalUserEntity | undefined> {
        const row = await prisma.user.findUnique({ where: { id: userId } });
        return row ? mapUserRow(row) : undefined;
    }

    async getUserByEmail(userEmail: string): Promise<InternalUserEntity | undefined> {
        const row = await prisma.user.findUnique({ where: { userEmail } });
        return row ? mapUserRow(row) : undefined;
    }

    async createNewUser(newProfile: InternalUserEntity): Promise<void> {
        await prisma.user.create({
            data: {
                id: newProfile.id,
                userName: newProfile.userName,
                userEmail: newProfile.userEmail,
                passwordHash: newProfile.passwordHash ?? null,
                friendList: newProfile.friendList ?? null,
                userContact: newProfile.userContact ?? null,
                intraName: newProfile.intraName ?? null,
                intraUrl: newProfile.intraUrl ?? null,
                avatarUrl: newProfile.avatarUrl ?? null,
            },
        });
    }

    // idempotent create-or-replace, replaces the old manual "INSERT ... ON DUPLICATE KEY UPDATE"
    async upsertUser(profile: InternalUserEntity): Promise<InternalUserEntity> {
        const upserted = await prisma.user.upsert({
            where: { id: profile.id },
            create: {
                id: profile.id,
                userName: profile.userName,
                userEmail: profile.userEmail,
                passwordHash: profile.passwordHash ?? null,
                friendList: profile.friendList ?? null,
                userContact: profile.userContact ?? null,
                intraName: profile.intraName ?? null,
                intraUrl: profile.intraUrl ?? null,
                avatarUrl: profile.avatarUrl ?? null,
            },
            update: {
                userName: profile.userName,
                userEmail: profile.userEmail,
                passwordHash: profile.passwordHash ?? null,
                friendList: profile.friendList ?? null,
                userContact: profile.userContact ?? null,
                intraName: profile.intraName ?? null,
                intraUrl: profile.intraUrl ?? null,
                avatarUrl: profile.avatarUrl ?? null,
            },
        });
        return mapUserRow(upserted);
    }

    async updateUser(targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
        const data: Prisma.UserUpdateInput = {};

        if (updatedInfo.userName !== undefined) {
            data.userName = updatedInfo.userName;
        }
        if (updatedInfo.userContact !== undefined) {
            data.userContact = updatedInfo.userContact ?? null;
        }

        if (Object.keys(data).length === 0) {
            return this.getUserById(targetProfileId);
        }

        try {
            const updated = await prisma.user.update({ where: { id: targetProfileId }, data });
            return mapUserRow(updated);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                // record to update not found
                return undefined;
            }
            throw error;
        }
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<InternalUserEntity | undefined> {
        try {
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { avatarUrl },
            });
            return mapUserRow(updated);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                return undefined;
            }
            throw error;
        }
    }

    async deleteUser(targetId: string): Promise<boolean> {
        try {
            await prisma.user.delete({ where: { id: targetId } });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                // record to delete not found
                return false;
            }
            throw error;
        }
    }
}

export const userRepository = new UserRepository();
