export interface PublicUserProfile {
    userName: string;
    userEmail: string;
    friendList?: string;
    userContact?: string;
    intraName?: string;
    intraUrl?: string;
}

export interface InternalUserEntity extends PublicUserProfile {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDTO {
    userName: string;
    userEmail: string;
    userContact?: string;
}

export interface UpdateUserDTO {
    userName?: string;
    userContact?: string;
}
