// what happens here: a component that just prints/draws the data of ONE event
/*
- UI piece that's shown on website
- reusable function (take one event matching the blueprint in event.ts & turn visible)
- no changing later
*/

import type { EventCard } from "../../types/event.ts"
import "./EventCard.css";
import eventImage from "../../assets/vite.svg";

// define what component below receives as input (the props)
interface DisplayEventCardProps
{
    event: EventCard;
}

// the actual component (function): render one event card
export function DisplayEventCard({ event }: DisplayEventCardProps) { // ...
    const eventDate = event.startTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const eventTime = event.startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // military time
    });

    // TODO: should there be a cutoff length for the description and be replaced w "..." after max defined length (only here when in the event list page)
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

                <p className="event-card__meta">{event.location ?? "Location: TBD"}</p>

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