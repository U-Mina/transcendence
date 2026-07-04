import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function StatusPage() {
    const [health, setHealth] = useState<unknown>(null);
    const [status, setStatus] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [healthResult, statusResult] = await Promise.all([
            api.getHealth(),
            api.getStatus(),
        ]);

        const errors: string[] = [];

        if (healthResult.ok) {
            setHealth(healthResult.data);
        } else {
            errors.push(healthResult.error);
        }

        if (statusResult.ok) {
            setStatus(statusResult.data);
        } else {
            errors.push(statusResult.error);
        }

        if (errors.length > 0) {
            setError(errors.join(" · "));
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return (
        <div className="page">
            <div className="page__toolbar">
                <h2>Gateway status</h2>
                <button type="button" className="secondary" onClick={() => void refresh()}>
                    Refresh
                </button>
            </div>

            {error && <p className="alert alert--error">{error}</p>}
            {loading && <p>Loading…</p>}

            <div className="split">
                <section className="panel">
                    <h3>GET /health</h3>
                    <pre className="json-block">
                        {health ? JSON.stringify(health, null, 2) : "—"}
                    </pre>
                </section>
                <section className="panel">
                    <h3>GET /api/v1/status</h3>
                    <pre className="json-block">
                        {status ? JSON.stringify(status, null, 2) : "—"}
                    </pre>
                </section>
            </div>
        </div>
    );
}
