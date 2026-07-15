import type { FastifyInstance } from "fastify";
import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
    register,
})

export async function metricsRoutes(fastify: FastifyInstance) {
    fastify.get("/metrics", async (_request, reply) => {
        reply.header("Content-Type", register.contentType);
        return register.metrics();
    });
}