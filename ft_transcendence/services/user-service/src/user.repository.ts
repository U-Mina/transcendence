import type { RowDataPacket } from "mysql2";
import type { InternalUserEntity, UpdateUserDTO } from "./users.types";
import { pool } from "./database";

type UserRow = RowDataPacket & {
    id: string;
    user_name: string;
    user_email: string;
    password_hash: string | null;
    friend_list: string | null;
    user_contact: string | null;
    intra_name: string | null;
    intra_url: string | null;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
};

const userColumns = `
    id, user_name, user_email, password_hash, friend_list, user_contact,
    intra_name, intra_url, avatar_url, created_at, updated_at`;

function mapUserRow(row: UserRow): InternalUserEntity {
    const mapped: InternalUserEntity = {
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };

    if (row.password_hash !== null) mapped.passwordHash = row.password_hash;
    if (row.friend_list !== null) mapped.friendList = row.friend_list;
    if (row.user_contact !== null) mapped.userContact = row.user_contact;
    if (row.intra_name !== null) mapped.intraName = row.intra_name;
    if (row.intra_url !== null) mapped.intraUrl = row.intra_url;
    if (row.avatar_url !== null) mapped.avatarUrl = row.avatar_url;
    return mapped;
}

class UserRepository {
    async getAllUser(): Promise<InternalUserEntity[]> {
        const [rows] = await pool.query<UserRow[]>(`SELECT ${userColumns} FROM users`);
        return rows.map(mapUserRow);
    }

    async getUserById(userId: string): Promise<InternalUserEntity | undefined> {
        const [rows] = await pool.query<UserRow[]>(
            `SELECT ${userColumns} FROM users WHERE id = ? LIMIT 1`,
            [userId],
        );
        return rows[0] ? mapUserRow(rows[0]) : undefined;
    }

    async getUserByEmail(email: string): Promise<InternalUserEntity | undefined> {
        const [rows] = await pool.query<UserRow[]>(
            `SELECT ${userColumns} FROM users WHERE user_email = ? LIMIT 1`,
            [email],
        );
        return rows[0] ? mapUserRow(rows[0]) : undefined;
    }

    async createNewUser(newProfile: InternalUserEntity): Promise<void> {
        await pool.execute(
            `INSERT INTO users (
                id, user_name, user_email, password_hash, friend_list, user_contact,
                intra_name, intra_url, avatar_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newProfile.id, newProfile.userName, newProfile.userEmail,
                newProfile.passwordHash ?? null, newProfile.friendList ?? null,
                newProfile.userContact ?? null, newProfile.intraName ?? null,
                newProfile.intraUrl ?? null, newProfile.avatarUrl ?? null,
                newProfile.createdAt, newProfile.updatedAt,
            ],
        );
    }

    async updateUser(targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
        const fields: string[] = [];
        const values: Array<string | null> = [];
        if (updatedInfo.userName !== undefined) { fields.push("user_name = ?"); values.push(updatedInfo.userName); }
        if (updatedInfo.userContact !== undefined) { fields.push("user_contact = ?"); values.push(updatedInfo.userContact ?? null); }
        return this.updateFields(targetProfileId, fields, values);
    }

    async updateAvatar(targetProfileId: string, avatarUrl: string): Promise<InternalUserEntity | undefined> {
        return this.updateFields(targetProfileId, ["avatar_url = ?"], [avatarUrl]);
    }

    private async updateFields(
        targetProfileId: string,
        fields: string[],
        values: Array<string | null>,
    ): Promise<InternalUserEntity | undefined> {
        if (fields.length === 0) return this.getUserById(targetProfileId);
        fields.push("updated_at = CURRENT_TIMESTAMP");
        await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, [...values, targetProfileId]);
        return this.getUserById(targetProfileId);
    }

    async deleteUser(targetId: string): Promise<boolean> {
        const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [targetId]);
        return ((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
    }
}

export const userRepository = new UserRepository();
