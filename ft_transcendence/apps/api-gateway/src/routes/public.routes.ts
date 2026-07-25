/**
 * Public API surface for external clients.
 * Auth: X-API-Key (not JWT). Rate-limited. Documented in Swagger under tag "public".
 */
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { actingUserHeaders, apiKeyMiddleware } from "../middleware/api-key.middleware";
import { proxyToService } from "../services/proxy.service";

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL ?? "https://localhost:3002";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "https://localhost:3001";

const EVENT_TAGS = ["Social", "Sports", "Games", "Food", "Learning", "Outdoors", "Arts & Culture"];

const eventIdParams = {
    type: "object",
    additionalProperties: false,
    required: ["eventId"],
    properties: { eventId: { type: "string", format: "uuid" } },
};

const userIdParams = {
    type: "object",
    additionalProperties: false,
    required: ["userId"],
    properties: { userId: { type: "string", format: "uuid" } },
};

const eventBodyProperties = {
    eventName: { type: "string", minLength: 1, maxLength: 255 },
    startTime: { type: "string", format: "date-time" },
    endTime: { type: "string", format: "date-time" },
    category: { type: "string", enum: EVENT_TAGS },
    description: { type: "string", maxLength: 5000 },
    location: { type: "string", maxLength: 255 },
    minParticipant: { type: "integer", minimum: 1 },
};

const publicSecurity = [{ apiKey: [] }];

const rateLimitHeaders = {
    description:
        "Rate limited to 100 requests per minute per client (IP). " +
        "Exceeded requests receive HTTP 429. Authenticate with header X-API-Key.",
};

function requireActingUser(
    request: FastifyRequest,
    reply: FastifyReply,
): Record<string, string> | undefined {
    const headers = actingUserHeaders(request);
    if (!headers) {
        void reply.status(400).send({
            error: "Header X-User-Id is required for this mutation (UUID of the acting user).",
        });
        return undefined;
    }
    return headers;
}

export async function publicApiRoutes(fastify: FastifyInstance) {
    await fastify.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
        errorResponseBuilder: (_request, context) => ({
            statusCode: 429,
            error: "Too Many Requests",
            message: `Public API rate limit exceeded. Retry after ${context.after}.`,
        }),
    });

    fastify.addHook("preHandler", apiKeyMiddleware);

    // GET /api/v1/public/events
    fastify.get(
        "/events",
        {
            schema: {
                tags: ["public"],
                summary: "List events (public API)",
                description: rateLimitHeaders.description,
                security: publicSecurity,
            },
        },
        async (_request, reply) => {
            const result = await proxyToService("GET", `${EVENT_SERVICE_URL}/events`);
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // GET /api/v1/public/events/:eventId
    fastify.get<{ Params: { eventId: string } }>(
        "/events/:eventId",
        {
            schema: {
                tags: ["public"],
                summary: "Get event by id (public API)",
                description: rateLimitHeaders.description,
                security: publicSecurity,
                params: eventIdParams,
            },
        },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}`,
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // POST /api/v1/public/events
    fastify.post<{ Body: unknown }>(
        "/events",
        {
            schema: {
                tags: ["public"],
                summary: "Create event (public API)",
                description:
                    `${rateLimitHeaders.description} Requires X-User-Id (acting user UUID).`,
                security: publicSecurity,
                headers: {
                    type: "object",
                    required: ["x-user-id"],
                    properties: {
                        "x-api-key": { type: "string" },
                        "x-user-id": { type: "string", format: "uuid" },
                    },
                },
                body: {
                    type: "object",
                    additionalProperties: false,
                    required: ["eventName", "startTime", "endTime", "category"],
                    properties: eventBodyProperties,
                },
            },
        },
        async (request, reply) => {
            const headers = requireActingUser(request, reply);
            if (!headers) return;
            const result = await proxyToService(
                "POST",
                `${EVENT_SERVICE_URL}/events`,
                request.body,
                headers,
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // PUT /api/v1/public/events/:eventId
    fastify.put<{ Params: { eventId: string }; Body: unknown }>(
        "/events/:eventId",
        {
            schema: {
                tags: ["public"],
                summary: "Update event (public API)",
                description:
                    `${rateLimitHeaders.description} Requires X-User-Id (must own the event).`,
                security: publicSecurity,
                params: eventIdParams,
                headers: {
                    type: "object",
                    required: ["x-user-id"],
                    properties: {
                        "x-api-key": { type: "string" },
                        "x-user-id": { type: "string", format: "uuid" },
                    },
                },
                body: {
                    type: "object",
                    additionalProperties: false,
                    minProperties: 1,
                    properties: eventBodyProperties,
                },
            },
        },
        async (request, reply) => {
            const headers = requireActingUser(request, reply);
            if (!headers) return;
            const result = await proxyToService(
                "PUT",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}`,
                request.body,
                headers,
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // DELETE /api/v1/public/events/:eventId
    fastify.delete<{ Params: { eventId: string } }>(
        "/events/:eventId",
        {
            schema: {
                tags: ["public"],
                summary: "Delete event (public API)",
                description:
                    `${rateLimitHeaders.description} Requires X-User-Id (must own the event).`,
                security: publicSecurity,
                params: eventIdParams,
                headers: {
                    type: "object",
                    required: ["x-user-id"],
                    properties: {
                        "x-api-key": { type: "string" },
                        "x-user-id": { type: "string", format: "uuid" },
                    },
                },
            },
        },
        async (request, reply) => {
            const headers = requireActingUser(request, reply);
            if (!headers) return;
            const result = await proxyToService(
                "DELETE",
                `${EVENT_SERVICE_URL}/events/${request.params.eventId}`,
                {},
                headers,
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // GET /api/v1/public/users/:userId — fifth endpoint
    fastify.get<{ Params: { userId: string } }>(
        "/users/:userId",
        {
            schema: {
                tags: ["public"],
                summary: "Get public user profile (public API)",
                description: rateLimitHeaders.description,
                security: publicSecurity,
                params: userIdParams,
            },
        },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/${request.params.userId}`,
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );
}
