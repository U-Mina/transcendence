import { type FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware } from "../middleware/auth.middleware";
// NOTE: if import the data-type, it is against microservice
// import type { CreateEventDTO, UpdateEventDTO } from "../../../../services/event-service/src/event.types";

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL ?? "http://localhost:3002";

export async function eventGatewayRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get<{
        Params: { eventId: string };
    }>(
        "/events/:eventId",
        {
            // { preHandler: authMiddleware },
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
            const { eventId } = request.params;
            const result = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/events/${eventId}`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // get all event
    fastify.get(
        "/events",
        {
            // { preHandler: authMiddleware },
            // schema is for api spec, describe what frontend receives from api-gateway
            schema: {
                summary: "List all events",
                description: "Returns all public event cards",
                tags: ["events"],
            }
        }, async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/events`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
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
            // { preHandler: authMiddleware },
            schema: {
                summary: "Create new event.",
                description: "Create a new event for current user",
                tags: ["events"],
                body: {
                    type: "object",
                    required: ["eventName", "startTime", "endTime"],
                    propertise: {
                        eventName: { type: "string", minLength: 1 },
                        startTime: { type: "string", format: "date-time" },
                        endTime: { type: "string", format: "date-time" },
                        category: { type: "string" },
                        descrption: { type: "string" },
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
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // to delete event
    fastify.delete<{
        Params: { eventId: string };
    }>(
        "/events/:eventId",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const { eventId } = request.params;
            const result = await proxyToService(
                "DELETE",
                `${EVENT_SERVICE_URL}/events/${eventId}`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // updating
    fastify.put<{
        Params: { eventId: string };
        Body: unknown;
    }>(
        "/events/:eventId",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const { eventId } = request.params;
            const result = await proxyToService(
                "PUT",
                `${EVENT_SERVICE_URL}/events/${eventId}`,
                request.body,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );

            return reply.status(result.statusCode).send(result.body);
        }
    );
}