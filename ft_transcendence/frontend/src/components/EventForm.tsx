import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  EVENT_TAGS,
  type EventDetail,
  type EventInput,
  type EventTag,
} from "../types/api";
import { errorText, imageIsSupported, toLocalInput } from "../utils/formatters";
import { ActionButton } from "./ActionButton";

type Props = {
  event?: EventDetail;
  onSave: (input: EventInput, image?: File) => Promise<void>;
};

export function EventForm({ event, onSave }: Props) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const defaultTag = EVENT_TAGS.includes(event?.category as EventTag)
    ? event?.category
    : "";

  async function submit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();

    // sanitize user input for event form
    const data = new FormData(form.currentTarget);
    const eventName = String(data.get("eventName") || "").trim();
    const category = String(data.get("category") || "");
    const start = new Date(String(data.get("startTime")));
    const end = new Date(String(data.get("endTime")));
    const image = data.get("image");
    const minimumText = String(data.get("minParticipant") || "");
    const minParticipant = minimumText ? Number(minimumText) : undefined;

    setError("");

    if (!eventName || eventName.length > 255) {
      return setError(t("events.form.error.name_req"));
    }
    if (!EVENT_TAGS.includes(category as EventTag))
      return setError(t("events.form.error.tag_req"));
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date()
    )
      return setError(t("events.form.error.start_fut"));
    if (end <= start) {
      return setError(t("events.form.error.end_after"));
    }

    if (
      minParticipant !== undefined &&
      (!Number.isInteger(minParticipant) || minParticipant < 1)
    )
      return setError(t("events.form.error.min_pos"));
    if (image instanceof File && image.size && !imageIsSupported(image))
      return setError(t("events.form.error.img_sup"));
    setPending(true);
    try {
      await onSave(
        {
          eventName,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          category: category as EventTag,
          location: String(data.get("location") || "").trim() || undefined,
          description:
            String(data.get("description") || "").trim() || undefined,
          minParticipant,
        },
        image instanceof File && image.size ? image : undefined,
      );
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  // event form with required and optional field
  return (
    <form className="event-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="full">
          {t("events.form.name_label")}
          <input
            name="eventName"
            required
            maxLength={255}
            defaultValue={event?.eventName}
            autoComplete="off"
          />
        </label>
        <label>
          {t("events.form.start_label")}
          <input
            name="startTime"
            type="datetime-local"
            required
            autoComplete="off"
            defaultValue={event ? toLocalInput(event.startTime) : ""}
          />
        </label>
        <label>
          {t("events.form.end_label")}
          <input
            name="endTime"
            type="datetime-local"
            required
            autoComplete="off"
            defaultValue={event ? toLocalInput(event.endTime) : ""}
          />
        </label>
        <label>
          {t("events.form.tag_label")}
          <select name="category" required defaultValue={defaultTag}>
            <option value="" disabled>
              {t("events.form.choose_tag")}
            </option>
            {EVENT_TAGS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("events.form.min_label")}
          <input
            name="minParticipant"
            type="number"
            min="1"
            step="1"
            autoComplete="off"
            defaultValue={event?.minParticipant}
          />
        </label>
        <label className="full">
          {t("events.form.location_label")}
          <input
            name="location"
            maxLength={255}
            autoComplete="off"
            defaultValue={event?.location || ""}
            placeholder={t("events.form.location_placeholder")}
          />
        </label>
        <label className="full">
          {t("events.form.desc_label")}
          <textarea
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={event?.description || ""}
            placeholder={t("events.form.desc_placeholder")}
          />
        </label>
        <label className="full">
          {t("events.form.image_label")}
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </label>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ActionButton type="submit" disabled={pending}>
        {pending ? t("events.saving") : event ? t("events.form.save_changes") : t("events.form.publish")}
      </ActionButton>
    </form>
  );
}
