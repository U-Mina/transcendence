import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { InternalUserEntity } from "../types/user";

export function LoginPage() {
    const { setUser } = useAuth();
    const [users, setUsers] = useState<InternalUserEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [registerForm, setRegisterForm] = useState({
        userName: "",
        userEmail: "",
        userContact: "",
    });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await api.getUsers();
        if (result.ok) {
            setUsers(result.data);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    function handleSelect(user: InternalUserEntity) {
        setUser(user);
        setMessage(`Active user set to ${user.userName} (${user.id})`);
        setError(null);
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const result = await api.createUser(registerForm);
        if (result.ok) {
            setUser(result.data);
            setMessage(`Registered and signed in as ${result.data.userName}`);
            setRegisterForm({ userName: "", userEmail: "", userContact: "" });
            await loadUsers();
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="page">
            <h2>User identity (x-user header)</h2>
            <p className="muted">
                There is no real login yet. Pick a mock user or register a new one —
                the selected id is stored in localStorage and sent as{" "}
                <code>x-user</code> on every request.
            </p>

            {error && <p className="alert alert--error">{error}</p>}
            {message && <p className="alert alert--success">{message}</p>}

            <div className="split">
                <section className="panel">
                    <h3>Existing users</h3>
                    {loading ? (
                        <p>Loading…</p>
                    ) : (
                        <ul className="list">
                            {users.map((user) => (
                                <li key={user.id} className="list__item">
                                    <button
                                        type="button"
                                        className="list__select"
                                        onClick={() => handleSelect(user)}
                                    >
                                        <strong>{user.userName}</strong>
                                        <span>{user.userEmail}</span>
                                        <code>{user.id}</code>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="panel">
                    <h3>Register & sign in</h3>
                    <form className="form" onSubmit={handleRegister}>
                        <label>
                            Username
                            <input
                                required
                                value={registerForm.userName}
                                onChange={(e) =>
                                    setRegisterForm({ ...registerForm, userName: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Email
                            <input
                                type="email"
                                required
                                value={registerForm.userEmail}
                                onChange={(e) =>
                                    setRegisterForm({ ...registerForm, userEmail: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Contact
                            <input
                                value={registerForm.userContact}
                                onChange={(e) =>
                                    setRegisterForm({
                                        ...registerForm,
                                        userContact: e.target.value,
                                    })
                                }
                            />
                        </label>
                        <button type="submit">Create user & use as x-user</button>
                    </form>
                </section>
            </div>
        </div>
    );
}
