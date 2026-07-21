/*
puts everything together (ex. eventcard)
- gets actual list of events from somewhere (first from dummy data, then fetching from backend)
- then loop over that list and tell React to draw one eventcard for each event in the list

when swapping dummy data w real backend fetch, only App.tsx changes (blueprint & component stay same)
*/

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





// PRACTICE STUFF - (TODO: delete later)
// import { useState } from "react"; // use ft are called hooks -> there is many built-in ones like this by React

// // this is all a placeholder 
// function MyButton() {
//   // remember information w a state
//   const [count, setCount] = useState<number>(0); // count = current state, setCount = ft that updates count

//   // event handler function
//   function handleClick(): void {
//     alert("You clicked me!");
//     setCount(count + 1); // update information here from useState above
//   }

//   // what happens when the button is clicked
//   return (
//     <button onClick={handleClick}>
//       Click me! {count}
//     </button>
//   );
// }

// export default function MyApp(): JSX.Element {
//   return (
//     <div>
//       <h1>Welcome to my app</h1>
//       <MyButton />
//     </div>
//   );
// }
