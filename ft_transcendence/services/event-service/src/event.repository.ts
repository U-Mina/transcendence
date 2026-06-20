/**
 * for a easier adaption to real data base
 * for CRUD ops
 */
import { InternalEventEntity, UpdateEventDTO } from "./event.types"

class EventRepository {
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
    
    // get all
   async getAll() {
    return this.mockEvents;
   } 

    // get by id
    async getEventById(eventId: string): Promise<InternalEventEntity | undefined> {
        const event = this.mockEvents.find(eve => eve.eventId === eventId);
        if (!event) {
            return undefined;
        }
        return event;
    }

    // create event (push new to repo.ts)
    // NOTE: using return type here bc it easier to replace with explict cintract
    async createEvent(event: InternalEventEntity): Promise<InternalEventEntity | undefined> {
        this.mockEvents.push(event);
        return event;
    }

    // update event
    async updateEvent(eventId: string, eventInput: UpdateEventDTO): Promise<InternalEventEntity | undefined> {
       const index = this.mockEvents.findIndex(eve => eve.eventId === eventId);
       if (index === -1) {
        return undefined;
       }

       const newEventEntity: InternalEventEntity = {
        ...this.mockEvents[index],
        ...eventInput,
        updatedAt: new Date(),
       };
       this.mockEvents[index] = newEventEntity;

       return newEventEntity;
    }

    // delete (popout from repo.ts), here can return full event-data, but this will be too waste of mem
    async deleteEvent(eventId: string): Promise<boolean> {
        const index = this.mockEvents.findIndex(eve => eve.eventId === eventId);
        if (index === -1) {
            return false;
        }
        this.mockEvents.splice(index, 1);
        return true;
    }
}

export const eventRepository = new EventRepository();