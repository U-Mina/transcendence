import "dotenv/config";
import Fastify from "fastify";

import { healthCheckRoutes } from "./routes/health.routes";
import { userServiceRoutes } from "./routes/user.routes";
import { metricsRoutes } from "./routes/metrics.routes";
import { requireInternalServiceToken } from "./middleware/internal-auth.middleware";
import {
    httpRequestsTotal,
    httpRequestDurationSeconds,
} from "./metrics/http.metrics";
import fs from "node:fs";

// Create a Fastify instance
const fastify = Fastify({
    logger: true,

    https: {
        key: fs.readFileSync(process.env.TLS_KEY_PATH!),
        cert: fs.readFileSync(process.env.TLS_CERT_PATH!),
    },
});

// Start the server
const start = async () => {
    try {
        if (!process.env.INTERNAL_SERVICE_TOKEN) {
            throw new Error("INTERNAL_SERVICE_TOKEN must be configured for user-service.");
        }

        fastify.addHook("onRequest", requireInternalServiceToken);

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
            port: Number(process.env.PORT ?? 3001),
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