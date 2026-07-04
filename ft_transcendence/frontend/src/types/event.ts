export interface EventCard {
    eventId: string;
    eventName: string;
    startTime: string;
    endTime: string;
    category?: string;
    description?: string;
    location?: string;
}

export interface UserSummary {
    userName: string;
    intraName?: string;
    intraUrl?: string;
}

export interface EventDetailView extends EventCard {
    creator: UserSummary;
}

export interface EventManageView extends EventCard {
    creatorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventDTO {
    eventName: string;
    startTime: string;
    endTime: string;
    category?: string;
    description?: string;
    location?: string;
    minPaticipant?: number;
}

export interface UpdateEventDTO {
    eventName?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    description?: string;
    location?: string;
    minPaticipant?: number;
}

export function formatEventDate(value: string): string {
    return new Date(value).toLocaleString();
}
