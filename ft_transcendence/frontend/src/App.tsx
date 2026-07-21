import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EventsPage } from "./pages/EventsPage";
import { Layout } from "./components/Wrapper/Layout";
import { SingleEventDetailsPage } from "./pages/SingleEventDetailsPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import { OtherProfilePage } from "./pages/OtherProfilePage";

/*
React Router: wraps the app in a browser router & defines its routes
- Layout Wrapper will be the parent route,
     so that every child is rendered inside its Outlet
     -> so layout automatically appears for all those pages
*/
// https://reactnative.dev/docs/network
// TODO: 5 pages are available to anyone. For the other ones, one needs to be logged in -> route accordingly
//      TODO: therefore, /events is always first page to open & add login and signup button to right corner of layout wrapper
//              --> clicking on any non-accessible page (ex. on navbar) will route visitor to login page automatically
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
                    <Route path="create" element={<CreateEventPage />} />
                    {/* <Route path="profile" element={<OwnProfilePage />} /> */}
                    <Route path="profile/:userId" element={<OtherProfilePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
