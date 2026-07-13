// supposed to own list state, load data, handle loading and error states, and render all events
// mostly refactored from App.tsx (commented out)

import { useEffect, useState } from "react";
import { getListOfEvents } from "../services/events";
import { DisplayEventCard } from "../components/EventCard/EventCard";
import type { EventCard } from "../types/event";

// ...
// https://reactnative.dev/docs/network
export function EventsPage() {
    const [events, setEvents] = useState<EventCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getListOfEvents();
                setEvents(data);
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (isLoading) {
        return <p>Loading events...</p>;
    }

    if (events.length === 0) {
        return <p>No events yet.</p>;
    }

    return (
        <div>
            {events.map((event) => (
                <DisplayEventCard key={event.eventId} event={event} />
            ))}
        </div>
    );
}

/*
React Router
- client-side navigation
- no full page refresh, react swaps the component
- connects event list thru a click w event id in url then single event page
- install react router dom
- https://reactrouter.com/start/modes
- TODO: decide if framework mode or normal react router (depending on complexity of site)
 */