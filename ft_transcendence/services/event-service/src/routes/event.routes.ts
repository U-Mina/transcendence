/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { eventService } from "../services/event.service";

export async function EventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get(
        "/:id",
        async (
            request: FastifyRequest<{
                Params: { id: string }
            }>,
            reply: FastifyReply,
        ) => {
            // case 1: :id === createdById
            const targetEventId  = request.params.id;
            const eve = await eventService.getEventById(targetEventId);

            if (!eve) {
                return reply.status(404).send({ error: "Event not found." });
            }

            // mock user id
            const currentUserId = 'user-01';
            if (currentUserId === eve.creatorId) {
                return reply.status(200).send(eve);
            } else {
                // case 2: not created by this user
                /**
                 * may cause lint problem
                 * can also do: 
                 * { id: _, creatorId: __, safetyCheck: ___, ...generalEvent } = eve;
                 * like the map out in .service.ts
                */
                const { eventId, creatorId, safetyCheck, ...generalEvent } = eve;
                return reply.status(200).send(generalEvent);
            }
        },
    );

    // get all event
    fastify.get(
        "/",
        async (
            request: FastifyRequest,
            reply: FastifyReply,
        ) => {
            const eves = await eventService.getAllEvents();
            // if (!eves || eves.length === 0) {
            //     return reply.status(404).send({ error: "Events not found. " });
            // }
            // even on empty, the get all event is still valid!
            return reply.status(200).send(eves || []);
        },
    );
}