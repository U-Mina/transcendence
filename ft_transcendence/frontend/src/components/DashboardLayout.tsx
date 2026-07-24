import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActionButton, ActionLink } from "./ActionButton";

// if no avatar uploaded, will use name initial
const initials = (name?: string) =>
  name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "T";

export function DashboardLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span>✦</span>Vibe Checker
        </Link>
        <p className="brand-tagline">Find your people, make a plan.</p>
        <nav aria-label="Primary navigation" className="nav-list">
          <NavLink to="/" end>
            Discover events
          </NavLink>
          {session && <NavLink to="/people">Community</NavLink>}
          {session && (
            <NavLink
              className="nav-create button button-primary"
              to="/events/new"
            >
              Create an event
            </NavLink>
          )}
        </nav>
        <div className="sidebar-account">
          {session ? (
            <>
              <Link className="account-link" to="/profile">
                {session.user.avatarUrl ? (
                  <img src={session.user.avatarUrl} alt="" />
                ) : (
                  <span className="avatar">
                    {initials(session.user.userName)}
                  </span>
                )}
                <span>
                  <strong>{session.user.userName}</strong>
                  <small>View profile</small>
                </span>
              </Link>
              <ActionButton variant="ghost" onClick={signOut}>
                Log out
              </ActionButton>
            </>
          ) : (
            <div className="auth-links">
              <ActionLink variant="ghost" to="/login">
                Log in
              </ActionLink>
              <ActionLink className="small" to="/register">
                Join us
              </ActionLink>
            </div>
          )}
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
