/**
 * mock data array for event
 */

export interface EventDTO {
    // event id, unique identifier
    id: string;
    name: string;
    // may create an enum for category
    category?: string;
    //time stamp
    eventTime: Date;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    createdBy: string;
    // optional
    location?: string;
    // safety check - if an event is being reported
    safetyCheck?: boolean;
}