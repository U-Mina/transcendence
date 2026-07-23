/**
 * the ONLY connecting point with outside world
 */
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { healthCheckRoutes } from "./routes/health.routes";
import { eventGatewayRoutes } from "./routes/event.routes";
import { UserGatewayRoutes } from "./routes/user.routes";
import { authGatewayRoutes } from "./routes/auth.routes";
import { ensureUploadDirectory, uploadDirectory } from "./services/media.service";
import { internalServiceStatusCheckRoutes } from "./routes/status.routes";
import { metricsRoutes } from "./routes/metrics.routes";
import { 
    httpRequestsTotal,
    httpRequestDurationSeconds,
} from "./metrics/http.metrics";
import Fastify from "fastify";
import fs from "node:fs";

const fastify = Fastify({
    logger: true,

    https: {
        key: fs.readFileSync(process.env.TLS_KEY_PATH!),
        cert: fs.readFileSync(process.env.TLS_CERT_PATH!),
    },
});

/**
 * IMPORTANT: register swagger and swaggerUI before register routes
*/

const start = async () => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET must be configured for the API gateway.");
    }
    await ensureUploadDirectory();
    await fastify.register(jwt, {
        secret: jwtSecret,
        sign: {
            iss: process.env.JWT_ISSUER || "transcendence-api-gateway",
            aud: process.env.JWT_AUDIENCE || "transcendence-frontend",
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        },
        verify: {
            allowedIss: process.env.JWT_ISSUER || "transcendence-api-gateway",
            allowedAud: process.env.JWT_AUDIENCE || "transcendence-frontend",
        },
    });
    await fastify.register(multipart, { limits: { files: 1, fileSize: 5 * 1024 * 1024 } });
    await fastify.register(fastifyStatic, { root: uploadDirectory, prefix: "/uploads/" });
    // register swagger generator
    fastify.register(swagger, {
        openapi: {
            openapi: "3.0.0",
            info: {
                title: "Transcendence API",
                description: "API documentation for the Transcendence social-media web application",
                version: "1.0.0"
            },
            servers: [{ url: "https://localhost:3000" }],
            tags: [ {name: "auth"}, {name: "system"}, {name: "events"}, {name: "users"} ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
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
    fastify.register(authGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(eventGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(UserGatewayRoutes, { prefix: "/api/v1" });
    fastify.register(internalServiceStatusCheckRoutes, { prefix: "/api/v1" });

    try {
        await fastify.listen({
            port: Number(process.env.PORT ?? 3000),
            host: "0.0.0.0",
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();
