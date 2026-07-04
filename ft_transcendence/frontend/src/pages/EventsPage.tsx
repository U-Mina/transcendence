import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DisplayEventCard } from "../components/EventCard/EventCard";
import type {
    CreateEventDTO,
    EventCard,
    EventDetailView,
    UpdateEventDTO,
} from "../types/event";
import { formatEventDate } from "../types/event";

function defaultStartTime(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date.toISOString().slice(0, 16);
}

function defaultEndTime(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date.toISOString().slice(0, 16);
}

export function EventsPage() {
    const { userId } = useAuth();
    const [events, setEvents] = useState<EventCard[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<EventDetailView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<CreateEventDTO>({
        eventName: "",
        startTime: defaultStartTime(),
        endTime: defaultEndTime(),
        category: "",
        description: "",
        location: "",
    });

    const [editForm, setEditForm] = useState<UpdateEventDTO>({});

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await api.getEvents(userId);
        if (result.ok) {
            setEvents(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        void loadEvents();
    }, [loadEvents]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return;
        }

        void (async () => {
            const result = await api.getEvent(selectedId, userId);
            if (result.ok) {
                setDetail(result.data);
                setEditForm({
                    eventName: result.data.eventName,
                    category: result.data.category ?? "",
                    description: result.data.description ?? "",
                    location: result.data.location ?? "",
                });
            } else {
                setError(result.error);
            }
        })();
    }, [selectedId, userId]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!userId) {
            setError("Select a user before creating an event.");
            return;
        }

        const payload: CreateEventDTO = {
            ...createForm,
            startTime: new Date(createForm.startTime).toISOString(),
            endTime: new Date(createForm.endTime).toISOString(),
        };

        const result = await api.createEvent(payload, userId);
        if (result.ok) {
            setMessage(`Created event "${result.data.eventName}"`);
            setCreateForm({
                eventName: "",
                startTime: defaultStartTime(),
                endTime: defaultEndTime(),
                category: "",
                description: "",
                location: "",
            });
            await loadEvents();
        } else {
            setError(result.error);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedId || !userId) return;

        setMessage(null);
        setError(null);

        const result = await api.updateEvent(selectedId, editForm, userId);
        if (result.ok) {
            setMessage("Event updated.");
            await loadEvents();
            setSelectedId(result.data.eventId);
        } else {
            setError(result.error);
        }
    }

    async function handleDelete(eventId: string) {
        if (!userId) {
            setError("Select a user before deleting an event.");
            return;
        }

        if (!window.confirm("Delete this event?")) return;

        setMessage(null);
        setError(null);

        const result = await api.deleteEvent(eventId, userId);
        if (result.ok) {
            setMessage("Event deleted.");
            if (selectedId === eventId) setSelectedId(null);
            await loadEvents();
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="page">
            <div className="page__toolbar">
                <h2>Events</h2>
                <button type="button" className="secondary" onClick={() => void loadEvents()}>
                    Refresh
                </button>
            </div>

            {error && <p className="alert alert--error">{error}</p>}
            {message && <p className="alert alert--success">{message}</p>}

            <div className="split">
                <section className="panel">
                    <h3>Create event</h3>
                    <form className="form" onSubmit={handleCreate}>
                        <label>
                            Name
                            <input
                                required
                                value={createForm.eventName}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, eventName: e.target.value })
                                }
                            />
                        </label>
                        <div className="form__row">
                            <label>
                                Start
                                <input
                                    type="datetime-local"
                                    required
                                    value={createForm.startTime}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, startTime: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                End
                                <input
                                    type="datetime-local"
                                    required
                                    value={createForm.endTime}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, endTime: e.target.value })
                                    }
                                />
                            </label>
                        </div>
                        <label>
                            Category
                            <input
                                value={createForm.category ?? ""}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, category: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Location
                            <input
                                value={createForm.location ?? ""}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, location: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Description
                            <textarea
                                rows={3}
                                value={createForm.description ?? ""}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, description: e.target.value })
                                }
                            />
                        </label>
                        <button type="submit">POST /api/v1/events</button>
                    </form>
                </section>

                <section className="panel">
                    <h3>Event list</h3>
                    {loading ? (
                        <p>Loading…</p>
                    ) : events.length === 0 ? (
                        <p className="muted">No events returned.</p>
                    ) : (
                        <div className="card-grid">
                            {events.map((event) => (
                                <DisplayEventCard
                                    key={event.eventId}
                                    event={event}
                                    onSelect={setSelectedId}
                                    onDelete={handleDelete}
                                    canDelete={Boolean(userId)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {detail && (
                <section className="panel panel--detail">
                    <div className="page__toolbar">
                        <h3>Event detail</h3>
                        <button type="button" className="ghost" onClick={() => setSelectedId(null)}>
                            Close
                        </button>
                    </div>
                    <dl className="detail-list">
                        <div>
                            <dt>ID</dt>
                            <dd><code>{detail.eventId}</code></dd>
                        </div>
                        <div>
                            <dt>Creator</dt>
                            <dd>{detail.creator.userName}</dd>
                        </div>
                        <div>
                            <dt>Start</dt>
                            <dd>{formatEventDate(detail.startTime)}</dd>
                        </div>
                        <div>
                            <dt>End</dt>
                            <dd>{formatEventDate(detail.endTime)}</dd>
                        </div>
                    </dl>

                    <form className="form" onSubmit={handleUpdate}>
                        <h4>Update (creator only)</h4>
                        <label>
                            Name
                            <input
                                value={editForm.eventName ?? ""}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, eventName: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Category
                            <input
                                value={editForm.category ?? ""}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, category: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Location
                            <input
                                value={editForm.location ?? ""}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, location: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Description
                            <textarea
                                rows={3}
                                value={editForm.description ?? ""}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, description: e.target.value })
                                }
                            />
                        </label>
                        <button type="submit">PUT /api/v1/events/{selectedId}</button>
                    </form>
                </section>
            )}
        </div>
    );
}
