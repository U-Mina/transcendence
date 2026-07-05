/**
 * add middle layer to handle the database operations
 * easier to switch to real db
 */
import type { InternalUserEntity, UpdateUserDTO } from "./users.types";

// mock data array
class UserRepository{

    private mockUsers: InternalUserEntity[] = [
        {
            id: "1",
            userName: "hshah",
            userEmail: "ewu1@42hn.de",
            userContact: "123456",
            intraName: "e1",
            intraUrl: "42hn1.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "2",
            userName: "iiwkk",
            intraName: "e2",
            userEmail: "ewu2@42hn.de",
            intraUrl: "42hn2.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "3",
            userName: "uwiwo",
            intraName: "e3",
            userEmail: "ewu3@42hn.de",
            intraUrl: "42hn3.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    // the function for user CRUD

    // get all user, this should not expose to normal users
    async getAllUser() {
        return this.mockUsers;
    }

    // get one user, this is for viewing others profile or their own profile, service will do the differenciation
    async getUserById(userId: string) {
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
            return undefined;
        }
        return user;
    }

    // create new user
    async createNewUser(newProfile: InternalUserEntity) {
        this.mockUsers.push(newProfile);
    }

    // update users info
    async updateUser(targetProfileId: string, updatedInfo: UpdateUserDTO): Promise<InternalUserEntity | undefined> {
        const index = this.mockUsers.findIndex(u => u.id === targetProfileId);
        // index exist
        if (index === -1) {
            return undefined;
        }
        const oldProfile = this.mockUsers[index];
        // profile at this index exist and intact
        if (oldProfile === undefined) {
            return undefined;
        }
        const updatedUserProfile: InternalUserEntity = {
            ...oldProfile,
            ...updatedInfo,
            updatedAt: new Date()
        };
        this.mockUsers[index] = updatedUserProfile;

        return updatedUserProfile;
    }

    // delete user
    async deleteUser(targetId: string): Promise<boolean> {
        const index = this.mockUsers.findIndex(u => u.id === targetId);
        if (index === -1) {
            return false;
        }
        this.mockUsers.splice(index, 1);
        return true
    }
}

export const userRepository = new UserRepository();
