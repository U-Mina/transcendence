/*
puts everything together (ex. eventcard)
- gets actual list of events from somewhere (first from dummy data, then fetching from backend)
- then loop over that list and tell React to draw one eventcard for each event in the list

when swapping dummy data w real backend fetch, only App.tsx changes (blueprint & component stay same)
*/

import "./App.css";
// import { dummyEvents } from "./dummyData" // comment in if wanting to display dummy data
import { EventsPage } from "./pages/EventsPage";
import { Layout } from "./components/Wrapper/Layout";

function App() 
{
    return (
        <Layout>
            <EventsPage />
        </Layout>
    );
}

export default App


// // https://reactnative.dev/docs/network
// function App() {
//   // this is a fetch call for event data from backend
//   const [events, setEvents] = useState<any[]>([]); // creates empty array and function that updates the array

//   useEffect(() => { // useEffect bc need to run fetch request only once (no repeated requests on every re-render)
//     const fetchEvents = async () => { // async runs function in background (no blocking rest) bc may need time to fetch data from server
//       try {
//         // TODO: check w backend if this URL is correct
//         const response = await fetch("http://localhost:3000/api/v1/events"); // request data from server

//         if (!response.ok)
//           throw new Error("Failed to fetch events");
     
//         const data = await response.json(); // get response w new data from backend & convert to json
//         // TODO: transform data ?
        
//         setEvents(data); // update w now new data/list of events (react function)
//       }
//       catch (error) {
//         console.error("Error:", error);
//       }
//     }
//     fetchEvents();
//   }, []);



//     return (
//     // takes each event in the events array
//     <div>
//       {events.map(event => (
//         <DisplayEventCard key={event.eventId} event={event} />
//       ))}
//     </div>
//   )

//   // DISPLAY DUMMY DATA (TODO: delete later)
//   // return (
//   //   // takes each event in the dummyEvents array
//   //   <div>
//   //     {dummyEvents.map(event => (
//   //       <DisplayEventCard key={event.eventId} event={event} />
//   //     ))}
//   //   </div>
//   // )
// }

// export default App





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
