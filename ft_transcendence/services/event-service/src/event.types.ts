/**
 * mock data array for event
 */
// the info displayed to all user. expose to frontend
export interface EventCard {
    // event id, unique identifier
    eventId: string;
    eventName: string;
    eventTime: Date;
    endTime: Date;
    // may create an enum for category
    category?: string;
    description?: string;
    location?: string;
}

// the event card view for creator of the card
export interface CreatorEventCard extends EventCard {
    //time stamp
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
}

// internal event card with all infor
export interface InternalEventCard extends CreatorEventCard {
    // safety check - if an event being reported
    safetyCheck: boolean;
}

// the data structure for creating new event
export interface CreateEventDTO {
    // creator id only before JWT, later it will be in POST request body itself
    creatorId: string;
    eventName: string;
    eventTime: Date;
    // endTime: Date;
    // maxParticipants?: number;
    category?: string;
    description?: string;
    location?: string;
}

// on updating, all filed opyional cuz user may only update ONE item
export interface UpdateEventDTO {
    // creator id only before JWT, later it will be in POST request body itself
    creatorId: string;
    eventName?: string;
    eventTime?: Date;
    endTime?: Date;
    category?: string;
    description?: string;
    location?: string;
}