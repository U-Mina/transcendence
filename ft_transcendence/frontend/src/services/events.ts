// this is where all the fetch stuff will go for the endpoints (event-related API calls)
// backend request done here & then called in EventsPage
// RETRIEVE AND PREPARE DATA

import type { EventCard } from "../types/event";
import type { CreateEventDTO, EventDetailView, EventManageView, UpdateEventDTO } from "../types/event";
// import type { EventManageView } from "../types/event";
// import type { EventCard } from "../services/event-service/src/event.types";

const API_BASE = "/api/v1";

async function parseErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
    try {
        const errorBody = await response.json() as { error?: string };
        return errorBody.error ?? fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}

/********************************************************************************************* */
// get list of events
export async function getListOfEvents(): Promise<EventCard[]> { // ...
    const response = await fetch(`${API_BASE}/events`);
    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to display events"));
    }

    const data = await response.json();

    // date conversion needed (bc cannot return response right away)
    return data.map((event: EventCard & { startTime: string; endTime: string }) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
    }));
}

// get one event in its entirety by ID
export async function getSingleEvent(eventId: string): Promise<EventDetailView> {
    const response = await fetch(`${API_BASE}/events/${eventId}`);

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to display the event's details"));
    }

    const data = await response.json();

    // date conversion
    return {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
    };
}

// get eventId from URL (w useParam) and the updateData from the update form object created
// owner only
export async function updateEvent(eventId: string, updateData: UpdateEventDTO): Promise<EventManageView> {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events/${eventId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            ...updateData,
            ...(updateData.startTime && { startTime: new Date(updateData.startTime).toISOString() }),
            ...(updateData.endTime && { endTime: new Date(updateData.endTime).toISOString() }),
        }),
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to update event"));
    }

    const data = await response.json();

    return {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
    };
}

// get eventId as input from URL useParam 
// owner only
export async function deleteEvent(eventId: string): Promise<{ message: string }> {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events/${eventId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to delete event"));
    }

    return await response.json();
}

// create a new event
export async function createEvent(eventInput: CreateEventDTO): Promise<EventManageView> {
	const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            ...eventInput,
            startTime: new Date(eventInput.startTime).toISOString(), // TODO: create a helper function that converts these always?
            endTime: new Date(eventInput.endTime).toISOString(),
        }),
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to create event"));
    }

    const data = await response.json();

    // when createEvent finishes, user will get the EventManageView interface - TODO: include createrid from EventManageView once available
    return {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
    };
}

// join an event
// no need to return success message (button text will change)
export async function joinEvent(eventId: string): Promise<void> {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events/${eventId}/join`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to join event"));
    }
}

// un-join an event (cancel)
// no need to return success message (button text will change)
export async function cancelEventJoin(eventId: string): Promise<void> {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events/${eventId}/join`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to cancel event join"));
    }
}

// get the current # of how many users have joined the event so far
export async function getJoinedCount(eventId: string): Promise<number> {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/events/${eventId}/joined-count`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to get joined-user count"));
    }

    return await response.json();
}

// upload an image when creating an event
// multipart field name: file --> img must be sent in FormData (browser object for sending form fields, files, in http request) under key "file"
// returns the uploaded image's public url for frontend to update/add image right away without fetching entire event again
// TODO: add this to the create event form
export async function uploadEventImage(eventId: string, file: File): Promise<{ imageUrl: string }> {
    const accessToken = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/events/${eventId}/image`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response, "Error: Failed to upload event image"));
    }

    return await response.json();
}
