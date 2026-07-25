import type { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch {
        return reply.status(401).send({ error: "Invalid or expired access token." });
    }
}

export function identityHeaders(request: FastifyRequest): Record<string, string> {
    return { "x-user": request.user.id };
}
