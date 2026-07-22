import { Navigate, Outlet } from "react-router-dom";

// guards protected routes (pages that cannot be accessed by non-loggedin visitors)
export function RequireAuth() {
    if (!localStorage.getItem("accessToken")) {
        return <Navigate to="/login" replace />;
    }

    // if access token for page exists -> will show that page
    return <Outlet />;
}
