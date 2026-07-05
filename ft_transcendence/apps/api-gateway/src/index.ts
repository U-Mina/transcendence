/**
 * the ONLY connecting point with outside world
 */
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { healthCheckRoutes } from "./routes/health.routes";
import { eventGatewayRoutes } from "./routes/event.routes";
import { UserGatewayRoutes } from "./routes/user.routes";
import { internalServiceStatusCheckRoutes } from "./routes/status.routes";
import Fastify from "fastify";

const fastify = Fastify({
    logger: true,
});

/**
 * IMPORTANT: register swagger and swaggerUI before register routes
*/

const start = async () => {
    // register swagger generator
    fastify.register(swagger, {
        openapi: {
            openapi: "3.0.0.0",
            info: {
                title: "Transcendence API",
                description: "API documentation for the Transcendence social-media web application",
                version: "1.0.0"
            },
            servers: [{ url: "http://localhost:3000" }],
            tags: [ {name: "auth"}, {name: "system"}, {name: "events"}, {name: "users"} ]
        }
    });
    
    // register swagger ui, the 'localhost:3000/docs is the interactive UI web
    fastify.register(swaggerUI, {
        routePrefix: '/docs',
    });

    fastify.register(healthCheckRoutes);
    fastify.register(eventGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(UserGatewayRoutes, { prefix: "/api/v1" });
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