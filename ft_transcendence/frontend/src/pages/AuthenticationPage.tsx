import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
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
      return setError("Name must be between 2 and 100 characters.");
    }
    if (password.length > 72) {
      return setError("Password must be at most 72 characters.");
    }

    if (register && password !== String(data.get("passwordConfirm") || "")) {
      return setError("Passwords do not match.");
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
        Your Vibe Checker
      </Link>
      {/* card */}
      <section className="auth-card">
        <p className="eyebrow">
          {register ? "Join the community" : "Welcome back"}
        </p>
        <h1>
          {register
            ? "Make room for more good plans."
            : "Your next plan is waiting."}
        </h1>
        <p className="muted">
          {register
            ? "Create an account to host and join local moments."
            : "Log in to manage your events and connections."}
        </p>
        <form onSubmit={submit} className="stack-form">
          {register && (
            <label>
              Name
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
            Email
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
            Password
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
              Confirm password
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
              ? "Just a moment…"
              : register
                ? "Create account"
                : "Log in"}
          </ActionButton>
        </form>

        {/* when unloggin user use url to vist, will be redirect to login/register first */}
        <p className="auth-switch">
          {register ? "Already a member?" : "New here?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </div>
  );
}
