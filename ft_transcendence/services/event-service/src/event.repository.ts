import type { RowDataPacket } from "mysql2";
import type { InternalEventEntity, UpdateEventDTO } from "./event.types";
import { pool } from "./database";

type EventRow = RowDataPacket & {
    event_id: string;
    event_name: string;
    creator_id: string;
    start_time: Date;
    end_time: Date;
    category: string | null;
    description: string | null;
    location: string | null;
    comment: string | null;
    min_participant: number | null;
    image_url: string | null;
    safety_check: number;
    created_at: Date;
    updated_at: Date;
};

const eventColumns = `
    event_id, event_name, creator_id, start_time, end_time, category, description,
    location, comment, min_participant, image_url, safety_check, created_at, updated_at`;

class EventRepository {
    private mapEventRow(row: EventRow): InternalEventEntity {
        const mapped: InternalEventEntity = {
            eventId: row.event_id,
            eventName: row.event_name,
            creatorId: row.creator_id,
            startTime: new Date(row.start_time),
            endTime: new Date(row.end_time),
            safetyCheck: Boolean(row.safety_check),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
        if (row.category !== null) mapped.category = row.category;
        if (row.description !== null) mapped.description = row.description;
        if (row.location !== null) mapped.location = row.location;
        if (row.comment !== null) mapped.comment = row.comment;
        if (row.image_url !== null) mapped.imageUrl = row.image_url;
        return mapped;
    }

    async getAll(): Promise<InternalEventEntity[]> {
        const [rows] = await pool.query<EventRow[]>(`SELECT ${eventColumns} FROM events`);
        return rows.map((row) => this.mapEventRow(row));
    }

    async getEventById(eventId: string): Promise<InternalEventEntity | undefined> {
        const [rows] = await pool.query<EventRow[]>(`SELECT ${eventColumns} FROM events WHERE event_id = ? LIMIT 1`, [eventId]);
        return rows[0] ? this.mapEventRow(rows[0]) : undefined;
    }

    async createEvent(event: InternalEventEntity): Promise<InternalEventEntity> {
        await pool.execute(
            `INSERT INTO events (
                event_id, event_name, creator_id, start_time, end_time, category,
                description, location, comment, min_participant, safety_check, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event.eventId, event.eventName, event.creatorId, event.startTime, event.endTime,
                event.category ?? null, event.description ?? null, event.location ?? null,
                event.comment ?? null, null, event.safetyCheck, event.createdAt, event.updatedAt,
            ],
        );
        return event;
    }

    async updateEvent(eventId: string, eventInput: UpdateEventDTO): Promise<InternalEventEntity | undefined> {
        const fields: string[] = [];
        const values: Array<string | number | Date | null> = [];
        if (eventInput.eventName !== undefined) { fields.push("event_name = ?"); values.push(eventInput.eventName); }
        if (eventInput.startTime !== undefined) { fields.push("start_time = ?"); values.push(eventInput.startTime); }
        if (eventInput.endTime !== undefined) { fields.push("end_time = ?"); values.push(eventInput.endTime); }
        if (eventInput.category !== undefined) { fields.push("category = ?"); values.push(eventInput.category ?? null); }
        if (eventInput.description !== undefined) { fields.push("description = ?"); values.push(eventInput.description ?? null); }
        if (eventInput.location !== undefined) { fields.push("location = ?"); values.push(eventInput.location ?? null); }
        if (eventInput.minPaticipant !== undefined) { fields.push("min_participant = ?"); values.push(eventInput.minPaticipant ?? null); }
        if (fields.length === 0) return this.getEventById(eventId);
        fields.push("updated_at = CURRENT_TIMESTAMP");
        await pool.execute(`UPDATE events SET ${fields.join(", ")} WHERE event_id = ?`, [...values, eventId]);
        return this.getEventById(eventId);
    }

    async updateImage(eventId: string, imageUrl: string): Promise<InternalEventEntity | undefined> {
        await pool.execute("UPDATE events SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?", [imageUrl, eventId]);
        return this.getEventById(eventId);
    }

    async joinEvent(eventId: string, userId: string): Promise<void> {
        await pool.execute("INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)", [eventId, userId]);
    }

    async cancelJoin(eventId: string, userId: string): Promise<boolean> {
        const [result] = await pool.execute("DELETE FROM event_participants WHERE event_id = ? AND user_id = ?", [eventId, userId]);
        return ((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
    }

    async getJoinedEvents(userId: string): Promise<InternalEventEntity[]> {
        const [rows] = await pool.query<EventRow[]>(
            `SELECT ${eventColumns} FROM events
             INNER JOIN event_participants ON event_participants.event_id = events.event_id
             WHERE event_participants.user_id = ? ORDER BY events.start_time ASC`,
            [userId],
        );
        return rows.map((row) => this.mapEventRow(row));
    }

    async getJoinedCount(eventId: string): Promise<number> {
        const [rows] = await pool.query<Array<RowDataPacket & { joined_count: number | string }>>(
            "SELECT COUNT(*) AS joined_count FROM event_participants WHERE event_id = ?", [eventId],
        );
        return Number(rows[0]?.joined_count ?? 0);
    }

    async deleteEvent(eventId: string): Promise<boolean> {
        const [result] = await pool.execute("DELETE FROM events WHERE event_id = ?", [eventId]);
        return ((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
    }
}

export const eventRepository = new EventRepository();
