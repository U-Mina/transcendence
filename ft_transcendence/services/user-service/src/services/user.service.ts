/**
 * currently, use mock data
 * - get: take /:id as parameter, search through and return user object (undefined if not found)
 * - formatter: take UserDTO and return UserProfile obj
 */
import { userRepository } from "../user.repository";
import type { InternalUserEntity, CreateUserDTO, UpdateUserDTO, PublicUserProfile} from "../users.types";
// the current id will extract from JWT later, now statically pass

class UserService {

    async getUserById(targetId: string, currentUserId: string): Promise<InternalUserEntity | PublicUserProfile | undefined> {
        const user = await userRepository.getUserById(targetId);
        if (!user) {
            throw new Error("User not found.");
        }
    
        // looking at own profile, return full data
        if (currentUserId === user.id) {
            return user;
        }
    
        const {
            createdAt,
            updatedAt,
            id,
            ...publicProfile
        } = user;
        return publicProfile;
    }
    
    // this should ONLY (if any) be used by ADMIN role!!
    async getAllUser(): Promise<InternalUserEntity[] | undefined> {
        return await userRepository.getAllUser();
    }
    
    // create new user
    async createNewUser(userProfile: CreateUserDTO): Promise<InternalUserEntity | undefined> {
        const newUser: InternalUserEntity = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...userProfile
        };
        // push to db
        await userRepository.createNewUser(newUser);
        return newUser;
    }
    
    // update user
    // temp pass userId for authR check
    async updateUser(userId: string, targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
        const findUser = await userRepository.getUserById(targetProfileId);
        if (!findUser) {
            throw new Error("User not found.");
        }
        // one MUST ONLY edit their won profile
        if (userId !== targetProfileId) {
            throw new Error("Forbidden operation.");
        }
        return await userRepository.updateUser(targetProfileId, updatedInfo);
    }
    
    // delete user profile, ONLY Admin or user-self can do this
    // manual pass cur-Id for now
    async deleteUser(currentId: string, targetId: string) {
        const matchedUser = await userRepository.getUserById(targetId);
        if (!matchedUser) {
            throw new Error("User not found.");
        }
        if (matchedUser.id !== currentId) {
            throw new Error("Forbidden operation.");
        }
        // true == delete, fals == fail
        return await userRepository.deleteUser(targetId);
    }
}

export const userService = new UserService();