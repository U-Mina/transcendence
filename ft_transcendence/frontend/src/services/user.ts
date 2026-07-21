import type { CreateUserDTO, InternalUserEntity, UpdateUserDTO } from "../types/user";

const API_BASE = "/api/v1";

// after fetch call if error, reads error msg from backend- if not in json, use my generic one
async function parseErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
	try {
		const errorBody = await response.json() as { error?: string };
		return errorBody.error ?? fallbackMessage;
	} catch {
		return fallbackMessage;
	}
}

// TODO: delete createUser bc replaced by registerUser ?? not needed anymore
// TODO: missing userContact as input (see types/user.ts) -> add, its the phone number
// the rest of the profile (intraname, url etc. will the user have to decide whether or not when "editing" his profile later)
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
		throw new Error(await parseErrorMessage(response, "Failed to create your account."));
	}

	return {
		userName,
		userEmail,
	};
}

// GET: retrieve a user's information (this will go on own profile page) & (and also be used for other user profile page) & (added to eventCard as creator of event)
// userId tells getUser which user to fetch from /users/:userId
export async function getUser(userId: string): Promise<InternalUserEntity> {
	const response = await fetch(`${API_BASE}/users/${userId}`);
	
	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to get user information"));
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
	const accessToken = localStorage.getItem("accessToken");

	const response = await fetch(`${API_BASE}/users/${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(updateData),
	});

	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to update user information"));
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
	const accessToken = localStorage.getItem("accessToken");

	const response = await fetch(`${API_BASE}/users/${userId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to delete user"));
	}

    return await response.json(); // if backend returns a message lke "successfully deleted user"
}
