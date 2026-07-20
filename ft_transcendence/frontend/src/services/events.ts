// this is where all the fetch stuff will go for the endpoints (event-related API calls)
// backend request done here & then called in EventsPage
// RETRIEVE AND PREPARE DATA

import type { EventCard } from "../types/event";
import type { CreateEventDTO, EventManageView } from "../types/event";
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
export async function getSingleEvent(eventId: string): Promise<EventCard> {
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
} // TODO: for creator view: also need other interfaces like EventManageView, UserSummary, EventDetailView... (not in this file)



// TODO: edit/update event (get endpoints from swagger UI)





// TODO: delete event




// create a new event
// TODO: no userid yet
export async function createEvent(eventInput: CreateEventDTO, userId: string,): Promise<EventManageView> { // 
    const response = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user": userId, // TODO: no userid yet
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
