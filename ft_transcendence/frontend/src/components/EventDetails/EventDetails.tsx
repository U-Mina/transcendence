// TODO: first draft just for testing -> improve this later (add all the functionalities when seeing only one event)

import "./EventDetails.css";
import type { EventCard } from "../../types/event.ts"
import eventImage from "../../assets/vite.svg";

// define what component below receives as input (the props)
interface DisplayEventCardProps
{
    event: EventCard;
}

// TODO: this is just a copy from EventCard.tsx for router testing going from EventPage to SingleEventDetailsPage and therefore needs to be changed below for a diff layout
// the actual component (function): render one event card
export function DisplayEventDetails({ event }: DisplayEventCardProps) { // ...
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

                {event.description && (
                    <p className="event-card__description">{event.description}</p>
                )}

                <div className="event-card__actions">
                    <button className="event-card__join" type="button">Join</button>
                </div>
            </div>
        </article>
    );
}