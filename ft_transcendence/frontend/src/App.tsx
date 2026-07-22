import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EventsPage } from "./pages/EventsPage";
import { Layout } from "./components/Wrapper/Layout";
import { SingleEventDetailsPage } from "./pages/SingleEventDetailsPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import { OtherProfilePage } from "./pages/OtherProfilePage";
// import { UpdateEventPage } from "./pages/UpdateEventPage";
import { RequireAuth } from "./components/RequireAuth";

/*
React Router: wraps the app in a browser router & defines its routes
- Layout Wrapper will be the parent route,
     so that every child is rendered inside its Outlet
     -> so layout automatically appears for all those pages
*/
// https://reactnative.dev/docs/network
function App() 
{
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<EventsPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="events/:eventId" element={<SingleEventDetailsPage />} />
                    <Route path="profile/:userId" element={<OtherProfilePage />} />
                    <Route element={<RequireAuth />}>
                        <Route path="create" element={<CreateEventPage />} />
                        {/* <Route path="events/:eventId/edit" element={<UpdateEventPage />} /> */}
                        {/* <Route path="profile" element={<OwnProfilePage />} /> */}
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
