// TODO: delete later when merging w backend branches
/* 
dummy data that follows the the event.ts blueprint's rules
- only purpose to display sth before the real backend connection is wired up
- to test eventcard component in isolation
*/

// dummy data for EventCard

import type { EventCard } from "./types/event.ts"

// export so other files can use the dummyEvents list (instead of default private)
export const dummyEvents: EventCard[] = 
[
    {
        eventId: "1",
        eventName: "Gym Leg Day",
        startTime: new Date("2026-06-30T07:00:00"),
        endTime: new Date("2026-06-30T09:00:00"),
        category: "Sports",
        description: "Looking for a gym buddy to join me on leg day - all levels welcome",
        location: "McFit",
    },
    {
        eventId: "2",
        eventName: "Gym Chest Day",
        startTime: new Date("2026-08-30T10:00:00"),
        endTime: new Date("2026-08-30T12:00:00"),
        category: "Sports",
        location: "42 HN",
    },
];
