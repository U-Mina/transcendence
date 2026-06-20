/**
 * handles incoming HTTP requests, pass URL parameter
 * this CRUD route for user-services
 * - /GET profile
 * - /Post to update profile
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { userService } from "../services/user.service";
import type { CreateUserDTO, UpdateUserDTO } from "../users.types";

// NOTE: dashboard is /home

export async function userServiceRoutes(fastify: FastifyInstance) {
    // get internal whole userEntity
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
                    } else if (error.message.includes("Forbidden")) {
                        return reply.status(403).send({ error: error.message });
                    } else {
                        return reply.status(500).send({ error: error.message });
                    }
                }
            }
        },
    );

    // get all user, ADMIN power
    fastify.get(
        "/users",
        async (
            _: FastifyRequest,
            reply: FastifyReply,
        ) => {
            try {
                const allUsers = await userService.getAllUser();
                return reply.status(200).send(allUsers || []);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to get user list." });
            }
        },
    );

    // create new user
    fastify.post(
        "/users",
        async (
            request: FastifyRequest<{
                Body: CreateUserDTO,
            }>,
            reply: FastifyReply,
        ) => {
            try {
                const newUser = await userService.createNewUser(request.body);
                if (!newUser) {
                    return reply.status(500).send({ error: "Fail to create new user." });
                }
                return reply.status(200).send(newUser);
            } catch (error) {
                return reply.status(500).send({ error: "Fail to create new user." });
            } 
        },
    );

    // update existing
    fastify.put(
        "/users/:userId",
        async (
            request: FastifyRequest<{
                Params: {
                    userId: string,
                },
                Body: UpdateUserDTO,
            }>,
            reply: FastifyReply,
        ) => {
            try {
                const current_user_id = request.headers["dummy-id-before-JWT"] as string;
                const { userId } = request.params;
                const updatedUser = await userService.updateUser(current_user_id, userId, request.body);
                if (!updatedUser) {
                    return reply.status(500).send({ error: "Fail to update profile." });
                }
                return reply.status(200).send(updatedUser);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("not found")) {
                        return reply.status(404).send({ error: err.message });
                    } else if (err.message.includes("Forbidden")) {
                        return reply.status(403).send({ error: err.message });
                    } else {
                        return reply.status(500).send({ error: err.message });
                    }
                }
            }
        },
    );

    // delete user
    fastify.delete(
        "/users/:userId",
        async (
            request: FastifyRequest<{
                Params: {
                    userId: string
                }
            }>,
            reply: FastifyReply,
        ) => {
            try {
                const current_user_id = request.headers["dummy-id-before-JWT"] as string;
                const { userId } = request.params;
                const deleted = await userService.deleteUser(current_user_id, userId);
                if (!deleted) {
                    return reply.status(500).send({ error: "Fail to delete user profile." });
                }
                return reply.status(200).send({ message: "Successfully deleted user." });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("not found")) {
                        return reply.status(404).send({ error: error.message });
                    } else if (error.message.includes("Forbidden")) {
                        return reply.status(403).send({ error: error.message });
                    } else {
                        return reply.status(500).send({ error: "Fail to delete user profile." });
                    }
                }
            }
        },
    );
}