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
  isOnline?: boolean;
  friendCount?: number;
  friendshipStatus?: "none" | "pending_incoming" | "pending_outgoing" | "accepted";
};

export type FriendUser = {
  id: string;
  userName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  friendshipId?: string;
  status?: "pending" | "accepted";
};

export type FriendRequestsResponse = {
  incoming: FriendUser[];
  outgoing: FriendUser[];
};

export type HeartbeatResponse = {
  lastSeenAt: string;
  isOnline: boolean;
  onlineThresholdSeconds: number;
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

export type EventInput = {
  eventName: string;
  startTime: string;
  endTime: string;
  category: EventTag;
  description?: string;
  location?: string;
  minParticipant?: number;
};
