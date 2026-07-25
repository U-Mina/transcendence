import { useEffect, useState } from "react";
import { ActionLink } from "../components/ActionButton";
import { EventSearchToolbar } from "../components/EventSearchToolbar";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard } from "../types/api";
import { errorText } from "../utils/formatters";

export function DashboardPage() {
  const { session } = useAuth();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    return (
    <section className="page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Community calendar</p>
          <h1>Make time for what matters.</h1>
          <p>
            Discover simple reasons to get out, meet people, and do something
            memorable.
          </p>
        </div>
        {session && <ActionLink to="/events/new">Create an event</ActionLink>}
      </header>
      <EventSearchToolbar
        query={query}
        tag={tag}
        onQueryChange={setQuery}
        onTagChange={setTag}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="empty-state">Loading your next plans…</div>
      ) : visible.length ? (
        <div>
          <div className="event-grid">
            {visible.map((event) => (
              <EventTile
                key={event.eventId}
                event={event}
                joined={joined.has(event.eventId)}
                isOwner={session?.user.id === event.creatorId}
                busy={busyId === event.eventId}
                onJoinToggle={
                  session && session.user.id !== event.creatorId
                    ? () => toggle(event)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>No events found</h2>
          <p>Try a different search, or be the first to make a plan.</p>
          {session && <ActionLink to="/events/new">Create an event</ActionLink>}
        </div>
      )}
    </section>
  )

}
