import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActionButton, ActionLink } from "../components/ActionButton";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import { displayTag, type EventDetail } from "../types/api";
import { errorText } from "../utils/formatters";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    (async () => {
      try {
        const detail = await transcendenceApi.event(eventId);
        const mine = session
          ? await transcendenceApi.joinedEvents(session.token)
          : [];
        if (!alive) return;
        setEvent(detail);
        setJoined(mine.some((item) => item.eventId === eventId));
        if (session && session.user.id === detail.creatorId)
          setCount(await transcendenceApi.joinedCount(eventId, session.token));
      } catch (cause) {
        if (alive) setError(errorText(cause));
      }
    })();
    return () => {
      alive = false;
    };
  }, [eventId, session?.token, session?.user.id]);
  if (error)
    return (
      <section className="page">
        <div className="empty-state">
          <h1>We couldn’t find that event.</h1>
          <p>{error}</p>
          <ActionLink to="/">Browse events</ActionLink>
        </div>
      </section>
    );
  if (!event)
    return (
      <section className="page">
        <div className="empty-state">Loading event…</div>
      </section>
    );
  const detail = event;
  const activeSession = session;
  const owner = activeSession?.user.id === detail.creatorId;
  async function joinToggle() {
    if (!activeSession)
      return navigate("/login", {
        state: { from: `/events/${detail.eventId}` },
      });
    setBusy(true);
    try {
      if (joined)
        await transcendenceApi.cancelJoin(detail.eventId, activeSession.token);
      else
        await transcendenceApi.joinEvent(detail.eventId, activeSession.token);
      setJoined(!joined);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !activeSession ||
      !window.confirm("Delete this event? This cannot be undone.")
    )
      return;
    setBusy(true);
    try {
      await transcendenceApi.deleteEvent(detail.eventId, activeSession.token);
      navigate("/");
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page">
      <Link className="back-link" to="/">
        ← All events
      </Link>
      <article className="event-detail">
        <div className="detail-image">
          {detail.imageUrl ? (
            <img src={detail.imageUrl} alt="" />
          ) : (
            <span>✦</span>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{displayTag(detail.category)}</p>
          <h1>{detail.eventName}</h1>
          <p className="detail-time">
            {new Date(detail.startTime).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <p className="detail-place">
            {detail.location || "Location to be announced"}
          </p>
          <p className="detail-description">
            {detail.description || "The host has not added a description yet."}
          </p>
          <p>
            Hosted by{" "}
            <Link to={`/users/${detail.creator.userId}`}>
              {detail.creator.userName}
            </Link>
          </p>
          {detail.minParticipant && (
            <p className="muted">
              {detail.minParticipant} people needed to make it happen
            </p>
          )}
          <div className="detail-actions">
            {owner ? (
              <>
                <ActionLink to={`/events/${detail.eventId}/edit`}>
                  Edit event
                </ActionLink>
                <ActionButton variant="danger" disabled={busy} onClick={remove}>
                  Delete
                </ActionButton>
                {count !== null && (
                  <span className="count-pill">{count} joined</span>
                )}
              </>
            ) : (
              <ActionButton
                variant={joined ? "subtle" : "primary"}
                onClick={joinToggle}
                disabled={busy}
              >
                {busy
                  ? "Saving…"
                  : joined
                    ? "Cancel your spot"
                    : "Join this event"}
              </ActionButton>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
