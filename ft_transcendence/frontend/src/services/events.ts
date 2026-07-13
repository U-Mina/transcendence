// this is where all the fetch stuff will go for the endpoints (event-related API calls)
// backend request done here & then called in EventsPage
// RETRIEVE AND PREPARE DATA

import type { EventCard } from "../types/event";
// import type { EventManageView } from "../types/event";
// import type { EventCard } from "../services/event-service/src/event.types";

// get list of events
export async function getListOfEvents(): Promise<EventCard[]> { // ...
    const response = await fetch("/events"); // ...

    if (!response.ok)
        throw new Error("Error: Failed to display events");

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
    const response = await fetch(`/events/${eventId}`);

    if (!response.ok)
        throw new Error("Error: Failed to display the event's details");

    const data = await response.json();

    // date conversion
    return {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
    };
} // TODO: for creator view: also need other interfaces like EventManageView, UserSummary, EventDetailView... (not in this file)



// TODO: edit event (get endpoints from swagger UI)



// TODO: delete event



