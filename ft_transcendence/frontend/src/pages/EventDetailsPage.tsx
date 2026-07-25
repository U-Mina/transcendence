import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ActionButton, ActionLink } from "../components/ActionButton";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import { displayTag, type EventDetail } from "../types/api";
import { errorText } from "../utils/formatters";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
          <h1>{t("events.not_found.title")}</h1>
          <p>{error}</p>
          <ActionLink to="/">{t("events.not_found.browse")}</ActionLink>
        </div>
      </section>
    );
  if (!event)
    return (
      <section className="page">
        <div className="empty-state">{t("events.loading")}</div>
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
      !window.confirm(t("events.delete_confirm"))
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
        {i18n.dir() === "rtl" ? "→" : "←"} {t("events.back_to_all")}
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
            {new Date(detail.startTime).toLocaleString(i18n.language, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          <p className="detail-place">
            {detail.location || t("events.location_tba")}
          </p>
          <p className="detail-description">
            {detail.description || t("events.no_desc")}
          </p>
          <p>
            {t("events.hosted_by")}{" "}
            <Link to={`/users/${detail.creator.userId}`}>
              {detail.creator.userName}
            </Link>
          </p>
          {detail.minParticipant && (
            <p className="muted">
              {detail.minParticipant} {t("events.needed_to_happen")}
            </p>
          )}
          <div className="detail-actions">
            {owner ? (
              <>
                <ActionLink to={`/events/${detail.eventId}/edit`}>
                  {t("events.edit")}
                </ActionLink>
                <ActionButton variant="danger" disabled={busy} onClick={remove}>
                  {t("events.delete")}
                </ActionButton>
                {count !== null && (
                  <span className="count-pill">{count} {t("events.joined_count")}</span>
                )}
              </>
            ) : (
              <ActionButton
                variant={joined ? "subtle" : "primary"}
                onClick={joinToggle}
                disabled={busy}
              >
                {busy
                  ? t("events.saving")
                  : joined
                    ? t("events.cancel_spot")
                    : t("events.join")}
              </ActionButton>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
