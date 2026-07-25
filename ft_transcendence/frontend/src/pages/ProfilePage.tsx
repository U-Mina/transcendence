import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/Alert";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { EventTile } from "../components/EventTile";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard, UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

export function ProfilePage() {
  const { session, logout, updateSessionUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [joined, setJoined] = useState<EventCard[]>([]);
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (session) {
      Promise.all([
        transcendenceApi.user(session.user.id, session.token),
        transcendenceApi.joinedEvents(session.token),
      ])
        .then(([user, events]) => {
          setProfile(user);
          setJoined(events);
        })
        .catch((cause) => setError(errorText(cause)));
    }
  }, [session?.token, session?.user.id]);

  if (!session) {
    return null;
  }

  const activeSession = session;
  async function save(input: {
    userName: string;
    userContact: string | null;
    intraUrl: string | null;
    avatar?: File;
  }) {
    const user = await transcendenceApi.updateUser(
      activeSession.user.id,
      {
        userName: input.userName,
        userContact: input.userContact,
        intraUrl: input.intraUrl,
      },
      activeSession.token,
    );
    const avatar = input.avatar
      ? (await transcendenceApi.uploadAvatar(input.avatar, activeSession.token))
        .avatarUrl
      : user.avatarUrl;
    setProfile({ ...user, avatarUrl: avatar });
    updateSessionUser({ userName: user.userName, avatarUrl: avatar });
  }

  // delete one's account
  async function confirmDeleteAccount() {
    try {
      await transcendenceApi.deleteUser(
        activeSession.user.id,
        activeSession.token,
      );
      logout();
      navigate("/register");
    } catch (cause) {
      setError(errorText(cause));
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <section className="page">
      <div className="profile-header">
        <Avatar
          size="xl"
          src={profile?.avatarUrl}
          name={profile?.userName || activeSession.user.userName || "?"}
          className="profile-avatar"
        />
        <div>
          <p className="eyebrow">{t("profile.eyebrow")}</p>
          <h1>
            {profile?.userName || t("profile.title_fallback")}
          </h1>
          <p className="muted">
            {profile?.userEmail || activeSession.user.userEmail}
          </p>
        </div>
      </div>
      <div className="profile-layout">
        <section className="panel">
          <h2>{t("profile.edit_heading")}</h2>
          <ProfileEditForm profile={profile} onSave={save} />
          {error && (
            <Alert variant="error" onDismiss={() => setError("")}>
              {error}
            </Alert>
          )}
          <div style={{ marginTop: "24px" }}>
            <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
              {t("profile.delete_account")}
            </Button>
          </div>
        </section>

        <Modal
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          title={t("profile.delete_account")}
          footer={
            <>
              <Button variant="subtle" onClick={() => setConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteAccount}>
                {t("profile.delete_account")}
              </Button>
            </>
          }
        >
          <p style={{ margin: 0 }}>{t("profile.delete_confirm")}</p>
        </Modal>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("profile.plans_eyebrow")}</p>
              <h2>{t("profile.joined_heading")}</h2>
            </div>
          </div>
          {joined.length ? (
            <div className="event-grid compact">
              {joined.map((item) => (
                <EventTile
                  key={item.eventId}
                  event={item}
                  joined
                  isOwner={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              size="small"
              description={t("profile.empty_joined")}
              action={<Link to="/">{t("profile.explore_events")}</Link>}
            />
          )}
        </section>
      </div>
    </section>
  );
}
