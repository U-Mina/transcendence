/*
create a page of ONE event in its entirety. 
(from user and creator point of view)
api endpoints: get event by id, delete event, edit/update existing event
*/

import { useEffect, useState } from "react";
import { cancelEventJoin, deleteEvent, getJoinedCount, getSingleEvent, joinEvent } from "../services/events";
import { getAuthSession } from "../services/auth";
import { DisplayEventDetails } from "../components/EventDetails/EventDetails";
import type { EventDetailView } from "../types/event";
import { useNavigate, useParams } from "react-router-dom";

// TODO: there is a bug when reloading the SingleEventDetailsPage -> shows backenddata without any frontend
// this page will be opened when an event is being clicked on from EventsPage
export function SingleEventDetailsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const currentUserId = getAuthSession()?.user.id;
    const [event, setEvent] = useState<EventDetailView | null>(null);
    const [joinedCount, setJoinedCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinPending, setIsJoinPending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

                // if logged-in user is creator of that event, user can see joined participants
                if (data.creator.userId === currentUserId) {
                    const count = await getJoinedCount(eventId);
                    setJoinedCount(count);
                }
            }
            catch (error) {
                console.error("Error:", error);
                setError(error instanceof Error ? error.message : "Something went wrong");
            }
        };

        fetchEvent();
    }, [eventId, currentUserId]); // rerun this effect whenever the id changes, so that the current called event & user will be shown

    // join event button process
    const handleJoin = async () => {
        if (!eventId) 
            return;

        setIsJoinPending(true);
        try {
            if (isJoined) {
                await cancelEventJoin(eventId);
            } else {
                await joinEvent(eventId);
            }
            setIsJoined(!isJoined);
            setJoinedCount((count) => count === null ? count : count + (isJoined ? -1 : 1));
        } catch (error) {
            console.error("Error:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsJoinPending(false);
        }
    };

    // delete event button process
    const handleDelete = async () => {
        if (!eventId || !window.confirm("Are you sure you want to delete this event?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteEvent(eventId);
            navigate("/events");
        } catch (error) {
            console.error("Error:", error);
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!event) {
        return <p>Loading event...</p>;
    }

    // includes check if the logged-in user is creator of event -> if yes, user will see the join-count, edit, delete
    // TODO: for Edit button below -> add link/navigate to /edit once page is created
    return (
        <div>
            <DisplayEventDetails event={event} />
            {event.creator.userId === currentUserId && joinedCount !== null && (
                <p>{joinedCount} joined</p>
            )}
            {event.creator.userId === currentUserId && (
                <div>
                    <button type="button">Edit</button>
                    <button type="button" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            )}
            <button onClick={handleJoin} disabled={isJoinPending}>
                {isJoinPending ? "Loading..." : isJoined ? "Joined" : "Join"}
            </button>
        </div>
    );
}
