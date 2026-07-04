import type { PublicUserProfile } from "../types/user";

export interface ApiError {
    error?: string;
    message?: string;
}

export interface ServiceStatus {
    userService?: { status: string };
    eventService?: { status: string };
}

export type ApiResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; error: string; status: number };

function getErrorMessage(body: unknown, fallback: string): string {
    if (body && typeof body === "object") {
        const record = body as ApiError;
        return record.error ?? record.message ?? fallback;
    }
    return fallback;
}

export async function apiFetch<T>(
    path: string,
    options: {
        method?: string;
        body?: unknown;
        userId?: string | null;
    } = {}
): Promise<ApiResult<T>> {
    const { method = "GET", body, userId } = options;

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (userId) {
        headers["x-user"] = userId;
    }

    try {
        const response = await fetch(path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const text = await response.text();
        let parsed: unknown = null;

        if (text) {
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = text;
            }
        }

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                error: getErrorMessage(parsed, `Request failed (${response.status})`),
            };
        }

        return {
            ok: true,
            status: response.status,
            data: parsed as T,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        return { ok: false, status: 0, error: message };
    }
}

export const api = {
    getEvents: (userId?: string | null) =>
        apiFetch<import("../types/event").EventCard[]>("/api/v1/events", { userId }),

    getEvent: (eventId: string, userId?: string | null) =>
        apiFetch<import("../types/event").EventDetailView>(
            `/api/v1/events/${eventId}`,
            { userId }
        ),

    createEvent: (body: import("../types/event").CreateEventDTO, userId: string) =>
        apiFetch<import("../types/event").EventManageView>("/api/v1/events", {
            method: "POST",
            body,
            userId,
        }),

    updateEvent: (
        eventId: string,
        body: import("../types/event").UpdateEventDTO,
        userId: string
    ) =>
        apiFetch<import("../types/event").EventManageView>(
            `/api/v1/events/${eventId}`,
            { method: "PUT", body, userId }
        ),

    deleteEvent: (eventId: string, userId: string) =>
        apiFetch<{ message?: string }>(`/api/v1/events/${eventId}`, {
            method: "DELETE",
            userId,
        }),

    getUsers: (userId?: string | null) =>
        apiFetch<import("../types/user").InternalUserEntity[]>("/api/v1/users", {
            userId,
        }),

    getUser: (userId: string, actingUserId?: string | null) =>
        apiFetch<import("../types/user").InternalUserEntity | PublicUserProfile>(
            `/api/v1/users/${userId}`,
            { userId: actingUserId }
        ),

    createUser: (body: import("../types/user").CreateUserDTO) =>
        apiFetch<import("../types/user").InternalUserEntity>("/api/v1/users", {
            method: "POST",
            body,
        }),

    updateUser: (userId: string, body: import("../types/user").UpdateUserDTO) =>
        apiFetch<import("../types/user").InternalUserEntity>(
            `/api/v1/users/${userId}`,
            { method: "PUT", body, userId }
        ),

    deleteUser: (userId: string) =>
        apiFetch<{ message?: string }>(`/api/v1/users/${userId}`, {
            method: "DELETE",
            userId,
        }),

    getHealth: () => apiFetch<{ status: string }>("/health"),

    getStatus: () => apiFetch<ServiceStatus>("/api/v1/status"),
};
