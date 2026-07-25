import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      return setError(t("profile.form.error.name_len"));
    }

    if (userContact.length > 50) {
      return setError(t("profile.form.error.contact_len"));
    }

    if (intraUrl.length > 255) {
      return setError(t("profile.form.error.url_len"));
    }

    if (avatar instanceof File && avatar.size && !imageIsSupported(avatar)) {
      return setError(t("profile.form.error.avatar_size"));
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
        {t("profile.form.name_label")}
        <input
          name="userName"
          required
          minLength={2}
          maxLength={100}
          defaultValue={profile?.userName}
        />
      </label>
      <label>
        {t("profile.form.contact_label")}
        <input
          name="userContact"
          maxLength={50}
          defaultValue={profile?.userContact || ""}
          placeholder={t("profile.form.contact_placeholder")}
        />
      </label>
      <label>
        {t("profile.form.url_label")}
        <input
          name="intraUrl"
          type="url"
          maxLength={255}
          defaultValue={profile?.intraUrl || ""}
          placeholder={t("profile.form.url_placeholder")}
        />
      </label>
      <label>
        {t("profile.form.avatar_label")}
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
        {saving ? t("profile.form.saving") : t("profile.form.save")}
      </ActionButton>
    </form>
  );
}
