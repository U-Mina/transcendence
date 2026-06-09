/**
 * mock data array for event
 */
// the info displayed to all user. expose to frontend
export interface EventCard {
    // event id, unique identifier
    eventId: string;
    eventName: string;
    startTime: Date;
    endTime: Date;
    // may create an enum for category
    category?: string;
    description?: string;
    location?: string;
}

// the event card view for creator of the card
export interface EventOwnerView extends EventCard {
    creatorId: string;
    // time stamp
    createdAt: Date;
    updatedAt: Date;
}

// internal event card with all infor
export interface InternalEventEntity extends EventOwnerView {
    // safety check - if an event being reported
    safetyCheck: boolean;
}

// the data structure for creating new event
export interface CreateEventDTO {
    eventName: string;
    startTime: Date;
    endTime: Date;
    category?: string;
    description?: string;
    location?: string;
}

// on updating, all filed opyional cuz user may only update ONE item
export interface UpdateEventDTO {
    // creator id only before JWT, later it will be in POST request body itself
    creatorId: string;
    eventName?: string;
    startTime?: Date;
    endTime?: Date;
    category?: string;
    description?: string;
    location?: string;
}