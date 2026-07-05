// this is where all the fetch stuff will go for the endpoints (event-related API calls)
// backend request done here & then called in EventsPage

import type { EventCard } from "../../types/event";

export async function fetchEvents(): Promise<EventCard[]> { // ...
    const response = await fetch("/events"); // ...

    if (!response.ok)
        throw new Error("Error: Failed to fetch events");

    const data = await response.json();

    // date conversion needed (bc cannot return response right away)
    return data.map((event: EventCard & { startTime: string; endTime: string }) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
    }));
}