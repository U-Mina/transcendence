/**
 * event service implementation
 */
import type { EventDTO } from "../event.types";


/**
 * using an export class to avoid huge import of evenry function
*/
class EventService {
    // mock data, make c++ style, in class private
    private mockEvents: EventDTO[] = [
        {
            id: "www",
            name: "event-01",
            //time stamp
            eventTime: new Date("2001-01-01"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 01",
            createdBy: "user-01",
        },
        {
            id: "eee",
            name: "event-02",
            //time stamp
            eventTime: new Date("2001-01-02"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 02",
            createdBy: "user-02",
        },
        {
            id: "rrr",
            name: "event-03",
            //time stamp
            eventTime: new Date("2001-01-03"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 03",
            createdBy: "user-03",
        }
    ]
    
    // get single event by id
    async getEventById(eventId: string): Promise<EventDTO | undefined> {
        if (!eventId) {
            throw new Error("Event ID not valid.");
        }
        return this.mockEvents.find(eve => eve.id === eventId);
    }

    // get all events
    async getAllEvents(): Promise<EventDTO[] | undefined> {
        return this.mockEvents;
    }
}

// singleton structure, avoid thousand time of visting db
export const eventService = new EventService();