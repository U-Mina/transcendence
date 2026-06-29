import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
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
        { preHandler: authMiddleware },
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
            preHandler: authMiddleware,
        },
        async (request, reply) => {
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
        { preHandler: authMiddleware },
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
        { preHandler: authMiddleware },
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
        { preHandler: authMiddleware },
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