/**
 * PublicUserProfile is the public profile of a user
 */
export interface PublicUserProfile {
    userName: string;
    intraName?: string;
    intraUrl?: string;
    avatarUrl?: string;
    userContact?: string;
}

export interface CommunityUser {
    id: string;
    userName: string;
    avatarUrl?: string;
}

/**
 * InternalUserEntity is the internal user entity
 * passwordHash is the hash of the user's password
 */
export interface InternalUserEntity extends PublicUserProfile {
    id: string;
    userEmail: string;
    passwordHash?: string;
    friendList?: string;
    userContact?: string;
    lastSeenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type FriendshipStatus = "pending" | "accepted";

export interface FriendshipRecord {
    id: string;
    userId: string;
    friendId: string;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
}

/** Friend (or requester) as returned to the client. */
export interface FriendUser {
    id: string;
    userName: string;
    avatarUrl?: string;
    isOnline: boolean;
    lastSeenAt?: string;
    friendshipId: string;
    status: FriendshipStatus;
}

/**
 * CreateUserDTO is the data transfer object for creating a user
 */
export interface CreateUserDTO {
    userName: string;
    userEmail: string;
    userContact?: string;
}

/**
 * basic user information for registration
 * a user name is required for display
 * email and password are required for authentication
 */
export interface RegisterUserDTO {
    userName: string;
    email: string;
    password: string;
}

/**
 * LoginUserDTO is the data transfer object for logging in a user
 */
export interface LoginUserDTO {
    email: string;
    password: string;
}

/**
 * UpdateUserDTO is the data transfer object for updating a user
 */
export interface UpdateUserDTO {
    userName?: string;
    userContact?: string | null;
    intraUrl?: string | null;
}
