/*
create a page of ONE event in its entirety. 
(from user and creator point of view)
api endpoints: get event by id, delete event, edit/update existing event
*/

import { useEffect, useState } from "react";
import { getSingleEvent } from "../services/events";
import { DisplayEventCard } from "../components/EventCard/EventCard";
import type { EventCard } from "../types/event";

// this page will be opened when an event is being clicked on from EventsPage
export function SingleEventDetailsPage() {
    const [event, setEvent] = useState<EventCard | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getSingleEvent(); // TODO: add ID here
                setEvent(data[0] ?? null);
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
        };
        fetchEvent();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!event) {
        return <p>Loading event...</p>;
    }

    return (
        <div>
            <DisplayEventCard event={event} />
        </div>
    );
}