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

    return (
      <div>
        
      </div>
    );
  }
}
