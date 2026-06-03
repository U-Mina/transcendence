/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest } from "fastify";
import { eventService } from "../services/event.service";

export async function EventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get(
        "/events/:id",
        async (
            request: FastifyRequest<{
                Params: { id: string }
            }>,
            reply,
        ) => {
            // case 1: :id === createdById
            const { id } = request.params;
            const eve = await eventService.getEventById(id);
            if (!eve) {
                return reply.status(404).send({ error: "Event not found." });
            }

            if (id === eve?.creatorId) {
                return eve;
            } else {
                // case 2: not created by this user
                /**
                 * may cause lint problem
                 * can also do: 
                 * { id: _, creatorId: __, safetyCheck: ___, ...generalEvent } = eve;
                 * like the map out in .service.ts
                */
                const { id, creatorId, safetyCheck, ...generalEvent } = eve;
                return generalEvent;
            }
        },
    );

    // get all event
    fastify.get(
        "/events",
        async (
            request: FastifyRequest,
            reply,
        ) => {
            const eves = await eventService.getAllEvents();
            if (!eves || eves.length === 0) {
                reply.status(404).send({ error: "Events not found. " });
            }
            return eves;
        }
    )
}