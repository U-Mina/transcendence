import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/Alert";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { FriendRequestsResponse, FriendUser } from "../types/api";
import { errorText } from "../utils/formatters";

export function FriendsPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequestsResponse>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reloadData = () => {
    if (!session?.token) return;
    setLoading(true);
    Promise.all([
      transcendenceApi.getFriends(session.token).catch(() => []),
      transcendenceApi.getFriendRequests(session.token).catch(() => ({ incoming: [], outgoing: [] })),
    ])
      .then(([f, r]) => {
        setFriends(f);
        setRequests(r);
      })
      .catch((cause) => setError(errorText(cause)))
      .finally(() => setLoading(false));
  };

  useEffect(reloadData, [session?.token]);

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      reloadData();
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  const hasContent = friends.length > 0 || requests.incoming.length > 0 || requests.outgoing.length > 0;

  return (
    <section className="page">
      <p className="eyebrow">{t("friends.eyebrow")}</p>
      <h1>{t("friends.title")}</h1>

      {error && <Alert variant="error" onDismiss={() => setError("")}>{error}</Alert>}

      {loading ? (
        <div className="empty-state small">Loading...</div>
      ) : !hasContent ? (
        <EmptyState
          size="small"
          description={t("friends.empty_friends")}
          action={<Link to="/people">{t("nav.community")}</Link>}
        />
      ) : (
        <div style={{ display: "grid", gap: "32px" }}>
          {/* Pending Incoming Requests */}
          {requests.incoming.length > 0 && (
            <section>
              <h2>{t("friends.incoming_header")}</h2>
              <div className="people-grid">
                {requests.incoming.map((req) => (
                  <Card key={req.id} className="friend-card">
                    <Avatar src={req.avatarUrl} name={req.userName} size="md" />
                    <strong>{req.userName}</strong>
                    <div className="friend-card-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(() => transcendenceApi.acceptFriendRequest(req.id, session!.token))}
                      >
                        {t("friends.accept")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(() => transcendenceApi.rejectFriendRequest(req.id, session!.token))}
                      >
                        {t("friends.reject")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Friends List */}
          {friends.length > 0 && (
            <section>
              <h2>{t("friends.title")} ({friends.length})</h2>
              <div className="people-grid">
                {friends.map((friend) => (
                  <Card key={friend.id} className="friend-card">
                    <Link to={`/users/${friend.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <Avatar src={friend.avatarUrl} name={friend.userName} size="md" />
                    </Link>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <strong style={{ display: "block" }}>{friend.userName}</strong>
                      <div>
                        <Badge variant={friend.isOnline ? "success" : "default"} size="sm">
                          <span className={`status-dot ${friend.isOnline ? "online" : "offline"}`} />
                          {friend.isOnline ? t("friends.online") : t("friends.offline")}
                        </Badge>
                      </div>
                    </div>
                    <div className="friend-card-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(() => transcendenceApi.removeFriend(friend.id, session!.token))}
                      >
                        {t("friends.remove_friend")}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
