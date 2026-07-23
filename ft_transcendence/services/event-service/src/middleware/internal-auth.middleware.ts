import type { FastifyReply, FastifyRequest } from "fastify";

const PUBLIC_PATHS = new Set(["/health", "/health/db", "/metrics"]);

/**
 * Require a shared internal token on every request except health/metrics probes.
 * Callers: api-gateway (and any future peer services).
 */
export async function requireInternalServiceToken(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const path = request.url.split("?")[0] ?? request.url;
    if (PUBLIC_PATHS.has(path)) {
        return;
    }

    const expected = process.env.INTERNAL_SERVICE_TOKEN;
    if (!expected) {
        return reply.status(500).send({
            error: "INTERNAL_SERVICE_TOKEN is not configured.",
        });
    }

    const provided = request.headers["x-internal-token"];
    if (typeof provided !== "string" || provided !== expected) {
        return reply.status(401).send({ error: "Unauthorized internal request." });
    }
}
