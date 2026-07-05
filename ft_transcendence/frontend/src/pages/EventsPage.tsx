// supposed to own list state, load data, handle loading and error states, and render all events
// mostly refactored from App.tsx (commented out)

import { useEffect, useState } from "react";
import { fetchEvents } from "../services/events/events";
import { DisplayEventCard } from "../components/EventCard/EventCard";
import type { EventCard } from "../types/event";

// ...
// https://reactnative.dev/docs/network
export function EventsPage() {
    const [events, setEvents] = useState<EventCard[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getEvents = async () => {
            try {
                const data = await fetchEvents();
                setEvents(data);
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
        };
        getEvents();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {events.map((event) => (
                <DisplayEventCard key={event.eventId} event={event} />
            ))}
        </div>
    );
}