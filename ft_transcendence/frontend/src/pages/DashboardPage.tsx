import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard } from "../types/api";
import { errorText } from "../utils/formatters";
// todo
export function DashboardPage() {
  const { session } = useAuth();
  const [events, setEvents] = useState<EventCard[]>([]);

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

}
