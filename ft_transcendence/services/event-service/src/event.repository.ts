/**
 * for a easier adaption to real data base
 * for CRUD ops — Prisma-backed implementation
 */
import { Prisma, type Event as EventRow } from "@prisma/client";
import { prisma } from "./libs/prisma";
import type { InternalEventEntity, UpdateEventDTO } from "./event.types";

// Local dev fallback: used whenever the caller didn't resolve a real
// user id from the `x-user` header (e.g. calling the API directly in dev).
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "dev-user-0001";

function mapEventRow(row: EventRow): InternalEventEntity {
    const mapped: InternalEventEntity = {
        eventId: row.eventId,
        eventName: row.eventName,
        creatorId: row.creatorId,
        startTime: row.startTime,
        endTime: row.endTime,
        safetyCheck: row.safetyCheck,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };

    if (row.category !== null) {
        mapped.category = row.category;
    }
    if (row.description !== null) {
        mapped.description = row.description;
    }
    if (row.location !== null) {
        mapped.location = row.location;
    }
    if (row.comment !== null) {
        mapped.comment = row.comment;
    }
    return mapped;
}

class EventRepository {
    // get all
    async getAll(): Promise<InternalEventEntity[]> {
        const rows = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
        return rows.map(mapEventRow);
    }

    // get by id
    async getEventById(eventId: string): Promise<InternalEventEntity | undefined> {
        const row = await prisma.event.findUnique({ where: { eventId } });
        return row ? mapEventRow(row) : undefined;
    }

    // create event (push new to repo.ts)
    // NOTE: falls back to DEFAULT_USER_ID if creatorId was not resolved from the x-user header
    async createEvent(event: InternalEventEntity): Promise<InternalEventEntity | undefined> {
        const creatorId = event.creatorId || DEFAULT_USER_ID;

        const created = await prisma.event.create({
            data: {
                eventId: event.eventId,
                eventName: event.eventName,
                creatorId,
                startTime: event.startTime,
                endTime: event.endTime,
                category: event.category ?? null,
                description: event.description ?? null,
                location: event.location ?? null,
                comment: event.comment ?? null,
                safetyCheck: event.safetyCheck,
            },
        });
        return mapEventRow(created);
    }

    // idempotent create-or-replace, replaces the old manual "INSERT ... ON DUPLICATE KEY UPDATE"
    async upsertEvent(event: InternalEventEntity): Promise<InternalEventEntity> {
        const creatorId = event.creatorId || DEFAULT_USER_ID;

        const upserted = await prisma.event.upsert({
            where: { eventId: event.eventId },
            create: {
                eventId: event.eventId,
                eventName: event.eventName,
                creatorId,
                startTime: event.startTime,
                endTime: event.endTime,
                category: event.category ?? null,
                description: event.description ?? null,
                location: event.location ?? null,
                comment: event.comment ?? null,
                safetyCheck: event.safetyCheck,
            },
            update: {
                eventName: event.eventName,
                startTime: event.startTime,
                endTime: event.endTime,
                category: event.category ?? null,
                description: event.description ?? null,
                location: event.location ?? null,
                comment: event.comment ?? null,
                safetyCheck: event.safetyCheck,
            },
        });
        return mapEventRow(upserted);
    }

    // update event
    async updateEvent(eventId: string, eventInput: UpdateEventDTO): Promise<InternalEventEntity | undefined> {
        const data: Prisma.EventUpdateInput = {};

        if (eventInput.eventName !== undefined) {
            data.eventName = eventInput.eventName;
        }
        if (eventInput.startTime !== undefined) {
            data.startTime = eventInput.startTime;
        }
        if (eventInput.endTime !== undefined) {
            data.endTime = eventInput.endTime;
        }
        if (eventInput.category !== undefined) {
            data.category = eventInput.category ?? null;
        }
        if (eventInput.description !== undefined) {
            data.description = eventInput.description ?? null;
        }
        if (eventInput.location !== undefined) {
            data.location = eventInput.location ?? null;
        }
        if (eventInput.minPaticipant !== undefined) {
            data.minParticipant = eventInput.minPaticipant ?? null;
        }

        if (Object.keys(data).length === 0) {
            return this.getEventById(eventId);
        }

        try {
            const updated = await prisma.event.update({ where: { eventId }, data });
            return mapEventRow(updated);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                // record to update not found
                return undefined;
            }
            throw error;
        }
    }

    // delete (popout from repo.ts), here can return full event-data, but this will be too waste of mem
    async deleteEvent(eventId: string): Promise<boolean> {
        try {
            await prisma.event.delete({ where: { eventId } });
            return true;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                // record to delete not found
                return false;
            }
            throw error;
        }
    }
}

export const eventRepository = new EventRepository();