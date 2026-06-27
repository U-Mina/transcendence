/**
 * event service implementation
 */
import type { EventCard, EventManageView, UserSummary, EventDetailView, InternalEventEntity, CreateEventDTO, UpdateEventDTO } from "../event.types";
import { eventRepository } from "../event.repository";

/**
 * using an export class to avoid huge import of evenry function
*/
class EventService {
    // get single event by id
    // NOTE: Service should usually return the appropriate response shape already.
    async getEventById(userId: string, eventId: string): Promise<EventCard| EventManageView | undefined> {
        if (!eventId) {
            throw new Error("Event ID not found.");
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
    async createEvent(creatorId: string, eventInput: CreateEventDTO): Promise<EventManageView | undefined> {
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
            creatorId,
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
    // for now, we still need to pass userId manually for identity check, after JWT no
    async updateEvent(
        eventId: string,
        userId: string,
        eventInput: UpdateEventDTO
    ): Promise<EventManageView | undefined> {
        // check does this event exist or not
        const event = await eventRepository.getEventById(eventId);
        if (event === undefined) {
            throw new Error("Event not found.");
        }
        // check identity of the 'update-tor', is she/he elighble to update this event
        if (event.creatorId !== userId) {
            throw new Error("Forbidden operation.");
        }
        // normal event time check
        const startTime = eventInput.startTime ?? event.startTime;
        const endTime = eventInput.endTime ?? event.endTime;
        if ((new Date(endTime).getTime() < new Date(startTime).getTime()) || new Date(startTime).getTime() < Date.now()) {
            throw new Error ("Invalid event time.");
        }

        const updatedEvent = await eventRepository.updateEvent(eventId, eventInput);
        if (updatedEvent === undefined) {
            throw new Error ("Fail to update event.");
        }
        const {
            safetyCheck,
            ...creatorView
        } = updatedEvent;

        return creatorView;
    }

    // detele an event, now still pass userId manualy
    async deleteEvent(userId: string, eventId: string) {
        // check the deletor === creator
        const matchedEvent = await eventRepository.getEventById(eventId);
        if (!matchedEvent) {
            throw new Error("Event not found.");
        }
        if (matchedEvent.creatorId !== userId) {
            throw new Error("Forbidden operation.");
        }
        return await eventRepository.deleteEvent(eventId);  
    }

    // helper to connect with user-service, display user-info of the CREATOR of event card
    // only be called inside current class
    // architecture note: even if the user-service (get-user-info) failed, event-service still works
    private async getEventCreatorSummary(creatorId: string): Promise<UserSummary | undefined> {
        const userServiceUrl = process.env.USER_SERVICE_URL ?? "http://localhost:3001";

        try {
            // this is the 'GET' request (check in user-routes), which returns user-profile
            const response = await fetch(`${userServiceUrl}/users/${creatorId}`);
            if (!response.ok) {
                throw new Error("Fail to get user service.");
            }
            
            // convert response to json
            const user = await response.json();
            // extract needed info
            const userSumForEvent = {
                userName: user.userName,
                intraName: user.intraName ?? undefined,
                intraUrl: user.intraUrl ?? undefined, 
            };
            return userSumForEvent;

        } catch {
            return {
                userName: "User service is currently unavailable."
            }
        }
    }
}

// singleton structure, avoid thousand time of visting db
export const eventService = new EventService();