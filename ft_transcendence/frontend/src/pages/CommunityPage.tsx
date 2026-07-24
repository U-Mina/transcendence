import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { UserProfile } from "../types/api";
import { errorText } from "../utils/formatters";

// list out all users
export function CommunityPage() {
  const { session } = useAuth();
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
      <p className="eyebrow">The people make it</p>
      <h1>Community</h1>
      {error && <p className="form-error">{error}</p>}
      <div className="people-grid">
        {users
          .filter((user) => user.id !== session?.user.id)
          .map((user) => (
            <Link
              className="person-card"
              key={user.id || user.userName}
              to={`/users/${user.id}`}
            >
              <span className="avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  user.userName.slice(0, 1).toUpperCase()
                )}
              </span>
              <strong>{user.userName}</strong>
              <small>View profile</small>
            </Link>
          ))}
      </div>
    </section>
  );
}
