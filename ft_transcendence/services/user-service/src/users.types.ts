/**
 * the interface of users data type
 * now for mocking usage
 */

// frontend visible user's data
export interface UserProfile {
    userName: string;
    userEmail: string;
    // opional phone number
    userContact?: string;
    intraName?: string;
    intraUrl?: string;
}

// internal user interface with all necessary data, this will be the payload
export interface InternalUserEntity extends UserProfile {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// create user
export interface CreateUserDTO {
    userName: string;
    userEmail: string;
    userContact?: string;
}

export interface UpdateUserDTO {
    userName?: string;
    userEmail?: string;
    userContact?: string;
}