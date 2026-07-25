import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard } from "../types/api";
import { errorText } from "../utils/formatters";
// todo
export function DashboardPage() {
  const { session } = useAuth();
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
      // todo: handle error when fetching joined events
      
    })();
        return () => {
      alive = false;
    };
  }, [session?.token]);

}
