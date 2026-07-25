import { useState, type FormEvent } from "react";
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

export function EventInputForm({ event, onSave }: Props) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const defaultTag = EVENT_TAGS.includes(event?.category as EventTag)
    ? event?.category
    : "";

  async function submit(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const data = new FormData(form.currentTarget);
    const eventName = String(data.get("eventName") || "").trim();
    const category = String(data.get("category") || "");
    const start = new Date(String(data.get("startTime")));
    const end = new Date(String(data.get("endTime")));
    const image = data.get("image");
    const minimumText = String(data.get("minParticipant") || "");
    const minParticipant = minimumText ? Number(minimumText) : undefined;
    setError("");

    // validate event name with resonable max length
    if (!eventName || eventName.length > 255) {
      return setError(
        "Event name is required and must be at most 255 characters.",
      );
    }

    // required field with enum value
    if (!EVENT_TAGS.includes(category as EventTag)) {
      return setError("Choose one of the available tags.");
    }
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date()
    ) {
      return setError("Start time must be in the future.");
    }

    // frontend validation: end time must be after start time, also exist in service -> eventservice
    if (end <= start) {
      return setError("End time must be after start time.");
    }

    // min people to attend
    if (
      minParticipant !== undefined &&
      (!Number.isInteger(minParticipant) || minParticipant < 1)
    ) {
      return setError("Minimum participants must be a positive whole number.");
    }

    // image file validation: only allow jpeg, png, webp and under 5mb
    if (image instanceof File && image.size && !imageIsSupported(image)) {
      return setError("Use a JPEG, PNG, or WebP image under 5 MiB.");
    }

    // call onSave callback
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

  return (
    <form className="event-form" onSubmit={submit}>
      <div className="form-grid">
        {/* event input form */}
        <label className="full">
          Event name
          <input
            name="eventName"
            required
            maxLength={255}
            defaultValue={event?.eventName}
            autoComplete="off"
          />
        </label>
        <label>
          Start
          <input
            name="startTime"
            type="datetime-local"
            required
            autoComplete="off"
            defaultValue={event ? toLocalInput(event.startTime) : ""}
          />
        </label>
        <label>
          End
          <input
            name="endTime"
            type="datetime-local"
            required
            autoComplete="off"
            defaultValue={event ? toLocalInput(event.endTime) : ""}
          />
        </label>

      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ActionButton type="submit" disabled={pending}>
        {pending ? "Saving…" : event ? "Save changes" : "Publish event"}
      </ActionButton>
    </form>
  );

}