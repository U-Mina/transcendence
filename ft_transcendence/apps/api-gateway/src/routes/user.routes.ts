/**
 * later will implement
 * this is protected routes, namely, SHOULD NOT BE AVAILABLE without auth-Identity
 */
import type { FastifyInstance } from "fastify";
import { proxyToService } from "../services/proxy.service";
import { authMiddleware, identityHeaders } from "../middleware/auth.middleware";
import { MediaError, removeStoredUpload, saveImage } from "../services/media.service";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "https://localhost:3001";
const userIdParams = {
    type: "object",
    additionalProperties: false,
    required: ["userId"],
    properties: { userId: { type: "string", format: "uuid" } },
};
const friendIdParams = {
    type: "object",
    additionalProperties: false,
    required: ["friendId"],
    properties: { friendId: { type: "string", format: "uuid" } },
};
const requesterIdParams = {
    type: "object",
    additionalProperties: false,
    required: ["requesterId"],
    properties: { requesterId: { type: "string", format: "uuid" } },
};
const profileBody = {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
        userName: { type: "string", minLength: 2, maxLength: 100 },
        userContact: { type: ["string", "null"], maxLength: 50 },
        intraUrl: { type: ["string", "null"], maxLength: 255 },
    },
};

export async function UserGatewayRoutes(fastify: FastifyInstance) {
    // --- Friends & presence (before /users/:userId) ---

    fastify.post(
        "/users/me/heartbeat",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${USER_SERVICE_URL}/users/me/heartbeat`,
                {},
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.get(
        "/users/me/friends",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/me/friends`,
                undefined,
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.get(
        "/users/me/friend-requests",
        { preHandler: authMiddleware },
        async (request, reply) => {
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/me/friend-requests`,
                undefined,
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.post<{ Params: { requesterId: string } }>(
        "/users/me/friend-requests/:requesterId/accept",
        { preHandler: authMiddleware, schema: { params: requesterIdParams } },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${USER_SERVICE_URL}/users/me/friend-requests/${request.params.requesterId}/accept`,
                {},
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.post<{ Params: { requesterId: string } }>(
        "/users/me/friend-requests/:requesterId/reject",
        { preHandler: authMiddleware, schema: { params: requesterIdParams } },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${USER_SERVICE_URL}/users/me/friend-requests/${request.params.requesterId}/reject`,
                {},
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.delete<{ Params: { friendId: string } }>(
        "/users/me/friends/:friendId",
        { preHandler: authMiddleware, schema: { params: friendIdParams } },
        async (request, reply) => {
            const result = await proxyToService(
                "DELETE",
                `${USER_SERVICE_URL}/users/me/friends/${request.params.friendId}`,
                undefined,
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    fastify.post<{ Params: { userId: string } }>(
        "/users/:userId/friends",
        { preHandler: authMiddleware, schema: { params: userIdParams } },
        async (request, reply) => {
            const result = await proxyToService(
                "POST",
                `${USER_SERVICE_URL}/users/${request.params.userId}/friends`,
                {},
                identityHeaders(request),
            );
            return reply.status(result.statusCode).send(result.body);
        },
    );

    // get all users is now implemented, but it SHOULD go 'advanced user management' module
    fastify.get(
        "/users",
        { preHandler: authMiddleware },
        async (_request, reply) => {
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
        {
            schema: 
                {
                    params: userIdParams,
                }
        },
        async (request, reply) => {
            const { userId } = request.params;
            let headers: Record<string, string> | undefined;
            if (request.headers.authorization) {
                try {
                    await request.jwtVerify();
                    headers = identityHeaders(request);
                } catch {
                    return reply.status(401).send({ error: "Invalid or expired access token." });
                }
            }
            const result = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/users/${userId}`,
                undefined,
                headers,
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
        { preHandler: authMiddleware, schema: { params: userIdParams, body: profileBody } },
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
        { preHandler: authMiddleware, schema: { params: userIdParams } },
        async (request, reply) => {
            const { userId } = request.params;
            const result = await proxyToService(
                "DELETE",
                `${USER_SERVICE_URL}/users/${userId}`,
                undefined,
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
