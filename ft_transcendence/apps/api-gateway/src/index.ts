/**
 * the ONLY connecting point with outside world
 */
import { healthCheckRoutes } from "./routes/health.routes.js";
import { EventGatewayRoutes } from "./routes/event.routes.js";
import Fastify from "fastify";

const fastify = Fastify({
    logger: true,
});

const start = async () => {
    fastify.register(healthCheckRoutes);
    // may use prefix later
    fastify.register(EventGatewayRoutes, { prefix: "/api/v1" });

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