// what happens here: a component that just prints/draws the data of ONE event
// (no officially ready design yet)
/*
- UI piece that's shown on website
- reusable function (take one event matching the blueprint in event.ts & turn visible)
- no changing later
*/

// get blueprint rules
import type { EventCard } from "../../types/event.ts"

// define what component below receives as input (the props)
interface DisplayEventCardProps
{
    event: EventCard
}

// the actual component (function)
// use export & import bc one component = one file (instead of putting all into App.tsx)
export function DisplayEventCard({ event }:DisplayEventCardProps)
{
    return (
        <div>
            <h2>{event.eventName} </h2>
            <p>{event.startTime.toLocaleString()} </p>
            <p>{event.endTime.toLocaleString()} </p>
            <p>{event.category} </p>
            <p>{event.description} </p>
            <p>{event.location} </p>
        </div>
    )
}