import { useState } from "react";
// use auth context to get session for verification
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard } from "../types/api";
import { errorText } from "../utils/formatters";

export function DashboardPage() {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  // fetch data from api
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [all, mine] = await Promise.all([
          transcendenceApi.events(),
          session
            ? transcendenceApi.joinedEvents(session.token)
            : Promise.resolve([]),
        ]);

        if (alive) {
          setEvents(all);
          setJoined(new Set(mine.map((event) => event.eventId)));
        }
      } catch (cause) {
        if (alive) setError(errorText(cause));
      } finally {
        if (alive) setLoading(false);
      }
    })();
        return () => {
      alive = false;
    };
  }, [session?.token]);

  const visible = events.filter(
  (event) =>
    (tag === "all" || event.category === tag) &&
    `${event.eventName} ${event.description || ""} ${event.location || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function toggle(event: EventCard) {
    if (!session) return;
    setBusyId(event.eventId);
    try {
      if (joined.has(event.eventId)) {
        await transcendenceApi.cancelJoin(event.eventId, session.token);
        setJoined((current) => {
          const next = new Set(current);
          next.delete(event.eventId);
          return next;
        });
      } else {
        await transcendenceApi.joinEvent(event.eventId, session.token);
        setJoined((current) => new Set(current).add(event.eventId));
      }
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusyId("");
    }
  }

}
