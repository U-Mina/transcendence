import type { InternalUserEntity, UpdateUserDTO } from "../types/user";
import type { EventCard } from "../types/event";

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

// *************************************************************************************
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

// InternalUserEntity bc we need userId 
export async function listUsers(): Promise<InternalUserEntity[]> {
	const accessToken = localStorage.getItem("accessToken");

	const response = await fetch(`${API_BASE}/users`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to list users"));
	}

	const data = await response.json();

	return data.map((user: InternalUserEntity) => ({
		...user,
		createdAt: new Date(user.createdAt),
		updatedAt: new Date(user.updatedAt),
	}));
}

// show all events that the logged-in user has joined
export async function listJoinedEvents(): Promise<EventCard[]> {
	const accessToken = localStorage.getItem("accessToken");

	const response = await fetch(`${API_BASE}/users/me/events`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to list joined events"));
	}

	const data = await response.json();

	return data.map((event: EventCard & { startTime: string; endTime: string }) => ({
		...event,
		startTime: new Date(event.startTime),
		endTime: new Date(event.endTime),
	}));
}

// upload a profile picture (same concept as image upload for events)
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
	const accessToken = localStorage.getItem("accessToken");
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch(`${API_BASE}/users/me/avatar`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error(await parseErrorMessage(response, "Error: Failed to upload avatar"));
	}

	return await response.json();
}

// TODO: refactor all these fts above (also in events.ts) w one util ft
