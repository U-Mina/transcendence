/**
 * later will implement
 * this is protected routes, namely, SHOULD NOT BE AVAILABLE without auth-Identity
 */
import type { FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware, identityHeaders } from "../middleware/auth.middleware";
import { MediaError, removeStoredUpload, saveImage } from "../services/media.service";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "http://localhost:3001";

export async function UserGatewayRoutes(fastify: FastifyInstance) {
    // get all users is now implemented, but it SHOULD go 'advanced user management' module
    fastify.get(
        "/users",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users`
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // get user by id
    fastify.get<{
        Params: { userId: string };
    }>(
        '/users/:userId',
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/${userId}`
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // // create user
    // fastify.post<{
    //     Body: unknown;
    // }>(
    //     "/users",
    //     // { preHandler: authMiddleware },
    //     async (request, reply) => {
    //         const result = await proxyToService(
    //             "POST",
    //             `${USER_SERVICE_URL}/users`,
    //             request.body,
    //             {
    //                 "x-user": request.headers["x-user"] as string
    //             }
    //         );
    //         return reply.status(result.statusCode).send(result.body);
    //     }
    // );

    // update user
    fastify.put<{
        Params: { userId: string };
        Body: unknown;
    }>(
        "/users/:userId",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "PUT",
                `${USER_SERVICE_URL}/users/${userId}`,
                request.body,
                identityHeaders(request)
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    // delete user (this maybe should be for ADMIN? or one can delete themselves?)
    fastify.delete<{
        Params: { userId: string };
    }>(
        "/users/:userId",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "DELETE",
                `${USER_SERVICE_URL}/users/${userId}`,
                identityHeaders(request)
            );
            return reply.status(result.statusCode).send(result.body);
        }
    );

    fastify.post(
        "/users/me/avatar",
        { preHandler: authMiddleware },
        async (request, reply) => {
        let saved: {
            url: string;
            path: string
        } | undefined;

        try {
            const part = await request.file();
            if (!part) {
                return reply.status(400).send({ error: "Multipart field 'file' is required." });
            }
            saved = await saveImage(part, "avatars");
            const result = await proxyToService(
                "PUT",
                `${USER_SERVICE_URL}/users/${request.user.id}/avatar`,
                {
                    avatarUrl: saved.url
                },
                identityHeaders(request),
            );

            if (result.statusCode !== 200) {
                await removeStoredUpload(saved.url);
                return reply.status(result.statusCode).send(result.body);
            }
            const previousAvatarUrl = (result.body as { previousAvatarUrl?: unknown }).previousAvatarUrl;
            await removeStoredUpload(previousAvatarUrl);
            return reply.status(200).send({ avatarUrl: saved.url });
        } catch (error) {
            if (saved) {
                await removeStoredUpload(saved.url);
            }
            if (error instanceof MediaError) {
                return reply.status(error.statusCode).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Avatar upload failed." });
        }
    });
}