/*
create a page of ONE event in its entirety. 
(from user and creator point of view)
api endpoints: get event by id, delete event, edit/update existing event
*/

import { useEffect, useState } from "react";
import { getSingleEvent } from "../services/events";
import { DisplayEventCard } from "../components/EventCard/EventCard";
import type { EventCard } from "../types/event";
import { useParams } from "react-router-dom";

// TODO: there is a bug when reloading the SingleEventDetailsPage -> shows backenddata without any frontend
// this page will be opened when an event is being clicked on from EventsPage
export function SingleEventDetailsPage() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<EventCard | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // only implemented for getSingleEvent input to work in case eventId does not exist
        if (!eventId) {
            setError("Event ID is missing");
            return;
        }

        const fetchEvent = async () => {
            try {
                const data = await getSingleEvent(eventId);
                setEvent(data);
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
        };

        fetchEvent();
    }, [eventId]); // rerun this effect whenever the id changes, so that the new eventcard will also be shown

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