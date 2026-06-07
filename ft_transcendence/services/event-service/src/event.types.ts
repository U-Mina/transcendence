/**
 * mock data array for event
 */

export interface EventDTO {
    // event id, unique identifier
    eventId: string;
    eventName: string;
    // may create an enum for category
    category?: string;
    //time stamp
    eventTime: Date;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    creatorId: string;
    creatorName: string;
    // optional
    location?: string;
    // safety check - if an event is being reported
    safetyCheck?: boolean;
}

// the info displayed to all user
export interface GeneralEventCard {
    eventName: string;
    category?: string;
    eventTime: Date;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    creatorName: string;
    location?: string;
}