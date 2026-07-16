import type { FastifyInstance } from "fastify";
import { metricsRegistry } from "../metrics/registry";

export async function metricsRoutes(fastify: FastifyInstance) {
    fastify.get("/metrics", async (_request, reply) => {
        reply.header("Content-Type", metricsRegistry.contentType);
        return await metricsRegistry.metrics();
    });
}