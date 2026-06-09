/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { eventService } from "../services/event.service";

export async function EventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get(
        "/:eventId",
        async (
            request: FastifyRequest<{
                Params: { eventId: string }
            }>,
            reply: FastifyReply,
        ) => {
            // a dummy userId for now, later will be: request.user.id
            const userId = request.headers["dummy-userId-before-JWT"] as string;
            const { eventId } = request.params;
            const event = await eventService.getEventById(userId, eventId);

            if (!event) {
                return reply.status(404).send({ error: "Event not found." });
            }

            return reply.status(200).send(event);
        },
    );

    // get all event
    fastify.get(
        "/",
        async (
            _: FastifyRequest,
            reply: FastifyReply,
        ) => {
            const events = await eventService.getAllEvents();
            // if (!eves || eves.length === 0) {
            //     return reply.status(404).send({ error: "Events not found. " });
            // }
            // even on empty, the get all event is still valid!
            return reply.status(200).send(events || []);
        },
    );
}