/**
 * event service health check routes
 */
import type { FastifyInstance } from "fastify";

export async function healthCheckRoutes(fastify: FastifyInstance) {
    fastify.get("/health", async () => {
        return {
            service: "event-service",
            status: "healthy",
        };
    });
};
