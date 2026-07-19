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

    return mapped;
}

class UserRepository {
    // get all user, this should not expose to normal users
    async getAllUser(): Promise<InternalUserEntity[]> {
        const rows = await prisma.user.findMany();
        return rows.map(mapUserRow);
    }

    // get one user, this is for viewing others profile or their own profile, service will do the differenciation
    async getUserById(userId: string): Promise<InternalUserEntity | undefined> {
        const row = await prisma.user.findUnique({ where: { id: userId } });
        return row ? mapUserRow(row) : undefined;
    }

    // create new user
    async createNewUser(newProfile: InternalUserEntity): Promise<void> {
        await prisma.user.create({
            data: {
                id: newProfile.id,
                userName: newProfile.userName,
                userEmail: newProfile.userEmail,
                friendList: newProfile.friendList ?? null,
                userContact: newProfile.userContact ?? null,
                intraName: newProfile.intraName ?? null,
                intraUrl: newProfile.intraUrl ?? null,
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
                friendList: profile.friendList ?? null,
                userContact: profile.userContact ?? null,
                intraName: profile.intraName ?? null,
                intraUrl: profile.intraUrl ?? null,
            },
            update: {
                userName: profile.userName,
                userEmail: profile.userEmail,
                friendList: profile.friendList ?? null,
                userContact: profile.userContact ?? null,
                intraName: profile.intraName ?? null,
                intraUrl: profile.intraUrl ?? null,
            },
        });
        return mapUserRow(upserted);
    }

    // update users info
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

    // delete user
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
