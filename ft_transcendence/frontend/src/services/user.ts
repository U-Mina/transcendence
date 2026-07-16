import type { CreateUserDTO, InternalUserEntity, UpdateUserDTO } from "../types/user";

const API_BASE = "/api/v1";

// TODO: missing userContact as input (see types/user.ts)
// ft title -> pulling the two fields from the object to use directly without object.userName
export async function createUser({ userName, userEmail }: CreateUserDTO): Promise<CreateUserDTO> {
	const response = await fetch(`${API_BASE}/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			userName,
			userEmail,
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

	// TODO: return created user (to have id)
	return {
		userName,
		userEmail,
	};
}

// GET: retrieve a user's information (this will go on own profile page)
// userId tells getUser which user to fetch from /users/:userId
export async function getUser(userId: string): Promise<InternalUserEntity> {
	const response = await fetch(`${API_BASE}/users/${userId}`);

	if (!response.ok) {
		throw new Error("Error: Failed to get user information");
	}

	const data = await response.json();

	// return actual user object after fetch
	return {
		...data,
		createdAt: new Date(data.createdAt),
		updatedAt: new Date(data.updatedAt),
	};
}

// PUT: edit/update a user's information (this will go thru an edit button)
export async function updateUser(userId: string, updateData: UpdateUserDTO,): Promise<InternalUserEntity> {
	const response = await fetch(`${API_BASE}/users/${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			"x-user": userId,
		},
		body: JSON.stringify(updateData),
	});

	if (!response.ok) {
		throw new Error("Error: Failed to update user information");
	}

	const data = await response.json();

	return {
		...data,
		createdAt: new Date(data.createdAt),
		updatedAt: new Date(data.updatedAt),
	};
}

// DELETE: remove a user (this will go thru a delete button)
export async function deleteUser(userId: string): Promise<{message: string}> {
	const response = await fetch(`${API_BASE}/users/${userId}`, {
		method: "DELETE",
		headers: {
			"x-user": userId,
		},
	});

	if (!response.ok) {
		throw new Error("Error: Failed to delete user");
	}

    return await response.json(); // if backend returns a message lke "successfully deleted user"
}
