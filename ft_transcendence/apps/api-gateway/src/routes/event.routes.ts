import { type FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware, identityHeaders } from "../middleware/auth.middleware";
import { MediaError, removeStoredUpload, saveImage } from "../services/media.service";
// NOTE: if import the data-type, it is against microservice

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL ?? "https://localhost:3002";

export async function eventGatewayRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get<{
        Params: { eventId: string };
    }>(
        "/events/:eventId",
        {
            schema: {
                summary: "Get event by id",
                description: "Return detailed event card by event id",
                tags: ["events"],
                params: {
                    type: "object",
                    required: ["eventId"],
                    properties: {
                        eventId: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}`,
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // get all event
    fastify.get(
        "/events",
        {
            // schema is for api spec, describe what frontend receives from api-gateway
            schema: {
                summary: "List all events",
                description: "Returns all public event cards",
                tags: ["events"],
            }
        }, async (_, reply) => {
            const result = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/events`,
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // to create new event, the body must createEventDTO
    fastify.post<{
        Body: unknown;
    }>(
        "/events",
        {
            preHandler: authMiddleware,
            schema: {
                summary: "Create new event.",
                description: "Create a new event for current user",
                tags: ["events"],
                body: {
                    type: "object",
                    required: ["eventName", "startTime", "endTime"],
                    properties: {
                        eventName: { type: "string", minLength: 1 },
                        startTime: { type: "string", format: "date-time" },
                        endTime: { type: "string", format: "date-time" },
                        category: { type: "string" },
                        description: { type: "string" },
                        location: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${EVENT_SERVICE_URL}/events`,
                request.body,
                identityHeaders(request)
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // to delete event
    fastify.delete<{
        Params: { eventId: string };
    }>(
        "/events/:eventId",
        {
            preHandler: authMiddleware,
            schema: {
                summary: "Delete event.",
                description: "User can delete the event she/he created.",
                tags: ["events"],
                params: {
                    type: "object",
                    required: ["eventId"],
                    properties: {
                        eventId: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const { eventId } = request.params;
            const result = await proxyToService(
                "DELETE",
                `${EVENT_SERVICE_URL}/events/${eventId}`,
                {},
                identityHeaders(request)
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // updating event
    fastify.put<{
        Params: { eventId: string };
        Body: unknown;
    }>(
        "/events/:eventId",
        {
            preHandler: authMiddleware,
            schema: {
                summary: "Update existing event.",
                description: "User of event updates their event card.",
                tags: ["events"],
                params: {
                    type: "object",
                    required: ["eventId"],
                    properties: {
                        eventId: { type: "string" },
                    },
                },
                body: {
                    type: "object",
                    properties: {
                        eventName: { type: "string", minLength: 1 },
                        startTime: { type: "string", format: "date-time" },
                        endTime: { type: "string", format: "date-time" },
                        category: { type: "string" },
                        descrption: { type: "string" },
                        location: { type: "string" },
                    },
                },
            }
        },
        async (request, reply) => {
            const result = await proxyToService(
                "PUT",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}`,
                request.body,
                identityHeaders(request)
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // join event
    fastify.post<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/join",
        { preHandler: authMiddleware },
        async (request, reply) => {
        const result = await proxyToService(
            "POST",
            `${EVENT_SERVICE_URL}/events/${request.params.eventId}/join`,
            {},
            identityHeaders(request)
        );
        return reply.status(result.statusCode).send(result.body);
    });

    // cancel join of events
    fastify.delete<{
        Params: {
            eventId: string
        }
    }>(
        "/events/:eventId/join",
        {
            preHandler: authMiddleware
        },
        async (request, reply) => {
        const result = await proxyToService(
            "DELETE",
            `${EVENT_SERVICE_URL}/events/${request.params.eventId}/join`,
            undefined,
            identityHeaders(request)
        );
        return reply.status(result.statusCode).send(result.body);
    });

    // get joined event list
    fastify.get(
        "/users/me/events",
        {
            preHandler: authMiddleware
        },
        async (request, reply) => {
        const result = await proxyToService(
            "GET",
            `${EVENT_SERVICE_URL}/users/${request.user.id}/events`,
            undefined,
            identityHeaders(request)
        );
        return reply.status(result.statusCode).send(result.body);
    });

    // creator know how many ppl joined their event
    fastify.get<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/joined-count",
        { preHandler: authMiddleware }, 
        async (request, reply) => {
        const result = await proxyToService(
            "GET",
            `${EVENT_SERVICE_URL}/events/${request.params.eventId}/joined-count`,
            undefined,
            identityHeaders(request)
        );
        return reply.status(result.statusCode).send(result.body);
    });

    // upload event img
    fastify.post<{
        Params: {
            eventId: string;
        }
    }>(
        "/events/:eventId/image",
        { preHandler: authMiddleware },
        async (request, reply) => {
        let saved: {
            url: string;
            path: string
        } | undefined;

        try {
            const part = await request.file();
            if (!part) {
                return reply.status(400).send({ error: "Multipart field 'file' is required." });
            }
            saved = await saveImage(part, "events");
            const result = await proxyToService(
                "PUT",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}/image`,
                {
                    imageUrl: saved.url
                },
                identityHeaders(request),
            );
            
            if (result.statusCode !== 200) {
                await removeStoredUpload(saved.url);
                return reply.status(result.statusCode).send(result.body);
            }
            const previousImageUrl =
                typeof result.body === "object" && result.body !== null
                    ? (result.body as { previousImageUrl?: unknown }).previousImageUrl
                    : undefined;

            await removeStoredUpload(previousImageUrl);
            return reply.status(200).send({ imageUrl: saved.url });
        } catch (error) {
            if (saved) {
                await removeStoredUpload(saved.url);
            }
            if (error instanceof MediaError) {
                return reply.status(error.statusCode).send({ error: error.message });
            }
            request.log.error({ err: error }, "event image upload failed");
            const message = error instanceof Error ? error.message : "Event image upload failed.";
            return reply.status(500).send({ error: message });
        }
    });
}