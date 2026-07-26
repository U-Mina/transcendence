import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionLink } from "../components/ActionButton";
import { EventSearchToolbar } from "../components/EventSearchToolbar";
import { useAuth } from "../context/AuthContext";
import { transcendenceApi } from "../lib/transcendenceApi";
import type { EventCard } from "../types/api";
import { errorText } from "../utils/formatters";
import { EventTile } from "../components/EventTile";

export function DashboardPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventCard[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("startTime:asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  // reload events from the API whenever search, sorting, or page options change
  // before advanced search: browser fethced all events & searched thru itself
  // now page sends current controls to api
  // when any value in .events changes, useeffect runs again and reloads
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [sortField, order] = sort.split(":") as ["startTime" | "eventName", "asc" | "desc"];
        const [result, mine] = await Promise.all([
          transcendenceApi.events({
            q: query,
            category: tag === "all" ? undefined : tag,
            sort: sortField,
            order,
            page,
            pageSize,
          }),
          session
            ? transcendenceApi.joinedEvents(session.token)
            : Promise.resolve([]),
        ]);

        if (alive) {
          setEvents(result.items);
          setTotalPages(result.totalPages);
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
  }, [page, pageSize, query, session?.token, sort, tag]);

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
          <p className="eyebrow">{t("dashboard.eyebrow")}</p>
          <h1>{t("dashboard.title")}</h1>
          <p>
            {t("dashboard.subtitle")}
          </p>
        </div>
        {session && <ActionLink to="/events/new">{t("dashboard.create")}</ActionLink>}
      </header>
      <EventSearchToolbar
        query={query}
        tag={tag}
        sort={sort}
        pageSize={pageSize}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
        onTagChange={(value) => {
          setTag(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSort(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <div className="empty-state">{t("dashboard.loading")}</div>
      ) : events.length ? (
        <div>
          <div className="event-grid">
            {events.map((event) => (
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
          {totalPages > 0 && (
            <div className="pagination" aria-label={t("pagination.aria_label")}>
              <button type="button" onClick={() => setPage(page - 1)} disabled={page === 1}>
                {t("pagination.previous")}
              </button>
              <span>{t("pagination.status", { page, totalPages })}</span>
              <button type="button" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                {t("pagination.next")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t("dashboard.empty.title")}</h2>
          <p>{t("dashboard.empty.subtitle")}</p>
          {session && <ActionLink to="/events/new">{t("dashboard.create")}</ActionLink>}
        </div>
      )}
    </section>
  );
}
