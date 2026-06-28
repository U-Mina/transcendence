/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { eventService } from "../services/event.service";
import type { CreateEventDTO, UpdateEventDTO } from "../event.types"

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
                const userId = request.headers["x-user"] as string;
                const { eventId } = request.params;
                const event = await eventService.getEventById(eventId);
    
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
                const events = await eventService.getAllEvents();
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
                const creatorId = request.headers["x-user"] as string;
                const newEvent = await eventService.createEvent(creatorId, request.body);
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
                },
                Body: UpdateEventDTO,
            }>,
            reply: FastifyReply,
        ) => {
            try {
                // TODO: no manual pass userId later
                const userId = request.headers["x-user"] as string;
                const updatedEvent = await eventService.updateEvent(request.params.eventId, userId, request.body);
                if (!updatedEvent) {
                    return reply.status(500).send({ error: "Fail to update event." });
                }
                return reply.status(200).send(updatedEvent);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("not found")) {
                        return reply.status(404).send({ error: error.message });
                    } else if (error.message.includes("forbidden")) {
                        return reply.status(403).send({ error: error.message });
                    } else {
                        return reply.status(500).send({ error: "Fail to update event. "});
                    }
                }
            }
        },
    );

    // delete an event
    fastify.delete(
        "/events/:eventId",
        async (
            request: FastifyRequest<{
                Params: {
                    eventId: string,
                }
            }>,
            reply: FastifyReply,
        ) => {
            try {
                // temp userId
                const userId = request.headers["x-user"] as string;
                const { eventId } = request.params;
                const deletion = await eventService.deleteEvent(userId, eventId);
                // return value is not true, mean deletion fail
                if (!deletion) {
                    return reply.status(404).send({ error: "Event not found." });
                }
                return reply.status(200).send({ msg: "Successfully deleted event." });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("not found")) {
                        return reply.status(404).send({ error: error.message });
                    } else if (error.message.includes("forbidden")) {
                        return reply.status(403).send({ error: error.message });
                    } else {
                        return reply.status(500).send({ error: "Fail to delete." });
                    }
                }
            }
        },
    );
}