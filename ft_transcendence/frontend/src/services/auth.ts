import type { RegisterUserDTO,  LoginUserDTO } from "../types/user";

const API_BASE = "/api/v1";

// registerUser (/auth/register) RegisterUserDTO
export async function registerUser({ userName, email, password }: RegisterUserDTO): Promise<void> {
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

// TODO: keep the three below in auth.ts and move above login and register to user.ts? 

// saveAuthSession (from loginpage)
// get accessToken, and user from result (user info needed to build ownprofilepage & knowing which user is currentuser & to show delete/edit buttons)
// store token in localStorage (if want user to stay logged in after refresh/reopen until token expires)
//  or store token in sessionStorage (if want to disappear when browser closes) (no)
export function saveAuthSession(accessToken: string, user: { id: string; userEmail: string }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
}

// TODO: getAuthSession
// reads back the saved login data whenever another part/page of the app needs to know who is logged in
// use to know whether to show edit/delete buttons on eventcards & to display current users profile & after refresh/reopening tab
export function getAuthSession() {
    

}


// TODO: logout
