import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Layout, type TabId } from "./components/Layout";
import { EventsPage } from "./pages/EventsPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { StatusPage } from "./pages/StatusPage";
import "./App.css";

function AppContent() {
    const [activeTab, setActiveTab] = useState<TabId>("events");

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === "events" && <EventsPage />}
            {activeTab === "users" && <UsersPage />}
            {activeTab === "login" && <LoginPage />}
            {activeTab === "status" && <StatusPage />}
        </Layout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
