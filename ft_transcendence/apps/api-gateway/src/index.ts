/**
 * the ONLY connecting point with outside world
 */
import { healthCheckRoutes } from "./routes/health.routes";
import { eventGatewayRoutes } from "./routes/event.routes";
import { internalServiceStatusCheckRoutes } from "./routes/status.routes";
import Fastify from "fastify";

const fastify = Fastify({
    logger: true,
});

const start = async () => {
    fastify.register(healthCheckRoutes);
    fastify.register(eventGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(internalServiceStatusCheckRoutes, { prefix: "/api/v1" });

    try {
        fastify.listen({
            port: 3000,
            host: "0.0.0.0",
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();