import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ActionLink } from "./ActionButton";
import { Button } from "./Button";

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
  const { t, i18n } = useTranslation();

  function signOut() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span>✦</span> {t("brand.name")}
        </Link>
        <p className="brand-tagline">{t("brand.tagline")}</p>
        <nav aria-label="Primary navigation" className="nav-list">
          <NavLink to="/" end>
            {t("nav.discover")}
          </NavLink>
          {session && <NavLink to="/people">{t("nav.community")}</NavLink>}
          {session && (
            <NavLink
              className="nav-create button button-primary"
              to="/events/new"
            >
              {t("nav.create")}
            </NavLink>
          )}
        </nav>
        <div
          className="language-switcher"
          style={{
            display: "flex",
            gap: "0.25rem",
            margin: "1rem 0",
            padding: "0 0.5rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>🌐</span>
          {(["en", "fr", "ar", "zh"] as const).map((lang) => (
            <Button
              key={lang}
              variant="ghost"
              size="sm"
              onClick={() => i18n.changeLanguage(lang)}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: i18n.language === lang ? "bold" : "normal",
                textDecoration: i18n.language === lang ? "underline" : "none",
                minHeight: "auto",
                background: i18n.language === lang ? "var(--color-surface)" : "transparent",
              }}
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </div>
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
                  <small>{t("account.view_profile")}</small>
                </span>
              </Link>
              <Button variant="ghost" onClick={signOut}>
                {t("account.logout")}
              </Button>
            </>
          ) : (
            <div className="auth-links">
              <ActionLink variant="ghost" className="small" to="/login">
                {t("account.login")}
              </ActionLink>
              <ActionLink className="small" to="/register">
                {t("account.join_us")}
              </ActionLink>
            </div>
          )}
          <nav className="sidebar-legal" aria-label={t("legal.nav_label")}>
            <Link to="/privacy">{t("legal.privacy_label")}</Link>
            <Link to="/terms">{t("legal.terms_label")}</Link>
          </nav>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
