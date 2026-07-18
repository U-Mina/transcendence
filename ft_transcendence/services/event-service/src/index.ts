/**
 * The main entry point of the event service server
 */

import "dotenv/config";
import Fastify from "fastify";

import { healthCheckRoutes } from "./routes/health.routes";
import { eventServiceRoutes } from "./routes/event.routes";
import { metricsRoutes } from "./routes/metrics.routes";
import {
    httpRequestsTotal,
    httpRequestDurationSeconds,
} from "./metrics/http.metrics";

const fastify = Fastify({
    logger: true,
});

const start = async () => {
    fastify.addHook("onRequest", async (request) => {
        request.metricsStartTime = process.hrtime.bigint();
    });

    fastify.addHook("onResponse", async (request, reply) => {
        const startTime = request.metricsStartTime;

        if (startTime === undefined) {
            return;
        }

        const durationSeconds =
            Number(process.hrtime.bigint() - startTime) / 1_000_000_000;

        const route = request.routeOptions.url ?? request.url;
        const statusCode = reply.statusCode.toString();

        httpRequestsTotal.inc({
            method: request.method,
            route,
            status_code: statusCode,
        });

        httpRequestDurationSeconds.observe(
            {
                method: request.method,
                route,
                status_code: statusCode,
            },
            durationSeconds,
        );
    });

    await fastify.register(healthCheckRoutes);
    await fastify.register(eventServiceRoutes);
    await fastify.register(metricsRoutes);

    try {
        await fastify.listen({
            port: 3002,
            host: "0.0.0.0",
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();