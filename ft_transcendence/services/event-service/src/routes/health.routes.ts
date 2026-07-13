/**
 * event service health check routes
 */
import type { FastifyInstance } from "fastify";
import { checkDatabaseHealth } from "../database";

export async function healthCheckRoutes(fastify: FastifyInstance) {
    fastify.get("/health", async () => {
        return {
            service: "event-service",
            status: "healthy",
        };
    });

    fastify.get("/health/db", async (_, reply) => {
        try {
            const db = await checkDatabaseHealth();
            return reply.status(200).send({
                service: "event-service",
                database: db.status,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown database error";
            return reply.status(503).send({
                service: "event-service",
                database: "unhealthy",
                error: message,
            });
        }
    });
};
