/**
 * currently, use mock data
 * - get: take /:id as parameter, search through and return user object (undefined if not found)
 * - formatter: take UserDTO and return UserProfile obj
 */
import bcrypt from "bcryptjs";
import { userRepository } from "../user.repository";
import type { InternalUserEntity, CreateUserDTO, UpdateUserDTO, PublicUserProfile, LoginUserDTO, RegisterUserDTO } from "../users.types";
import { toUnicode } from "node:punycode";
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

class UserService {

    async getUserById(targetId: string, currentUserId: string): Promise<SafeUser | PublicUserProfile> {
        const user = await userRepository.getUserById(targetId);
        if (!user) {
            throw new UserServiceError("User not found.", 404);
        }
    
        // looking at own profile, return full data, remove pw-hash
        if (currentUserId === user.id) {
            return withoutPassword(user);
        }
    
        const {
            createdAt,
            updatedAt,
            id,
            passwordHash,
            ...publicProfile
        } = user;
        return publicProfile;
    }
    
    async getAllUser(): Promise<SafeUser[]> {
        // remove password hash from every object
        return (await userRepository.getAllUser()).map(withoutPassword);
    }
    
    // register of new user
    async registerUser(userInput: RegisterUserDTO): Promise<SafeUser> {
        // extract info
        const userName = userInput.userName.trim();
        const userEmail = normalizeEmail(userInput.email);
        // validation check
        if (!userName || !userEmail || userInput.password.length < 8 || userInput.password.length > 72) {
            throw new UserServiceError("Invalid registration data.", 400);
        }
        if (await userRepository.getUserByEmail(userEmail)) {
            throw new UserServiceError("An account already exists for this email.", 409);
        }
        const newUser: InternalUserEntity = {
            id: crypto.randomUUID(),
            userName,
            userEmail,
            passwordHash: await bcrypt.hash(userInput.password, 12),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            await userRepository.createNewUser(newUser);
        } catch (error) {
            if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
                throw new UserServiceError("An account already exists for this email.", 409);
            }
            throw error;
        }
        return withoutPassword(newUser);
    }
    
    // user login
    async loginUser(loginInput: LoginUserDTO): Promise<SafeUser> {
        const user = await userRepository.getUserByEmail(normalizeEmail(loginInput.email));
        if (!user?.passwordHash) {
            throw new UserServiceError("Invalid email or password.", 401);
        }
        const validation = await bcrypt.compare(loginInput.password, user.passwordHash);
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
        const updated =  await userRepository.updateUser(targetProfileId, updatedInfo);
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