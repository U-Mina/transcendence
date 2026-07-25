/**
 * routes for event-service
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { eventService, EventServiceError } from "../services/event.service";
import type { CreateEventDTO, UpdateEventDTO } from "../event.types"

function currentUserId(request: FastifyRequest): string | undefined {
    const value = request.headers["x-user"];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

function sendEventError(reply: FastifyReply, error: unknown) {
    if (error instanceof EventServiceError) {
        return reply.status(error.statusCode).send({ error: error.message });
    }
    return reply.status(500).send({ error: "Event service operation failed." });
}

function requireUser(request: FastifyRequest, reply: FastifyReply): string | undefined {
    const userId = currentUserId(request);
    if (!userId) reply.status(401).send({ error: "Unauthenticated user." });
    return userId;
}

export async function eventServiceRoutes(fastify: FastifyInstance) {
    // get event by id
    // the home page is /home, then on /home/events will go event board
    fastify.get<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId",
        async (request, reply) => {
            try {
                const event = await eventService.getEventById(request.params.eventId);
    
                if (!event) {
                    return reply.status(404).send({ error: "Event not found." });
                }
                return reply.status(200).send(event);
            } catch (error) {
                return sendEventError(reply, error);
            }
        },
    );

    // get events with optional search, filter, sort, and pagination query options
    fastify.get<{
        Querystring: Record<string, unknown>;
    }>(
        "/events",
        async (request, reply) => {
            try {
                const events = await eventService.getAllEvents(request.query);
                return reply.status(200).send(events);
            } catch (error) {
                return sendEventError(reply, error);
            }
        },
    );

    // create a new event
    fastify.post<{
        Body: CreateEventDTO;
    }>(
        "/events",
        async (request, reply) => {
            // with real auth, token is in every request
            const creatorId = requireUser(request, reply);
            if (!creatorId) {
                return ;
            }
            try {
                const newEvent = await eventService.createEvent(creatorId, request.body);
                return reply.status(201).send(newEvent);
            } catch (error) {
                return sendEventError(reply, error);
            }
        },
    );

    // update an existing event
    fastify.put<{
        Params: {
            eventId: string;
        },
        Body: UpdateEventDTO;
    }>(
        "/events/:eventId",
        async (request, reply) => {
            const userId = requireUser(request, reply);
            if (!userId) {
                return;
            }
            try {
                const updatedEvent = await eventService.updateEvent(request.params.eventId, userId, request.body);
                return reply.status(200).send(updatedEvent);
            } catch (error) {
                return sendEventError(reply, error);
            }
        },
    );

    // delete an event
    fastify.delete<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId",
        async (request, reply) => {
            const userId = requireUser(request, reply);
            if (!userId) {
                return;
            }
            try {
                const { eventId } = request.params;
                const deletion = await eventService.deleteEvent(userId, eventId);
                return reply.status(204).send({ msg: "Successfully deleted event." });
            } catch (error) {
                return sendEventError(reply, error);
            }
        },
    );

    fastify.post<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/join",
        async (request, reply) => {
        const userId = requireUser(request, reply);
        if (!userId) {
            return;
        }
        try {
            await eventService.joinEvent(request.params.eventId, userId);
            return reply.status(201).send({ message: "Event joined successfully." });
        } catch (error) {
            return sendEventError(reply, error);
        }
    });

    // cancel joined event
    fastify.delete<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/join",
        async (request, reply) => {
        const userId = requireUser(request, reply);
        if (!userId) {
            return;
        }
        try {
            await eventService.cancelJoin(request.params.eventId, userId);
            return reply.status(204).send();
        } catch (error) {
            return sendEventError(reply, error);
        }
    });

    fastify.get<{
        Params: {
            userId: string;
        }
    }>(
        "/users/:userId/events",
        async (request, reply) => {
        const userId = requireUser(request, reply);
        if (!userId) {
            return;
        }
        if (userId !== request.params.userId) {
            return reply.status(403).send({ error: "Forbidden operation." });
        }
        try {
            const eventList = await eventService.getJoinedEvents(userId);
            return reply.status(200).send(eventList);
        } catch (error) {
            return sendEventError(reply, error);
        }
    });

    fastify.get<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/joined-count",
        async (request, reply) => {
        const userId = requireUser(request, reply);
        if (!userId) {
            return;
        }
        try {
            const joinedCount = await eventService.getJoinedCount(request.params.eventId, userId);
            return reply.status(200).send(joinedCount);
        } catch (error) {
            return sendEventError(reply, error);
        }
    });

    fastify.put<{
        Params: {
            eventId: string;
        };
        Body: {
            imageUrl: string;
        }
    }>(
        "/events/:eventId/image",
        async (request, reply) => {
        const userId = requireUser(request, reply);
        if (!userId) {
            return;
        }
        try {
            const newImg = await eventService.replaceImage(request.params.eventId, userId, request.body.imageUrl);
            return reply.status(200).send(newImg);
        } catch (error) {
            return sendEventError(reply, error);
        }
    });
}
