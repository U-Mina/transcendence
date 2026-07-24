import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventDetail, EventInput } from "../types/api";
import { errorText } from "../utils/formatters";

export function EventEditorPage({ edit }: { edit?: boolean }) {
  const { session } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (edit && eventId)
      transcendenceApi
        .event(eventId)
        .then(setEvent)
        .catch((cause) => setError(errorText(cause)));
  }, [edit, eventId]);

  if (edit && !event && !error) {
    return (
      <div className="page">
        <div className="empty-state">Loading event…</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeSession = session;
  if (event && event.creatorId !== activeSession.user.id) {
    return <Navigate to={`/events/${event.eventId}`} replace />;
  }

  async function save(input: EventInput, image?: File) {
    const result =
      edit && eventId
        ? await transcendenceApi.updateEvent(
            eventId,
            input,
            activeSession.token,
          )
        : await transcendenceApi.createEvent(input, activeSession.token);
    if (image) {
      await transcendenceApi.uploadEventImage(
        result.eventId,
        image,
        activeSession.token,
      );
    }
    navigate(`/events/${result.eventId}`);
  }
  return (
    <section className="page narrow">
      <p className="eyebrow">
        {edit ? "Keep it fresh" : "Host something good"}
      </p>
      <h1>
        arial-label="Edit Event"
        {edit ? "Edit your event" : "Create an event"}
      </h1>
      <p className="muted">
        Clear details make it easier for the right people to say yes.
      </p>
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <EventForm event={event || undefined} onSave={save} />
      )}
    </section>
  );
}
