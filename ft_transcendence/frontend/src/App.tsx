import "./App.css";
import { useState } from "react"; // use ft are called hooks -> there is many built-in ones like this by React

// this is all a placeholder 
function MyButton() {
  // remember information w a state
  const [count, setCount] = useState<number>(0); // count = current state, setCount = ft that updates count

  // event handler function
  function handleClick(): void {
    alert("You clicked me!");
    setCount(count + 1); // update information here from useState above
  }

  // what happens when the button is clicked
  return (
    <button onClick={handleClick}>
      Click me! {count}
    </button>
  );
}

export default function MyApp(): JSX.Element {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton />
    </div>
  );
}