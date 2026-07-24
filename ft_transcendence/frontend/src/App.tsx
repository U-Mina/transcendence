import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { EventEditorPage } from "./pages/EventEditorPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthenticationPage />} />
          <Route path="/register" element={<AuthenticationPage register />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/events" element={<Navigate to="/" replace />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route
              path="/events/new"
              element={
                <ProtectedRoute>
                  <EventEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId/edit"
              element={
                <ProtectedRoute>
                  <EventEditorPage edit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/users/:userId" element={<PublicProfilePage />} />
            <Route
              path="/people"
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
