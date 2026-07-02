/*
puts everything together (ex. eventcard)
- gets actual list of events from somewhere (first from dummy data, then fetching from backend)
- then loop over that list and tell React to draw one eventcard for each event in the list

when swapping dummy data w real backend fetch, only App.tsx changes (blueprint & component stay same)
*/


import "./App.css";
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

import { DisplayEventCard } from "./components/EventCard/EventCard.tsx"
import { dummyEvents } from "./dummyData"

function App() {
  return (
    <div>
      {dummyEvents.map(event => (
        <DisplayEventCard key={event.eventId} event={event} />
      ))}
    </div>
  )
}

export default App