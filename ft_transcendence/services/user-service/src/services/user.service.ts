/**
 * currently, use mock data
 * - get: take /:id as parameter, search through and return user object (undefined if not found)
 * - formatter: take UserDTO and return UserProfile obj
 */
import { userRepository } from "../user.repository";
import type { InternalUserEntity, CreateUserDTO, UpdateUserDTO, PublicUserProfile} from "../users.types";
// the current id will extract from JWT later, now statically pass
export async function getUserById(targetId: string, currentUserId: string): Promise<InternalUserEntity | PublicUserProfile | undefined> {
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
export async function getAllUser(): Promise<InternalUserEntity[] | undefined> {
    return await userRepository.getAllUser();
}

// create new user
export async function createNewUser(userProfile: CreateUserDTO): Promise<InternalUserEntity | undefined> {
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
export async function updateUser(userId: string, targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
    // one MUST ONLY edit their won profile
    if (userId !== targetProfileId) {
        throw new Error("Forbbiden operation.");
    }
    return await userRepository.updateUser(targetProfileId, updatedInfo);
}

// delete user profile, ONLY Admin or user-self can do this
// manual pass cur-Id for now
export async function deleteUser(currentId: string, targetId: string) {
    const matchedUser = await userRepository.getUserById(targetId);
    if (!matchedUser) {
        throw new Error("User not found.");
    }
    if (matchedUser.id !== currentId) {
        throw new Error("Foriden operation.");
    }
    // true == delete, fals == fail
    return await userRepository.deleteUser(targetId);
}