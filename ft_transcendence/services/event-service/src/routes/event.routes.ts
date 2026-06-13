/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { EventService } from "../services/event.service";
import { CreateEventDTO, UpdateEventDTO } from "../event.types"

export async function EventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    // the home page is /home, then on /home/events will go event board
    fastify.get(
        "/events/:eventId",
        async (
            request: FastifyRequest<{
                Params: { eventId: string }
            }>,
            reply: FastifyReply,
        ) => {
            try {
                // a dummy userId for now, later will be: request.user.id
                const userId = request.headers["dummy-userId-before-JWT"] as string;
                const { eventId } = request.params;
                const event = await EventService.getEventById(userId, eventId);
    
                if (!event) {
                    return reply.status(404).send({ error: "Event not found." });
                }
                return reply.status(200).send(event);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to get event." });
            }
        },
    );

    // get all event
    fastify.get(
        "/events",
        async (
            _: FastifyRequest,
            reply: FastifyReply,
        ) => {
            try {
                const events = await EventService.getAllEvents();
                // if (!eves || eves.length === 0) {
                //     return reply.status(404).send({ error: "Events not found. " });
                // }
                // even on empty, the get all event is still valid!
                return reply.status(200).send(events || []);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to fetch events." });
            }
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
            try {
                const newEvent = await EventService.createEvent(request.body);
                if (!newEvent) {
                    return reply.status(500).send({ error: "Fail to create new Event." });
                }
                return reply.status(200).send(newEvent);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to create new event." });
            }
        },
    );

    // update an existing event
    fastify.put(
        "/events/:eventId",
        async (
            request: FastifyRequest<{
                Params: {
                    eventId: string,
                    userId: string,
                },
                Body: UpdateEventDTO,
            }>,
            reply: FastifyReply,
        ) => {
            try {
                // TODO: no manual pass userId later
                const updatedEvent = await EventService.updateEvent(request.params.eventId, request.params.userId, request.body);
                if (!updatedEvent) {
                    return reply.status(500).send({ error: "Fail to update event." });
                }
                return reply.status(200).send(updatedEvent);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to update event. "});
            }
        },
    );
}