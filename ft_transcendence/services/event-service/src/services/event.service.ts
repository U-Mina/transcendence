/**
 * event service implementation
 */
import type { EventDTO, GeneralEventCard } from "../event.types";


/**
 * using an export class to avoid huge import of evenry function
*/
class EventService {
    // mock data, make c++ style, in class private
    private mockEvents: EventDTO[] = [
        {
            id: "www",
            eventName: "event-01",
            eventTime: new Date("2001-01-01"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 01",
            creatorName: "user-01",
            creatorId: "hsajkkdka",
        },
        {
            id: "eee",
            eventName: "event-02",
            eventTime: new Date("2001-01-02"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 02",
            creatorName: "user-02",
            creatorId: "jasdhla",
        },
        {
            id: "rrr",
            eventName: "event-03",
            eventTime: new Date("2001-01-03"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 03",
            creatorName: "user-03",
            creatorId: "kshdaa",
        }
    ];
    
    // get single event by id
    async getEventById(eventId: string): Promise<EventDTO | undefined> {
        if (!eventId) {
            throw new Error("Event ID not valid.");
        }
        return this.mockEvents.find(eve => eve.id === eventId);
    }

    // get all events
    async getAllEvents(): Promise<GeneralEventCard[] | undefined> {
        // strip out the sensitive data from eventDTO
        return this.mockEvents.map(({ id, creatorId, safetyCheck, ...generalCard }) => generalCard);
    }
}

// singleton structure, avoid thousand time of visting db
export const eventService = new EventService();