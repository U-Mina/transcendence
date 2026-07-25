import { useState, type FormEvent } from "react";
import type { UserProfile } from "../types/api";
import { errorText, imageIsSupported } from "../utils/formatters";
import { ActionButton } from "./ActionButton";

type Props = {
  profile: UserProfile | null;
  onSave: (input: {
    userName: string;
    userContact: string | null;
    intraUrl: string | null;
    avatar?: File;
  }) => Promise<void>;
};

export function ProfileEditForm({ profile, onSave }: Props) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userName = String(data.get("userName") || "").trim();
    const userContact = String(data.get("userContact") || "").trim();
    const intraUrl = String(data.get("intraUrl") || "").trim();
    const avatar = data.get("avatar");

    if (userName.length < 2 || userName.length > 100) {
      return setError("Name must be between 2 and 100 characters.");
    }

    if (userContact.length > 50) {
      return setError("Contact must be at most 50 characters.");
    }

    if (intraUrl.length > 255) {
      return setError("Intra URL must be at most 255 characters.");
    }

    if (avatar instanceof File && avatar.size && !imageIsSupported(avatar)) {
      return setError("Use a JPEG, PNG, or WebP image under 5 MiB.");
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        userName,
        userContact: userContact || null,
        intraUrl: intraUrl || null,
        avatar: avatar instanceof File && avatar.size ? avatar : undefined,
      });
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack-form profile-edit-form" onSubmit={submit}>
      {/* the validation of user input in frontend */}
      <label>
        Display name
        <input
          name="userName"
          required
          minLength={2}
          maxLength={100}
          defaultValue={profile?.userName}
        />
      </label>
      <label>
        About Me & Contact
        <input
          name="userContact"
          maxLength={50}
          defaultValue={profile?.userContact || ""}
          placeholder="Optional contact detail"
        />
      </label>
      <label>
        Profile URL
        <input
          name="intraUrl"
          type="url"
          maxLength={255}
          defaultValue={profile?.intraUrl || ""}
          placeholder="https://profile.intra.42.fr/users/..."
        />
      </label>
      <label>
        Update avatar
        <input
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ActionButton type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </ActionButton>
    </form>
  );
}
