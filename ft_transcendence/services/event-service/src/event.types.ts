export const EVENT_TAGS = [
    "Social",
    "Sports",
    "Games",
    "Food",
    "Learning",
    "Outdoors",
    "Arts & Culture",
] as const;

export type EventTag = typeof EVENT_TAGS[number];

/**
 * mock data array for event
 */
// the info CARD displayed to all user expose to frontend
export interface EventCard {
    // event id, unique identifier
    eventId: string;
    creatorId: string;
    eventName: string;
    startTime: Date;
    endTime: Date;
    // Kept as `category` for API/database compatibility; shown as “Tag” in the UI.
    category?: string;
    description?: string;
    location?: string;
    minParticipant?: number;
    // comments / questins session
    comment?: string;
    imageUrl?: string;
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
    userId: string;
    userName: string;
    intraName?: string;
    intraUrl?: string;
}

// the view of showing the relation of 'event' - 'user'
// public event detail plus small creator profile
export interface EventDetailView extends EventCard {
    creator: UserSummary;
}

export type EventSort = "startTime" | "eventName" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface EventListQuery {
    q?: string;
    category?: EventTag;
    sort: EventSort;
    order: SortOrder;
    page: number;
    pageSize: number;
}

export interface PaginatedEventList {
    items: EventCard[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// internal event card with all infor
export interface InternalEventEntity extends EventManageView {
    // safety check - if an event being reported
    safetyCheck: boolean;
}

// the data structure for creating new event
export interface CreateEventDTO {
    eventName: string;
    startTime: Date;
    endTime: Date;
    category?: EventTag;
    description?: string;
    location?: string;
    // minimal ppl to make this event able to happen
    // NOTE: this should be mandtory
    minParticipant?: number;
}

// on updating, all filed opyional cuz user may only update ONE item
export interface UpdateEventDTO {
    // creator id only before JWT, later it will be in POST request body itself
    // creatorId: string;
    eventName?: string;
    startTime?: Date;
    endTime?: Date;
    category?: EventTag;
    description?: string;
    location?: string;
    minParticipant?: number;
}
