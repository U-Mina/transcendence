// copied from backend in services/user-service/src

// frontend visible user's data
export interface PublicUserProfile {
    userName: string;
    userEmail: string;
    // TODO: better data type maybe??
    friendList?: string;
    // opional phone number
    userContact?: string;
    intraName?: string;
    intraUrl?: string;
}

// internal user interface with all necessary data, this will be the payload
export interface InternalUserEntity extends PublicUserProfile {
    id: string;
    passwordHash?: string;
    createdAt: Date;
    updatedAt: Date;
}

// create user
export interface CreateUserDTO {
    userName: string;
    userEmail: string;
    userContact?: string; // TODO: what is meant by contact? from backend -> then include in user.ts ft as input
}

export interface RegisterUserDTO {
    userName: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface UpdateUserDTO {
    userName?: string;
    userContact?: string;
}
