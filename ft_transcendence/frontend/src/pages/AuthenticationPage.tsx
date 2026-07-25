import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../components/ActionButton";
import { useAuth } from "../context/AuthContext";
import { errorText } from "../utils/formatters";

const returnPath = (state: unknown) =>
  typeof state === "object" &&
  state !== null &&
  "from" in state &&
  typeof (state as { from?: unknown }).from === "string" &&
  (state as { from: string }).from.startsWith("/")
    ? (state as { from: string }).from
    : "/";

export function AuthenticationPage({ register }: { register?: boolean }) {
  const { session, login, register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const userName = String(data.get("userName") || "").trim();
    setError("");

    if (register && (userName.length < 2 || userName.length > 100)) {
      return setError(t("auth.error.name_len"));
    }
    if (password.length > 72) {
      return setError(t("auth.error.password_len"));
    }

    if (register && password !== String(data.get("passwordConfirm") || "")) {
      return setError(t("auth.error.password_match"));
    }

    setPending(true);
    
    try {
      if (register) await signUp(userName, email, password);
      else await login(email, password);
      navigate(returnPath(location.state), { replace: true });
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-page">
      {/* title */}
      <Link className="auth-brand" to="/">
        {t("auth.brand_title")}
      </Link>
      {/* card */}
      <section className="auth-card">
        <p className="eyebrow">
          {register ? t("auth.register_eyebrow") : t("auth.login_eyebrow")}
        </p>
        <h1>
          {register
            ? t("auth.register_title")
            : t("auth.login_title")}
        </h1>
        <p className="muted">
          {register
            ? t("auth.register_desc")
            : t("auth.login_desc")}
        </p>
        <form onSubmit={submit} className="stack-form">
          {register && (
            <label>
              {t("auth.field.name")}
              <input
                name="userName"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </label>
          )}
          {/* email of the format of xx@xx.com */}
          <label>
            {t("auth.field.email")}
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
            />
          </label>
          {/* the validation of password in frontend is just for UX. the true validation is in backend */}
          <label>
            {t("auth.field.password")}
            <input
              name="password"
              type="password"
              required
              minLength={register ? 8 : 1}
              maxLength={72}
              autoComplete="off"
            />
          </label>
          {/* required info for register is name, email and password confirm */}
          {register && (
            <label>
              {t("auth.field.confirm_password")}
              <input
                name="passwordConfirm"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
              />
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <ActionButton type="submit" className="wide" disabled={pending}>
            {pending
              ? t("auth.pending")
              : register
                ? t("auth.create_account")
                : t("auth.login")}
          </ActionButton>
        </form>

        {/* when unloggin user use url to vist, will be redirect to login/register first */}
        <p className="auth-switch">
          {register ? t("auth.switch.already") : t("auth.switch.new")}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? t("auth.login") : t("auth.create_account")}
          </Link>
        </p>
        <nav className="auth-legal" aria-label={t("legal.nav_label")}>
          <Link to="/privacy">{t("legal.privacy_label")}</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms">{t("legal.terms_label")}</Link>
        </nav>
      </section>
    </div>
  );
}
