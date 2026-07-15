import type { FastifyInstance } from "fastify";
import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
    register,
})

