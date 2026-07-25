export type SessionUser = {
  id: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
};

export type UserProfile = {
  id?: string;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  userContact?: string;
  intraName?: string;
  intraUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const EVENT_TAGS = [
  "Social",
  "Sports",
  "Games",
  "Food",
  "Learning",
  "Outdoors",
  "Arts & Culture",
] as const;
export type EventTag = (typeof EVENT_TAGS)[number];

export const displayTag = (value?: string) =>
  EVENT_TAGS.includes(value as EventTag) ? value : "Uncategorized";

export type EventCard = {
  eventId: string;
  creatorId: string;
  eventName: string;
  startTime: string;
  endTime: string;
  category?: string;
  description?: string;
  location?: string;
  minParticipant?: number;
  imageUrl?: string;
};

export type EventDetail = EventCard & {
  creator: {
    userId: string;
    userName: string;
    intraName?: string;
    intraUrl?: string;
  };
};

export type EventSearchOptions = {
  q?: string;
  category?: string;
  sort?: "startTime" | "eventName" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedEvents = {
  items: EventCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EventInput = {
  eventName: string;
  startTime: string;
  endTime: string;
  category: EventTag;
  description?: string;
  location?: string;
  minParticipant?: number;
};
