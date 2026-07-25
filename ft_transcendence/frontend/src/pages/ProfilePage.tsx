import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActionButton } from "../components/ActionButton";
import { EventTile } from "../components/EventTile";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard, UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

export function ProfilePage() {
  const { session, logout, updateSessionUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [joined, setJoined] = useState<EventCard[]>([]);
  const [error, setError] = useState("");

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
  async function deleteAccount() {
    if (!window.confirm("Delete your account permanently?")) return;
    try {
      await transcendenceApi.deleteUser(
        activeSession.user.id,
        activeSession.token,
      );
      logout();
      navigate("/register");
    } catch (cause) {
      setError(errorText(cause));
    }
  }

  return (
    <section className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" />
          ) : (
            profile?.userName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <p className="eyebrow">Your corner of Transcendence</p>
          <h1>
            {profile?.userName || "Your profile"}
          </h1>
          <p className="muted">
            {profile?.userEmail || activeSession.user.userEmail}
          </p>
        </div>
      </div>
      <div className="profile-layout">
        <section className="panel">
          <h2>Edit profile</h2>
          <ProfileEditForm profile={profile} onSave={save} />
          {error && <p className="form-error">{error}</p>}
          <div style={{ marginTop: '24px' }}>
            <ActionButton variant="danger" onClick={deleteAccount}>
              Delete account
            </ActionButton>
          </div>
        </section>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your plans</p>
              <h2>Joined events</h2>
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
            <div className="empty-state small">
              <p>You have not joined anything yet.</p>
              <Link to="/">Explore events</Link>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
