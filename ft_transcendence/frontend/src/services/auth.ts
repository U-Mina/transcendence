import type { RegisterUserDTO,  LoginUserDTO } from "../types/user";

const API_BASE = "/api/v1";

// registerUser (/auth/register) RegisterUserDTO
export async function registerUser({ userName, email, password }: RegisterUserDTO): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userName,
            email,
            password,
        }),
    });

    if (!response.ok) {
        let errorMessage = "Failed to create your account.";

        try {
            const errorBody = await response.json() as { error?: string };
            if (errorBody.error) {
                errorMessage = errorBody.error;
            }
        } catch {
            // keep default error message when response is not JSON and therefore no more specific msg "found"
        }

        throw new Error(errorMessage);
    }

    return await response.json() as { message: string }; // success message of acc creation from backend
}

// loginUser (/auth/login) LoginUserDTO
export async function loginUser({ email, password }: LoginUserDTO): Promise<{ accessToken: string; user: { id: string; userEmail: string } }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        let errorMessage = "Failed to log in.";

        try {
            const errorBody = await response.json() as { error?: string };
            if (errorBody.error) {
                errorMessage = errorBody.error;
            }
        } catch {
            // keep default error message when response is not JSON and therefore no more specific msg "found"
        }

        throw new Error(errorMessage);
    }

    // backend returns JWT access token (token stored in frontend to keep user logged in)
    // id & email are good for identifying current user and what currentuser has access on certain pages
    return await response.json() as { accessToken: string; user: { id: string; userEmail: string } }; // from backend
}


// TODO: logout
// TODO: saveAuthSession (from loginpage)
// TODO: getAuthSession