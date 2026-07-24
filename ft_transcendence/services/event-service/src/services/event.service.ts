/**
 * event service implementation
 */
import { EVENT_TAGS, type EventCard, type EventManageView, type UserSummary, type EventDetailView, type InternalEventEntity, type CreateEventDTO, type UpdateEventDTO, type EventTag } from "../event.types";
import { eventRepository } from "../event.repository";

// centralize error handler, using super()
export class EventServiceError extends Error {
    constructor(message: string, readonly statusCode: number) {
        super(message);
    }
}

function requiredText(value: unknown, field: string, maxLength: number): string {
    if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
        throw new EventServiceError(`Invalid ${field}.`, 400);
    }
    return value.trim();
}

function optionalText(value: unknown, field: string, maxLength: number): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || value.trim().length > maxLength) {
        throw new EventServiceError(`Invalid ${field}.`, 400);
    }
    return value.trim() || undefined;
}

function optionalDate(value: unknown, field: string): Date | undefined {
    if (value === undefined) return undefined;
    const date = value instanceof Date ? value : new Date(value as string | number);
    if (Number.isNaN(date.getTime())) throw new EventServiceError(`Invalid ${field}.`, 400);
    return date;
}

function optionalTag(value: unknown, required: boolean): EventTag | undefined {
    if (value === undefined) {
        if (required) throw new EventServiceError("A tag is required.", 400);
        return undefined;
    }
    if (typeof value !== "string" || !EVENT_TAGS.includes(value as EventTag)) {
        throw new EventServiceError("Invalid tag.", 400);
    }
    return value as EventTag;
}

function normalizeEventInput(input: unknown, required: boolean): CreateEventDTO | UpdateEventDTO {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
        throw new EventServiceError("Invalid event data.", 400);
    }
    const value = input as Record<string, unknown>;
    const eventName = required ? requiredText(value.eventName, "event name", 255) : optionalText(value.eventName, "event name", 255);
    const startTime = optionalDate(value.startTime, "start time");
    const endTime = optionalDate(value.endTime, "end time");
    if (required && (!startTime || !endTime)) throw new EventServiceError("Start and end times are required.", 400);
    const category = optionalTag(value.category, required);
    const description = optionalText(value.description, "description", 5000);
    const location = optionalText(value.location, "location", 255);
    const minParticipant = value.minParticipant === undefined ? undefined : value.minParticipant;
    if (minParticipant !== undefined && (!Number.isInteger(minParticipant) || (minParticipant as number) < 1)) {
        throw new EventServiceError("Minimum participants must be a positive integer.", 400);
    }
    return {
        ...(eventName !== undefined ? { eventName } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(category ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(minParticipant !== undefined ? { minParticipant: minParticipant as number } : {}),
    };
}

// public view of card, centrailized here
function publicCard(event: InternalEventEntity): EventCard {
    const {
        safetyCheck,
        createdAt,
        updatedAt,
        ...card
    } = event;
    return card;
}

/**
 * using an export class to avoid huge import of evenry function
*/
class EventService {
    // get single event by id
    // NOTE: Service should usually return the appropriate response shape already.
    async getEventById(eventId: string): Promise<EventDetailView | undefined> {
        const eve = await eventRepository.getEventById(eventId);
        if (!eve) {
            return undefined;
        }
        // this method, we do not care about the creator at all, every one have the same event view with short user-info
        
        // find the creator of even, to provide creator-info
        const eveCreatorSum = await this.getEventCreatorSummary(eve.creatorId);
        const detailCard: EventDetailView = {
            ...publicCard(eve),
            creator: eveCreatorSum
        };
        return detailCard;
    }

    // get all events
    async getAllEvents(): Promise<EventCard[] | undefined> {
        return ((await eventRepository.getAll()).map(event => {
            const {
                safetyCheck,
                createdAt,
                updatedAt,
                ...publicView
            } = event;
            return publicView;
        }));
    }

    // usr GET joined event list
    // map to public card view (no sensitive info)
    async getJoinedEvents(userId: string): Promise<EventCard[]> {
        return (await eventRepository.getJoinedEvents(userId)).map(publicCard);
    }

    // POST to create new event
    // async createEvent(creatorId, eventInput): Promise<EventDTO | undefine> {}
    async createEvent(creatorId: string, eventInput: CreateEventDTO): Promise<EventManageView | undefined> {
        const input = normalizeEventInput(eventInput, true) as CreateEventDTO;
        const curTime = Date.now();
        const startTime = input.startTime;
        const endTime = input.endTime;

        // event time logic check
        if (curTime > new Date(startTime).getTime()) {
            throw new EventServiceError("Invalid time of event.", 400);
        }
        if (new Date(startTime).getTime() > new Date(endTime).getTime()) {
            throw new EventServiceError("Invalid event time span.", 400);
        }

        // create internal event entity and push to db
        const newEventEntity: InternalEventEntity = {
            safetyCheck: false,
            eventId: crypto.randomUUID(),
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...input
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
    async updateEvent(
        eventId: string,
        userId: string,
        eventInput: UpdateEventDTO
    ): Promise<EventManageView | undefined> {
        const event = await this.requireOwner(eventId, userId);
        const input = normalizeEventInput(eventInput, false) as UpdateEventDTO;
        // normal event time check
        const startTime = input.startTime ?? event.startTime;
        const endTime = input.endTime ?? event.endTime;
        if ((new Date(endTime).getTime() < new Date(startTime).getTime()) || new Date(startTime).getTime() < Date.now()) {
            throw new EventServiceError("Invalid event time.", 400);
        }

        const updatedEvent = await eventRepository.updateEvent(eventId, input);
        if (!updatedEvent) {
            throw new EventServiceError("Event not found.", 404);
        }

        const {
            safetyCheck,
            ...creatorView
        } = updatedEvent;

        return creatorView;
    }

    // detele an event, now still pass userId manualy
    async deleteEvent(userId: string, eventId: string): Promise<boolean> {
        // check the deletor === creator
        await this.requireOwner(eventId, userId);
        return eventRepository.deleteEvent(eventId);  
    }

    // user join event they interested
    async joinEvent(eventId: string, userId:string): Promise<void> {
        const event = await eventRepository.getEventById(eventId);
        if (!event) {
            throw new EventServiceError("Event not found.", 404);
        }
        if (event.creatorId === userId) {
            throw new EventServiceError("You are event owner.", 409);
        }
        try {
            await eventRepository.joinEvent(eventId, userId);
        } catch (error) {
            if ((error as {
                code?: string
            }).code === "ER_DUP_ENTRY") {
                // no dup
                throw new EventServiceError("User has already joined this event.", 409);
            }
            throw error;
        }
    }

    async cancelJoin(eventId: string, userId: string): Promise<void> {
        const event = await eventRepository.getEventById(eventId);
        if (!event) {
            throw new EventServiceError("Event not found.", 404);
        }
        const cancelled = await eventRepository.cancelJoin(eventId, userId);
        if (!cancelled) {
            throw new EventServiceError("User has not joined this event.", 404);
        }
    }

    // creator know m=how many people joined
    async getJoinedCount(eventId: string, userId: string): Promise<number> {
        await this.requireOwner(eventId, userId);
        return eventRepository.getJoinedCount(eventId);
    }

    // event img update/change
    async replaceImage(eventId: string, userId: string, imageUrl: string): Promise<{
        imageUrl: string;
        previousImageUrl?: string
    }> {
        if (!imageUrl.startsWith("/uploads/")) {
            throw new EventServiceError("Invalid image URL.", 400);
        }
        const event = await this.requireOwner(eventId, userId);
        const updated = await eventRepository.updateImage(eventId, imageUrl);
        if (!updated) {
            throw new EventServiceError("Event not found.", 404);
        }
        return event.imageUrl ? {
            imageUrl, previousImageUrl: event.imageUrl
        } : {
            imageUrl
        };
    }

    // helper to connect with user-service, display user-info of the CREATOR of event card
    // only be called inside current class
    // architecture note: even if the user-service (get-user-info) failed, event-service still works
    private async getEventCreatorSummary(creatorId: string): Promise<UserSummary> {
        const userServiceUrl = process.env.USER_SERVICE_URL ?? "https://localhost:3001";
        const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

        try {
            // this is the 'GET' request (check in user-routes), which returns user-profile
            const response = await fetch(
                `${userServiceUrl}/users/${creatorId}`,
                internalToken ? { headers: { "x-internal-token": internalToken } } : {},
            );
            if (!response.ok) {
                throw new Error(`Fail to get user service. Response status: ${response.status}`);
            }
            
            // convert response to json
            const user = await response.json() as {
                userName: string;
                intraName?: string;
                intraUrl?: string;
            };

            // extract needed info
            const userSumForEvent: UserSummary = {
                userId: creatorId,
                userName: user.userName,
                ...(user.intraName ? { intraName: user.intraName } : {}),
                ...(user.intraUrl ? { intraUrl: user.intraUrl } : {}),
            };
            return userSumForEvent;

        } catch {
            // this is the fallback, so return type never be unfined
            return {
                userId: creatorId,
                userName: "User service is currently unavailable."
            }
        }
    }

    // private function inside class for validation
    private async requireOwner(eventId: string, userId: string): Promise<InternalEventEntity> {
        const event = await eventRepository.getEventById(eventId);
        if (!event) {
            throw new EventServiceError("Event not found.", 404);
        }
        if (event.creatorId !== userId) {
            throw new EventServiceError("Forbidden operation.", 403);
        }
        return event;
    }
}

// singleton structure, avoid thousand time of visting db
export const eventService = new EventService();
