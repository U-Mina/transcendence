import { Link } from "react-router-dom";
import { displayTag, type EventCard } from "../types/api";
import { ActionButton, ActionLink } from "./ActionButton";

type Props = {
  event: EventCard;
  joined: boolean;
  isOwner: boolean;
  busy?: boolean;
  onJoinToggle?: () => void;
};

export function EventTile({
  event,
  joined,
  isOwner,
  busy,
  onJoinToggle,
}: Props) {
  const date = new Date(event.startTime);
  return (
    <article className="event-tile">
      <Link
        to={`/events/${event.eventId}`}
        className="event-image"
        aria-label={`Open ${event.eventName}`}
      >
        {event.imageUrl ? <img src={event.imageUrl} alt="" /> : <span>✦</span>}
      </Link>
      <div className="event-copy">
        <p className="event-date">
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          ·{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <Link to={`/events/${event.eventId}`}>
          <h2>{event.eventName}</h2>
        </Link>
        <p className="event-place">
          {event.location || "Location to be announced"}
        </p>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
        <div className="event-footer">
          <span className="tag">{displayTag(event.category)}</span>
          {isOwner ? (
            <ActionLink variant="subtle" to={`/events/${event.eventId}/edit`}>
              Manage
            </ActionLink>
          ) : (
            onJoinToggle && (
              <ActionButton
                variant={joined ? "subtle" : "primary"}
                disabled={busy}
                onClick={onJoinToggle}
              >
                {busy ? "Saving…" : joined ? "Cancel" : "Join event"}
              </ActionButton>
            )
          )}
        </div>
      </div>
    </article>
  );
}
