import type { FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "https://localhost:3001";

export async function authGatewayRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: unknown }>(
        "/auth/register",
        async (request, reply) => {
        const result = await proxyToService("POST", `${USER_SERVICE_URL}/auth/register`, request.body);
        return reply.status(result.statusCode).send(result.body);
    });

    fastify.post<{ Body: unknown }>(
        "/auth/login",
        async (request, reply) => {
        const result = await proxyToService("POST", `${USER_SERVICE_URL}/auth/login`, request.body);
        if (result.statusCode !== 200 || !isSafeUser(result.body)) {
            return reply.status(result.statusCode).send(result.body);
        }
        const accessToken = fastify.jwt.sign({ id: result.body.id, email: result.body.userEmail });
        return reply.status(200).send({ accessToken, user: result.body });
    });
}

// validation of user input in backend
function isSafeUser(value: unknown): value is { id: string; userEmail: string } & Record<string, unknown> {
    return typeof value === "object" && value !== null
        && typeof (value as { id?: unknown }).id === "string"
        && typeof (value as { userEmail?: unknown }).userEmail === "string";
}
