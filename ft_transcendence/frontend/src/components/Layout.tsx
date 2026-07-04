import type { ReactNode } from "react";
import { UserBar } from "./UserBar";

export type TabId = "events" | "users" | "status" | "login";

interface LayoutProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    children: ReactNode;
}

const TABS: { id: TabId; label: string }[] = [
    { id: "events", label: "Events" },
    { id: "users", label: "Users" },
    { id: "status", label: "Status" },
];

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
    return (
        <div className="layout">
            <header className="layout__header">
                <div>
                    <p className="layout__eyebrow">ft_transcendence</p>
                    <h1>Test Frontend</h1>
                    <p className="layout__subtitle">
                        Manual API tester for the microservices gateway
                    </p>
                </div>
                <UserBar onOpenLogin={() => onTabChange("login")} />
            </header>

            <nav className="layout__nav">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={activeTab === tab.id ? "active" : undefined}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main className="layout__main">{children}</main>
        </div>
    );
}
