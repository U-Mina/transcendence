/**
 * the interface of users data type
 * now for mocking usage
 */

// internal user interface with all necessary data
export interface UserDTO {
    id: number;
    intraName: string;
    email: string;
    intraUrl: string;
    createdAt: string;
}

// frontend visible user's data
export interface UserProfile {
    intraName: string;
    intraUrl: string;
}