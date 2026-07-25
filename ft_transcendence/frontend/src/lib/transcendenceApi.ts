import type {
  EventCard,
  EventDetail,
  EventInput,
  SessionUser,
  UserProfile,
} from "../types/api";

const API_BASE = "/api/v1";
export const SESSION_EXPIRED_EVENT = "transcendence:session-expired";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & { token?: string };

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...init } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = body.error ?? body.message ?? message;
    } catch {
      // Retain the useful fallback for non-JSON responses.
    }
    if (response.status === 401 && token)
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const transcendenceApi = {
  register: (input: { userName: string; email: string; password: string }) =>
    request<SessionUser>("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ accessToken: string; user: SessionUser }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  events: () => request<EventCard[]>("/events"),
  event: (eventId: string) => request<EventDetail>(`/events/${eventId}`),
  createEvent: (input: EventInput, token: string) =>
    request<EventCard>("/events", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  updateEvent: (eventId: string, input: EventInput, token: string) =>
    request<EventCard>(`/events/${eventId}`, {
      method: "PUT",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  deleteEvent: (eventId: string, token: string) =>
    request<void>(`/events/${eventId}`, { method: "DELETE", token }),
  joinEvent: (eventId: string, token: string) =>
    request<void>(`/events/${eventId}/join`, { method: "POST", token }),
  cancelJoin: (eventId: string, token: string) =>
    request<void>(`/events/${eventId}/join`, { method: "DELETE", token }),
  joinedEvents: (token: string) =>
    request<EventCard[]>("/users/me/events", { token }),
  joinedCount: (eventId: string, token: string) =>
    request<number>(`/events/${eventId}/joined-count`, { token }),
  uploadEventImage: (eventId: string, file: File, token: string) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ imageUrl: string }>(`/events/${eventId}/image`, {
      method: "POST",
      token,
      body,
    });
  },
  user: (userId: string, token?: string) =>
    request<UserProfile>(`/users/${userId}`, { token }),
  users: (token: string) => request<UserProfile[]>("/users", { token }),
  updateUser: (
    userId: string,
    input: {
      userName: string;
      userContact?: string | null;
      intraUrl?: string | null;
    },
    token: string,
  ) =>
    request<UserProfile>(`/users/${userId}`, {
      method: "PUT",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  deleteUser: (userId: string, token: string) =>
    request<void>(`/users/${userId}`, { method: "DELETE", token }),
  uploadAvatar: (file: File, token: string) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ avatarUrl: string }>("/users/me/avatar", {
      method: "POST",
      token,
      body,
    });
  },
};
