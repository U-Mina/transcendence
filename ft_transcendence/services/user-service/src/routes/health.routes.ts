import type { FastifyInstance } from "fastify";

export async function healthCheckRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/health",
        async () => {
            return { service: "user-service", status: "healthy" };
        },
    );
};