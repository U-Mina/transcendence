/**
 * for now, fake api key
 * it will used for auth, to verify 'does this user can visit protected routes or not'
 * NOTE: role system is not implemented, all logged in user have will access
 */

import type { FastifyRequest, FastifyReply } from "fastify";

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const expectedApiKey = process.env.DEV_API_KEP ?? "dev-secret";
    const apiKey = request.headers["x-api-key"];

    if (expectedApiKey !== apiKey) {
        return reply.status(401).send({ error: "Unauthoried user" });
    }
}