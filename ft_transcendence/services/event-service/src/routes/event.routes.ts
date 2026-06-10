/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { eventService } from "../services/event.service";
import { CreateEventDTO, UpdateEventDTO } from "../event.types"

export async function EventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    // the home page is /home, then on /home/events will go event board
    fastify.get(
        "events/:eventId",
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
        "/events",
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

    // create a new event
    fastify.post(
        "/events",
        async (
            request: FastifyRequest<{
                Body: CreateEventDTO,
            }>,
            reply: FastifyReply,
        ) => {
            const newEvent = await eventService.createEvent(request.body);
            if (!newEvent) {
                return reply.status(500).send({ error: "Fail to create new Event." });
            }
            return reply.status(200).send(newEvent);
        },
    );
}