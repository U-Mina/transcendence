/**
 * handles incoming HTTP requests, pass URL parameter
 * this CRUD route for user-services
 * - /GET profile
 * - /Post to update profile
 */
import { type FastifyInstance, type FastifyRequest } from "fastify";
import { getUserById, formatUserProfile } from "../services/user.service.js";

export async function userServiceRoutes(fastify: FastifyInstance) {
    // get internal whole userDTO
    fastify.get(
        "/:id",
        async (
            request: FastifyRequest<{
                Params: { id: string };
            }>,
            reply,
        ) => {
            try {
                const { id } = request.params;
                const user = await getUserById(id);

                if (!user) {
                    return reply.status(404).send({ error: "User not found." });
                }
                return reply.status(200).send(user);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to fetch userDTO." });
            }
        },
    );

    // get frontend userProfile
    fastify.get(
        "/:id/profile",
        async (
            request: FastifyRequest<{
                Params: { id: string }
            }>,
            reply,
        ) => {
            try {
                const { id } = request.params;
                const user = await getUserById(id);
                if (!user) {
                    return reply.status(404).send({ error: "User not found. "});
                }

                const profile = formatUserProfile(user);
                return reply.status(200).send(profile);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to find user profile." })
            }
        },
    );
}