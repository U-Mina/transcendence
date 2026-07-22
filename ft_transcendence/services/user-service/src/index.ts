import "dotenv/config";
import Fastify from "fastify";

import { healthCheckRoutes } from "./routes/health.routes";
import { userServiceRoutes } from "./routes/user.routes";
import { metricsRoutes } from "./routes/metrics.routes";
import {
    httpRequestsTotal,
    httpRequestDurationSeconds,
} from "./metrics/http.metrics";

// Create a Fastify instance
const fastify = Fastify({
    logger: true,
});

// Start the server
const start = async () => {
    try {
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
        await fastify.register(userServiceRoutes);
        await fastify.register(metricsRoutes);

        // Start listening, host is 0.0.0.0 for Docker containers to access the service
        await fastify.listen({
            port: 3001,
            host: "0.0.0.0",
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();

// old school way, just leave here for ref
// fastify.listen({ port: 3000 }, (err, address ) => {
//     if (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     };
//     console.log(`User-service server is listening at ${address}.`);
// });