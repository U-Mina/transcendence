import "./EventDetails.css";
import type { EventDetailView } from "../../types/event.ts"
import type { InternalUserEntity } from "../../types/user.ts";
import eventImage from "../../assets/vite.svg";

// define what component below receives as input (the props)
interface DisplayEventDetailsProps
{
    event: EventDetailView;
    users: InternalUserEntity[];
}

// TODO: add edit & delete button BUT only if the user is the creator of the event
export function DisplayEventDetails({ event, users }: DisplayEventDetailsProps) {
    const eventDate = event.startTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const eventTime = event.startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // military time
    });

    return (
        <article className="event-card"> 
            <img className="event-card__image" src={eventImage} alt={event.eventName} />

            <div className="event-card__content">
                <div className="event-card__title-row">
                    <h3 className="event-card__title">{event.eventName}</h3>
                    <button className="event-card__save" type="button" aria-label="Save event">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0L12 7.9 8.7 4.6c-1.5-1.5-4-1.5-5.5 0s-1.5 4 0 5.5L12 19l8.8-8.9c1.5-1.5 1.5-4 0-5.5z" />
                        </svg>
                    </button>
                </div>

                <p className="event-card__time">{eventDate} • {eventTime}</p>

                <p className="event-card__location">{event.location ?? "Location: TBD"}</p>

                <p className="event-card__creator">Created by: {event.creator.userName}</p>

                {event.description && (
                    <p className="event-card__description">{event.description}</p>
                )}

                <p className="event-card__users">
                    Users: {users.length ? users.map((user) => user.userName).join(", ") : "None"}
                </p>

                <div className="event-card__actions">
                    <button className="event-card__join" type="button">Join</button>
                </div>

            </div>
        </article>
    );
}
