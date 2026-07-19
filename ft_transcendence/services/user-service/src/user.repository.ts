/**
 * add middle layer to handle the database operations
 * easier to switch to real db
 */
import type { RowDataPacket } from "mysql2";
import type { InternalUserEntity, UpdateUserDTO } from "./users.types";
import { pool } from "./database";

type UserRow = RowDataPacket & {
    id: string;
    user_name: string;
    user_email: string;
    friend_list: string | null;
    user_contact: string | null;
    intra_name: string | null;
    intra_url: string | null;
    created_at: Date;
    updated_at: Date;
};

function mapUserRow(row: UserRow): InternalUserEntity {
    const mapped: InternalUserEntity = {
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };

    if (row.friend_list !== null) {
        mapped.friendList = row.friend_list;
    }
    if (row.user_contact !== null) {
        mapped.userContact = row.user_contact;
    }
    if (row.intra_name !== null) {
        mapped.intraName = row.intra_name;
    }
    if (row.intra_url !== null) {
        mapped.intraUrl = row.intra_url;
    }

    return mapped;
}

class UserRepository{
    // get all user, this should not expose to normal users
    async getAllUser(): Promise<InternalUserEntity[]> {
        const [rows] = await pool.query<UserRow[]>(
            `SELECT
                id,
                user_name,
                user_email,
                friend_list,
                user_contact,
                intra_name,
                intra_url,
                created_at,
                updated_at
            FROM users`,
        );
        return rows.map(mapUserRow);
    }

    // get one user, this is for viewing others profile or their own profile, service will do the differenciation
    async getUserById(userId: string): Promise<InternalUserEntity | undefined> {
        const [rows] = await pool.query<UserRow[]>(
            `SELECT
                id,
                user_name,
                user_email,
                friend_list,
                user_contact,
                intra_name,
                intra_url,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
            LIMIT 1`,
            [userId],
        );
        const row = rows[0];
        if (!row) {
            return undefined;
        }
        return mapUserRow(row);
    }

    // create new user
    async createNewUser(newProfile: InternalUserEntity): Promise<void> {
        await pool.execute(
            `INSERT INTO users (
                id,
                user_name,
                user_email,
                friend_list,
                user_contact,
                intra_name,
                intra_url,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newProfile.id,
                newProfile.userName,
                newProfile.userEmail,
                newProfile.friendList ?? null,
                newProfile.userContact ?? null,
                newProfile.intraName ?? null,
                newProfile.intraUrl ?? null,
                newProfile.createdAt,
                newProfile.updatedAt,
            ],
        );
    }

    // update users info
    async updateUser(targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
        const fields: string[] = [];
        const values: Array<string | null> = [];

        if (updatedInfo.userName !== undefined) {
            fields.push("user_name = ?");
            values.push(updatedInfo.userName);
        }
        if (updatedInfo.userContact !== undefined) {
            fields.push("user_contact = ?");
            values.push(updatedInfo.userContact ?? null);
        }

        if (fields.length === 0) {
            return this.getUserById(targetProfileId);
        }

        fields.push("updated_at = CURRENT_TIMESTAMP");
        await pool.execute(
            `UPDATE users
             SET ${fields.join(", ")}
             WHERE id = ?`,
            [...values, targetProfileId],
        );

        return this.getUserById(targetProfileId);
    }

    // delete user
    async deleteUser(targetId: string): Promise<boolean> {
        const [result] = await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [targetId],
        );
        const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;
        return affectedRows > 0;
    }
}

export const userRepository = new UserRepository();
