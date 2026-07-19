/**
 * the ONLY connecting point with outside world
 */
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { healthCheckRoutes } from "./routes/health.routes";
import { eventGatewayRoutes } from "./routes/event.routes";
import { UserGatewayRoutes } from "./routes/user.routes";
import { internalServiceStatusCheckRoutes } from "./routes/status.routes";
import { metricsRoutes } from "./routes/metrics.routes";
import { 
    httpRequestsTotal,
    httpRequestDurationSeconds,
} from "./metrics/http.metrics";
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
            openapi: "3.0.0",
            info: {
                title: "Transcendence API",
                description: "API documentation for the Transcendence social-media web application",
                version: "1.0.0"
            },
            servers: [{ url: "http://localhost:3000" }],
            tags: [ {name: "auth"}, {name: "system"}, {name: "events"}, {name: "users"} ],
            components: {
                securitySchemes: {
                    // TODO: this will be real auth later
                    apiKey: {
                        type: "apiKey",
                        in: "header",
                        name: "x-api-key"
                    }
                }
            }            
        }
    });
    
    // register swagger ui, the 'localhost:3000/docs is the interactive UI web
    fastify.register(swaggerUI, {
        routePrefix: '/docs',
    });

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

    fastify.register(healthCheckRoutes);
    fastify.register(metricsRoutes);
    fastify.register(eventGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(UserGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(internalServiceStatusCheckRoutes, { prefix: "/api/v1" });

    try {
        await fastify.listen({
            port: 3000,
            host: "0.0.0.0",
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();