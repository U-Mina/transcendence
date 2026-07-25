import { timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

function safeEqual(provided: string, expected: string): boolean {
    const left = Buffer.from(provided);
    const right = Buffer.from(expected);
    if (left.length !== right.length) {
        return false;
    }
    return timingSafeEqual(left, right);
}

/**
 * Require a valid X-API-Key for the public API surface.
 * Key is configured via PUBLIC_API_KEY (preferred) or legacy DEV_API_KEY.
 */
export async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const expected = process.env.PUBLIC_API_KEY || process.env.DEV_API_KEY;
    if (!expected) {
        request.log.error("PUBLIC_API_KEY is not configured on the API gateway.");
        return reply.status(500).send({ error: "Public API is not configured." });
    }

    const provided = request.headers["x-api-key"];
    if (typeof provided !== "string" || !provided || !safeEqual(provided, expected)) {
        return reply.status(401).send({
            error: "Invalid or missing API key. Send header X-API-Key.",
        });
    }
}

export function actingUserHeaders(request: FastifyRequest): Record<string, string> | undefined {
    const userId = request.headers["x-user-id"];
    if (typeof userId !== "string" || !userId.trim()) {
        return undefined;
    }
    return { "x-user": userId.trim() };
}
