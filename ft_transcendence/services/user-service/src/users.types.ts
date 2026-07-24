/**
 * PublicUserProfile is the public profile of a user
 */
export interface PublicUserProfile {
    userName: string;
    intraName?: string;
    intraUrl?: string;
    avatarUrl?: string;
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
    createdAt: Date;
    updatedAt: Date;
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
}
