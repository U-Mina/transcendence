import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert } from "../components/Alert";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

// list out all users
export function CommunityPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (session)
      transcendenceApi
        .users(session.token)
        .then(setUsers)
        .catch((cause) => setError(errorText(cause)));
  }, [session?.token]);
  return (
    <section className="page">
      <p className="eyebrow">{t("community.eyebrow")}</p>
      <h1>{t("community.title")}</h1>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="people-grid">
        {users
          .filter((user) => user.id !== session?.user.id)
          .map((user) => (
            <Link
              key={user.id || user.userName}
              to={`/users/${user.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card hoverable className="person-card">
                <Avatar
                  src={user.avatarUrl}
                  name={user.userName}
                  size="md"
                />
                <strong>{user.userName}</strong>
                <small>{t("community.view_profile")}</small>
              </Card>
            </Link>
          ))}
      </div>
    </section>
  );
}
