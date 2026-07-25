import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

// this is the view of public available info of per user
export function PublicProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (userId) {
      transcendenceApi
        .user(userId)
        .then(setUser)
        .catch((cause) => setError(errorText(cause)));
    }
  }, [userId]);

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
        <div className="empty-state">Loading profile…</div>
      </section>
    );
  }

  return (
    <section className="page narrow">
      <div className="profile-header public-profile-header">
        <div className="profile-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            user.userName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <p className="eyebrow">Community member</p>
          {/* for availability */}
          <h1>{user.userName}</h1>
          {user.intraName && <p className="muted">{user.intraName}</p>}
        </div>
      </div>
      <section className="panel">
        <h2>About me</h2>
        {user.userContact ? (
          <p>{user.userContact}</p>
        ) : (
          <p className="muted">This person chose not to leave any note.</p>
        )}
        {user.intraUrl && (
          <p style={{ marginTop: "16px" }}>
            <a href={user.intraUrl} target="_blank" rel="noreferrer">
              View profile link ↗
            </a>
          </p>
        )}
      </section>
    </section>
  );
}
