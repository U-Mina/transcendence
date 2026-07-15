import type { CreateUserDTO } from "../types/user";

const API_BASE = "/api/v1";

// TODO: missing userContact as input (see types/user.ts)
export async function createUser({ userName, userEmail }: CreateUserDTO): Promise<void> {
	const response = await fetch(`${API_BASE}/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			userName: userName,
			userEmail: userEmail,
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
