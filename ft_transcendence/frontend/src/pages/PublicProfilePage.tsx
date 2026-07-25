import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { FriendUser, UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

export function PublicProfilePage() {
  const { userId } = useParams();
  const { session } = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friendship, setFriendship] = useState<FriendUser | null>(null);
  const [isPendingIncoming, setIsPendingIncoming] = useState(false);
  const [isPendingOutgoing, setIsPendingOutgoing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    transcendenceApi
      .user(userId, session?.token)
      .then(setUser)
      .catch((cause) => setError(errorText(cause)));

    if (session?.token) {
      Promise.all([
        transcendenceApi.getFriends(session.token).catch(() => []),
        transcendenceApi.getFriendRequests(session.token).catch(() => ({
          incoming: [],
          outgoing: [],
        })),
      ]).then(([friendsList, requests]) => {
        const friendMatch = friendsList.find((f) => f.id === userId);
        if (friendMatch) {
          setFriendship(friendMatch);
          return;
        }

        const incomingMatch = requests.incoming.find((r) => r.id === userId);
        if (incomingMatch) {
          setIsPendingIncoming(true);
          return;
        }

        const outgoingMatch = requests.outgoing.find((r) => r.id === userId);
        if (outgoingMatch) {
          setIsPendingOutgoing(true);
        }
      });
    }
  }, [userId, session?.token]);

  async function handleAddFriend() {
    if (!session?.token || !userId) return;
    setActionLoading(true);
    try {
      const result = await transcendenceApi.sendFriendRequest(
        userId,
        session.token,
      );
      if (result.status === "accepted") {
        setFriendship(result);
        setIsPendingOutgoing(false);
      } else {
        setIsPendingOutgoing(true);
      }
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveFriend() {
    if (!session?.token || !userId) return;
    setActionLoading(true);
    try {
      await transcendenceApi.removeFriend(userId, session.token);
      setFriendship(null);
      setIsPendingOutgoing(false);
      setIsPendingIncoming(false);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAcceptRequest() {
    if (!session?.token || !userId) return;
    setActionLoading(true);
    try {
      const result = await transcendenceApi.acceptFriendRequest(
        userId,
        session.token,
      );
      setFriendship(result);
      setIsPendingIncoming(false);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return (
      <section className="page">
        <div className="empty-state">{error}</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page">
        <div className="empty-state">{t("profile.public.loading")}</div>
      </section>
    );
  }

  const isSelf = session?.user.id === userId;

  return (
    <section className="page narrow">
      <div className="profile-header public-profile-header">
        <Avatar
          src={user.avatarUrl}
          name={user.userName}
          size="xl"
          className="profile-avatar"
        />
        <div style={{ flex: 1 }}>
          <p className="eyebrow">{t("profile.public.eyebrow")}</p>
          <h1>{user.userName}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
            {user.intraName && <p className="muted" style={{ margin: 0 }}>{user.intraName}</p>}
            <Badge
              variant={user.isOnline ? "success" : "default"}
              size="sm"
            >
              <span className={`status-dot ${user.isOnline ? "online" : "offline"}`} />
              {user.isOnline ? t("friends.online") : t("friends.offline")}
            </Badge>
          </div>
        </div>

        {session && !isSelf && (
          <div style={{ marginLeft: "auto" }}>
            {friendship ? (
              <Button
                variant="subtle"
                loading={actionLoading}
                onClick={handleRemoveFriend}
              >
                {t("friends.remove_friend")}
              </Button>
            ) : isPendingIncoming ? (
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handleAcceptRequest}
              >
                {t("friends.accept")}
              </Button>
            ) : isPendingOutgoing ? (
              <Button
                variant="ghost"
                loading={actionLoading}
                onClick={handleRemoveFriend}
              >
                {t("friends.request_sent")} ({t("friends.cancel_request")})
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handleAddFriend}
              >
                {t("friends.add_friend")}
              </Button>
            )}
          </div>
        )}
      </div>

      <section className="panel">
        <h2>{t("profile.public.about_me")}</h2>
        {user.userContact ? (
          <p>{user.userContact}</p>
        ) : (
          <p className="muted">{t("profile.public.no_note")}</p>
        )}
        {user.intraUrl && (
          <p style={{ marginTop: "16px" }}>
            <a href={user.intraUrl} target="_blank" rel="noreferrer">
              {t("profile.public.view_link")}
            </a>
          </p>
        )}
      </section>
    </section>
  );
}
