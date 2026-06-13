/**
 * event service implementation
 */
import { log } from "node:console";
import type { EventCard, EventOwnerView, InternalEventEntity, CreateEventDTO, UpdateEventDTO } from "../event.types";
import { eventRepository } from "../event.repository";

/**
 * using an export class to avoid huge import of evenry function
*/
class eventService {
    // get single event by id
    // NOTE: Service should usually return the appropriate response shape already.
    async getEventById(userId: string, eventId: string): Promise<EventCard| EventOwnerView | undefined> {
        if (!eventId) {
            throw new Error("Event not found.");
        }
        // fetch the entire internal-event-entity
       const event = await eventRepository.getEventById(eventId);

        // the event does not exist
        if (!event) {
            return undefined;
        }

        if (userId === event.creatorId) {
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
        return ((await eventRepository.getAll()).map(event => {
            const {
                safetyCheck,
                creatorId,
                createdAt,
                updatedAt,
                ...publicView
            } = event;
            return publicView;
        }));
    }

    // POST to create new event
    //IMPORTANT!! this HAS TO BE CHANGE AFTER JWT implement
    // async createEvent(creatorId, eventInput): Promise<EventDTO | undefine> {}
    async createEvent(eventInput: CreateEventDTO): Promise<EventOwnerView | undefined> {
        const curTime = Date.now();
        const startTime = eventInput.startTime;
        const endTime = eventInput.endTime;

        // event time logic check
        if (curTime > new Date(startTime).getTime()) {
            throw new Error("Invalid start time of event.");
        }
        if (new Date(startTime).getTime() > new Date(endTime).getTime()) {
            throw new Error("Invalid event time span.");
        }

        // create internal event entity and push to db
        const newEventEntity: InternalEventEntity = {
            safetyCheck: false,
            eventId: crypto.randomUUID(),
            // temp creatorid, should come from JWT auth, now as placeholder
            creatorId: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...eventInput
        };
        // push to db
        await eventRepository.createEvent(newEventEntity);

        const {
            safetyCheck,
            ...creatorView
        } = newEventEntity;

        return creatorView;
    }

    // PUT, update alredy exiting event
    async updateEvent(eventId: string, eventInput: UpdateEventDTO): Promise<EventOwnerView | undefined> {
        
        // check does this event exist or not
        
        // check identity of the 'update-tor', is she/he elighble to update this event

        
        return 
    }

    


}

// singleton structure, avoid thousand time of visting db
export const EventService = new eventService();