/**
 * currently, use mock data
 * - get: take /:id as parameter, search through and return user object (undefined if not found)
 * - formatter: take UserDTO and return UserProfile obj
 */
import type { UserDTO, UserProfile } from "../users.types.js";

// mock data array
const mockUsers: UserDTO[] = [
    {
        id: 1,
        intraName: "e1",
        email: "ewu1@42hn.de",
        intraUrl: "42hn1.com",
        createdAt: "06062026",
    },
    {
        id: 2,
        intraName: "e2",
        email: "ewu2@42hn.de",
        intraUrl: "42hn2.com",
        createdAt: "05062026",
    },
    {
        id: 3,
        intraName: "e3",
        email: "ewu3@42hn.de",
        intraUrl: "42hn3.com",
        createdAt: "07062026",
    }
]

// promise the return type
export async function getUserById(targetId: number): Promise<UserDTO | undefined> {
    if (!targetId) {
        throw new Error("ID not valid");
    }
    return mockUsers.find(u => u.id === targetId);
}

// extract the needed data from users to format userProfile info, no async
export function formatUserProfile(user: UserDTO): UserProfile {
    if (!user) {
        throw new Error("Invalid userDTO.");
    }

    // formulate the return object
    const profile: UserProfile = {
        intraName: user.intraName,
        intraUrl: user.intraUrl
    };

    return profile;
}