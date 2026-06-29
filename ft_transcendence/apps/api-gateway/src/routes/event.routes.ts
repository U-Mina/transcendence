import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware } from "../middleware/auth.middleware";

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL ?? "http://localhost:3002";

export async function eventGatewayRoutes(fastify: FastifyInstance) {
    // get event by id
    fastify.get(
        "/events/:eventId",
        async (
            request: FastifyRequest<{
                Params: { eventId: string }
            }>,
            reply: FastifyReply,
        ) => {
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
        async (
            request: FastifyRequest,
            reply: FastifyReply,
        ) => {
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
}