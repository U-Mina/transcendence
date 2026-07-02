// TODO: delete later when merging w backend (already in branch event-service, event.types.ts)
/* 
this blueprint defines the shape of an event
-> which fields it has & what type each field is as rules
*/
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
