/**
 * currently, use mock data
 * - get: take /:id as parameter, search through and return user object (undefined if not found)
 * - formatter: take UserDTO and return UserProfile obj
 */
import bcrypt from "bcryptjs";
import { userRepository } from "../user.repository";
import type { InternalUserEntity, UpdateUserDTO, PublicUserProfile, CommunityUser, LoginUserDTO, RegisterUserDTO } from "../users.types";
// the current id will extract from JWT later, now statically pass

/**
 * use custom error class for user service errors
 */
export class UserServiceError extends Error {
    constructor(message: string, readonly statusCode: number) {
        super(message);
    }
}

/**
 * SafeUser is a type that removes the password hash from the user entity
 * this is used to return a user profile to the client without the password hash
 */
export type SafeUser = Omit<InternalUserEntity, "passwordHash">;

/**
 * withoutPassword is a helper function to remove the password hash from the user entity
 */
function withoutPassword(user: InternalUserEntity): SafeUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
}

/**
 * normalizeEmail is a helper function to normalize the email address
 */
function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function validateEmail(email: string): boolean {
    return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicProfile(user: InternalUserEntity): PublicUserProfile {
    return {
        userName: user.userName,
        ...(user.userContact ? { userContact: user.userContact } : {}),
        ...(user.intraName ? { intraName: user.intraName } : {}),
        ...(user.intraUrl ? { intraUrl: user.intraUrl } : {}),
        ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    };
}

class UserService {

    async getUserById(targetId: string, currentUserId?: string): Promise<SafeUser | PublicUserProfile> {
        const user = await userRepository.getUserById(targetId);
        if (!user) {
            throw new UserServiceError("User not found.", 404);
        }
    
        // looking at own profile, return full data, remove pw-hash
        if (currentUserId === user.id) {
            return withoutPassword(user);
        }
    
        return publicProfile(user);
    }
    
    async getAllUser(): Promise<CommunityUser[]> {
        return (await userRepository.getAllUser()).map((user) => ({
            id: user.id,
            userName: user.userName,
            ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
        }));
    }
    
    // register of new user
    async registerUser(userInput: RegisterUserDTO): Promise<SafeUser> {
        // extract info (guard missing fields so Bruno/empty env vars return 400, not 500)
        const userName = typeof userInput.userName === "string" ? userInput.userName.trim() : "";
        const userEmail = typeof userInput.email === "string" ? normalizeEmail(userInput.email) : "";
        const password = typeof userInput.password === "string" ? userInput.password : "";

        if (userName.length < 2 || userName.length > 100 || !validateEmail(userEmail)) {
            throw new UserServiceError("Invalid registration data.", 400);
        }
        if (password.length < 8 || password.length > 72) {
            throw new UserServiceError("Password must be between 8 and 72 characters.", 400);
        }
        if (await userRepository.getUserByEmail(userEmail)) {
            throw new UserServiceError("An account already exists for this email.", 409);
        }
        const newUser: InternalUserEntity = {
            id: crypto.randomUUID(),
            userName,
            userEmail,
            passwordHash: await bcrypt.hash(password, 12),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            await userRepository.createNewUser(newUser);
        } catch (error) {
            const code = (error as { code?: string }).code;
            if (code === "ER_DUP_ENTRY" || code === "P2002") {
                throw new UserServiceError("An account already exists for this email.", 409);
            }
            throw error;
        }
        return withoutPassword(newUser);
    }
    
    // user login
    async loginUser(loginInput: LoginUserDTO): Promise<SafeUser> {
        const email = typeof loginInput.email === "string" ? normalizeEmail(loginInput.email) : "";
        const password = typeof loginInput.password === "string" ? loginInput.password : "";
        if (!email || !password) {
            throw new UserServiceError("Invalid email or password.", 401);
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user?.passwordHash) {
            throw new UserServiceError("Invalid email or password.", 401);
        }
        const validation = await bcrypt.compare(password, user.passwordHash);
        if (!validation) {
            throw new UserServiceError("Invalid email or password.", 401);
        }
        return withoutPassword(user);
    }

    // temp pass userId for authR check
    async updateUser(userId: string, targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<SafeUser> {
        if (userId !== targetProfileId) {
            throw new UserServiceError("Forbidden operation.", 403);
        }
        const userName = updatedInfo.userName === undefined ? undefined : updatedInfo.userName.trim();
        const userContact = updatedInfo.userContact === undefined || updatedInfo.userContact === null
            ? updatedInfo.userContact
            : updatedInfo.userContact.trim();
        const intraUrl = updatedInfo.intraUrl === undefined || updatedInfo.intraUrl === null
            ? updatedInfo.intraUrl
            : updatedInfo.intraUrl.trim();
        if ((userName !== undefined && (userName.length < 2 || userName.length > 100))
            || (typeof userContact === "string" && userContact.length > 50)
            || (typeof intraUrl === "string" && intraUrl.length > 255)) {
            throw new UserServiceError("Invalid profile data.", 400);
        }
        const updated =  await userRepository.updateUser(targetProfileId, {
            ...(userName !== undefined ? { userName } : {}),
            ...(userContact !== undefined ? { userContact } : {}),
            ...(intraUrl !== undefined ? { intraUrl } : {}),
        });
        if (!updated) {
            throw new UserServiceError("User not found.", 404);
        }
        return withoutPassword(updated);
    }
    
    // delete user profile, ONLY Admin or user-self can do this
    async deleteUser(currentId: string, targetId: string): Promise<boolean> {
        if (currentId !== targetId) {
            throw new UserServiceError("Forbidden operation.", 403);
        }
        const matchedUser = await userRepository.getUserById(targetId);
        if (!matchedUser) {
            throw new UserServiceError("User not found.", 404);
        }
        // true == delete, fals == fail
        return userRepository.deleteUser(targetId);
    }

    async replaceAvatar(userId: string, avatarUrl: string): Promise<{ avatarUrl: string; previousAvatarUrl?: string }> {
        if (!avatarUrl.startsWith("/uploads/")) {
            throw new UserServiceError("Invalid avatar URL.", 400);
        }
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new UserServiceError("User not found.", 404);
        }
        const updated = await userRepository.updateAvatar(userId, avatarUrl);
        if (!updated) {
            throw new UserServiceError("User not found.", 404);
        }
        // fallback if updated of pic fail
        return user.avatarUrl ? { avatarUrl, previousAvatarUrl: user.avatarUrl } : { avatarUrl };
    }
}

export const userService = new UserService();
