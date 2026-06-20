/**
 * handles incoming HTTP requests, pass URL parameter
 * this CRUD route for user-services
 * - /GET profile
 * - /Post to update profile
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { userService } from "../services/user.service";

export async function userServiceRoutes(fastify: FastifyInstance) {
    // get internal whole userEntity
    // dashboard is /home
    fastify.get(
        "/users/:userId",
        async (
            request: FastifyRequest<{
                Params: { userId: string }
            }>,
            reply: FastifyReply,
        ) => {
            try {
                const current_user_id = request.headers["dummy-id-before-JWT"] as string;
                const { userId } = request.params;
               const userProfile = await userService.getUserById(userId, current_user_id);
               if (!userProfile) {
                return reply.status(404).send({ error: "User not found." });
               }
               // service knows what to reture: full view or public view
               return reply.status(200).send(userProfile);

            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("not found")) {
                        return reply.status(404).send({ error: error.message});
                    } else if (error.message.includes("forbidden")) {
                        return reply.status(403).send({ error: error.message });
                    } else {
                        return reply.status(500).send({ error: error.message });
                    }
                }
            }
        }
    )
}