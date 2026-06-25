/**
 * the main entry of event service server
 */
import Fastify from "fastify";
import { healthCheckRoutes } from "./routes/health.routes";
import { EventServiceRoutes } from "./routes/event.routes";

const fastify = Fastify({
    logger: true
});

const start = async () => {
    try {
        fastify.register(healthCheckRoutes);
        fastify.register(EventServiceRoutes);
        
        fastify.listen({ port: 3002, host: "0.0.0.0" });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    };
};

start();