/**
 * health check for api-gateway before starting forwarding/returning any request/response
 */
import type { FastifyInstance } from "fastify";

export async function healthCheckRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/health",
        async () => {
            return {
                service: "api-gateway-service",
                status: "healthy",
            };
        }
    );
};