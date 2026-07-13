/**
 * later will implement
 * this is protected routes, namely, SHOULD NOT BE AVAILABLE without auth-Identity
 */
import type { FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware } from "../middleware/auth.middleware";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "http://localhost:3001";

export async function UserGatewayRoutes(fastify: FastifyInstance) {
    // get all users is now implemented, but it SHOULD go 'advanced user management' module
    fastify.get(
        "/users",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // get user by id
    fastify.get<{
        Params: { userId: string };
    }>(
        '/users/:userId',
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/${userId}`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // create user
    fastify.post<{
        Body: unknown;
    }>(
        "/users",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${USER_SERVICE_URL}/users`,
                request.body,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // update user
    fastify.put<{
        Params: { userId: string };
        Body: unknown;
    }>(
        "/users/:userId",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "PUT",
                `${USER_SERVICE_URL}/users/${userId}`,
                request.body,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // delete user (this maybe should be for ADMIN? or one can delete themselves?)
    fastify.delete<{
        Params: { userId: string };
    }>(
        "/users/:userId",
        // { preHandler: authMiddleware },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "DELETE",
                `${USER_SERVICE_URL}/users/${userId}`,
                undefined,
                {
                    "x-user": request.headers["x-user"] as string
                }
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );


}