import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { displayTag, type EventCard } from "../types/api";
import { ActionLink } from "./ActionButton";
import { Badge } from "./Badge";
import { Button } from "./Button";

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
  const { t, i18n } = useTranslation();
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
          {date.toLocaleDateString(i18n.language, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          ·{" "}
          {date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}
        </p>
        <Link to={`/events/${event.eventId}`}>
          <h2>{event.eventName}</h2>
        </Link>
        <p className="event-place">
          {event.location || t("events.location_tba")}
        </p>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
        <div className="event-footer">
          <Badge variant="soft">
            {t(`tags.${event.category || "Uncategorized"}`, {
              defaultValue: displayTag(event.category),
            })}
          </Badge>
          {isOwner ? (
            <ActionLink variant="subtle" to={`/events/${event.eventId}/edit`}>
              {t("events.tile.manage")}
            </ActionLink>
          ) : (
            onJoinToggle && (
              <Button
                variant={joined ? "subtle" : "primary"}
                loading={busy}
                onClick={onJoinToggle}
              >
                {joined ? t("events.tile.cancel") : t("events.tile.join")}
              </Button>
            )
          )}
        </div>
      </div>
    </article>
  );
}
