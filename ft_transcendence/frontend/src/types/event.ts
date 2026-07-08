// define shape of an event (same as backend)
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
    // comments / questins session
    comment?: string;
}

// the event view for creator of the card ONLY
export interface EventManageView extends EventCard {
    creatorId: string;
    // time stamp
    createdAt: Date;
    updatedAt: Date;
}

// user-info object embeded in the detailed event-view
export interface UserSummary {
    // userId: string;
    userName: string;
    intraName?: string;
    intraUrl?: string;
}

export interface EventDetailView extends EventCard {
    creator: UserSummary;
}

// TODO: isnt this sth i should just put the path (services/event-service/src/event.types.ts) from backend into my event.ts
