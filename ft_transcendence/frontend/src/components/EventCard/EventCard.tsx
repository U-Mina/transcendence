import type { EventCard } from "../../types/event";
import { formatEventDate } from "../../types/event";
import "./EventCard.css";

interface DisplayEventCardProps {
    event: EventCard;
    onSelect?: (eventId: string) => void;
    onDelete?: (eventId: string) => void;
    canDelete?: boolean;
}

export function DisplayEventCard({
    event,
    onSelect,
    onDelete,
    canDelete,
}: DisplayEventCardProps) {
    return (
        <article className="event-card">
            <div className="event-card__header">
                <h3>{event.eventName}</h3>
                {event.category && (
                    <span className="event-card__category">{event.category}</span>
                )}
            </div>
            <p className="event-card__time">
                {formatEventDate(event.startTime)} → {formatEventDate(event.endTime)}
            </p>
            {event.location && <p className="event-card__meta">{event.location}</p>}
            {event.description && (
                <p className="event-card__description">{event.description}</p>
            )}
            <div className="event-card__actions">
                {onSelect && (
                    <button type="button" onClick={() => onSelect(event.eventId)}>
                        View details
                    </button>
                )}
                {canDelete && onDelete && (
                    <button
                        type="button"
                        className="danger"
                        onClick={() => onDelete(event.eventId)}
                    >
                        Delete
                    </button>
                )}
            </div>
        </article>
    );
}
