import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { CreateUserDTO, InternalUserEntity, PublicUserProfile, UpdateUserDTO } from "../types/user";

export function UsersPage() {
    const { userId } = useAuth();
    const [users, setUsers] = useState<InternalUserEntity[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [profile, setProfile] = useState<PublicUserProfile | InternalUserEntity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<CreateUserDTO>({
        userName: "",
        userEmail: "",
        userContact: "",
    });

    const [editForm, setEditForm] = useState<UpdateUserDTO>({});

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await api.getUsers(userId);
        if (result.ok) {
            setUsers(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        if (!selectedId) {
            setProfile(null);
            return;
        }

        void (async () => {
            const result = await api.getUser(selectedId, userId);
            if (result.ok) {
                setProfile(result.data);
                setEditForm({
                    userName: result.data.userName,
                    userContact: "userContact" in result.data ? result.data.userContact ?? "" : "",
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

        const result = await api.createUser(createForm);
        if (result.ok) {
            setMessage(`Registered user "${result.data.userName}" (id: ${result.data.id})`);
            setCreateForm({ userName: "", userEmail: "", userContact: "" });
            await loadUsers();
        } else {
            setError(result.error);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedId || !userId) {
            setError("Select yourself as the active user to update a profile.");
            return;
        }

        setMessage(null);
        setError(null);

        const result = await api.updateUser(selectedId, editForm);
        if (result.ok) {
            setMessage("Profile updated.");
            await loadUsers();
        } else {
            setError(result.error);
        }
    }

    async function handleDelete(targetId: string) {
        if (!userId) {
            setError("Select a user before deleting.");
            return;
        }

        if (!window.confirm("Delete this user?")) return;

        setMessage(null);
        setError(null);

        const result = await api.deleteUser(targetId);
        if (result.ok) {
            setMessage("User deleted.");
            if (selectedId === targetId) setSelectedId(null);
            await loadUsers();
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="page">
            <div className="page__toolbar">
                <h2>Users</h2>
                <button type="button" className="secondary" onClick={() => void loadUsers()}>
                    Refresh
                </button>
            </div>

            {error && <p className="alert alert--error">{error}</p>}
            {message && <p className="alert alert--success">{message}</p>}

            <div className="split">
                <section className="panel">
                    <h3>Register user</h3>
                    <form className="form" onSubmit={handleCreate}>
                        <label>
                            Username
                            <input
                                required
                                value={createForm.userName}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, userName: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                required
                                value={createForm.userEmail}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, userEmail: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Contact
                            <input
                                value={createForm.userContact ?? ""}
                                onChange={(e) =>
                                    setCreateForm({ ...createForm, userContact: e.target.value })
                                }
                            />
                        </label>
                        <button type="submit">POST /api/v1/users</button>
                    </form>
                </section>

                <section className="panel">
                    <h3>All users</h3>
                    {loading ? (
                        <p>Loading…</p>
                    ) : users.length === 0 ? (
                        <p className="muted">No users returned.</p>
                    ) : (
                        <ul className="list">
                            {users.map((user) => (
                                <li key={user.id} className="list__item">
                                    <button
                                        type="button"
                                        className="list__select"
                                        onClick={() => setSelectedId(user.id)}
                                    >
                                        <strong>{user.userName}</strong>
                                        <span>{user.userEmail}</span>
                                        <code>{user.id}</code>
                                    </button>
                                    {userId === user.id && (
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => void handleDelete(user.id)}
                                        >
                                            Delete self
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {profile && (
                <section className="panel panel--detail">
                    <div className="page__toolbar">
                        <h3>Profile view</h3>
                        <button type="button" className="ghost" onClick={() => setSelectedId(null)}>
                            Close
                        </button>
                    </div>
                    <pre className="json-block">{JSON.stringify(profile, null, 2)}</pre>

                    {userId === selectedId && (
                        <form className="form" onSubmit={handleUpdate}>
                            <h4>Update own profile</h4>
                            <label>
                                Username
                                <input
                                    value={editForm.userName ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, userName: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Contact
                                <input
                                    value={editForm.userContact ?? ""}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, userContact: e.target.value })
                                    }
                                />
                            </label>
                            <button type="submit">PUT /api/v1/users/{selectedId}</button>
                        </form>
                    )}
                </section>
            )}
        </div>
    );
}
