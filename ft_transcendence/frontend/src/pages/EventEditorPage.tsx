import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventInputForm } from "../components/EventInputForm";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventDetail, EventInput } from "../types/api";
import { errorText } from "../utils/formatters";

export function EventEditorPage({ edit }: { edit?: boolean }) {
  const { session } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        <div className="empty-state">{t("events.loading")}</div>
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
        {edit ? t("events.editor.eyebrow_edit") : t("events.editor.eyebrow_new")}
      </p>
      <h1>
        {edit ? t("events.editor.title_edit") : t("events.editor.title_new")}
      </h1>
      <p className="muted">
        {t("events.editor.subtitle")}
      </p>
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <EventInputForm event={event || undefined} onSave={save} />
      )}
    </section>
  );
}
