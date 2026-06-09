/**
 * event service implementation
 */
import type { EventCard, EventOwnerView, InternalEventEntity, CreateEventDTO, UpdateEventDTO } from "../event.types";

/**
 * using an export class to avoid huge import of evenry function
*/
class EventService {
    // mock data, make c++ style, in class private
    private mockEvents: InternalEventEntity[] = [
        {
            eventId: "www",
            eventName: "event-01",
            startTime: new Date("2001-01-01"),
            endTime: new Date("2001-01-02"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 01",
            creatorId: "hsajkkdka",
            safetyCheck: false,
        },
        {
            eventId: "eee",
            eventName: "event-02",
            startTime: new Date("2001-01-02"),
            endTime: new Date("2001-01-03"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 02",
            creatorId: "jasdhla",
            safetyCheck: false,
        },
        {
            eventId: "rrr",
            eventName: "event-03",
            startTime: new Date("2001-01-03"),
            endTime: new Date("2001-01-05"),
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "test event 03",
            creatorId: "kshdaa",
            safetyCheck: true,
        }
    ];
    
    // get single event by id
    // NOTE: Service should usually return the appropriate response shape already.
    async getEventById(userId: string, eventId: string): Promise<EventCard| EventOwnerView | undefined> {
        if (!eventId) {
            throw new Error("Event not found.");
        }
        // fetch the entire internal-event-entity
        const event = this.mockEvents.find(
            eve => eve.eventId === eventId
        );

        // the event does not exist
        if (!event) {
            return undefined;
        }

        if (userId === event?.creatorId) {
            const {
                safetyCheck,
                ...creatorView
            } = event;
            return creatorView;
        }
        const { safetyCheck, creatorId, createdAt, updatedAt, ...publicView } = event;
        return publicView;
    }

    // get all events
    async getAllEvents(): Promise<EventCard[] | undefined> {
        return this.mockEvents.map(event => {
            const {
                safetyCheck,
                creatorId,
                createdAt,
                updatedAt,
                ...publicView
            } = event;
            return publicView
        });
    }

    // POST to create new event
    //IMPORTANT!! this HAS TO BE CHANGE AFTER JWT implement
    // async createEvent(creatorId, eventInput): Promise<EventDTO | undefine> {}
    async createEvent(eventInput: CreateEventDTO): Promise<EventCard | undefined> {
        // fastify will check the exitence of all field
        const curTime = Date.now();
        
        return
    }

    


}

// singleton structure, avoid thousand time of visting db
export const eventService = new EventService();