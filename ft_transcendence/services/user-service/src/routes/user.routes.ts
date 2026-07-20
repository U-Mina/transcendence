/**
 * handles incoming HTTP requests, pass URL parameter
 * this CRUD route for user-services
 * - /GET profile
 * - /Post to update profile
 */
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import { userService, UserServiceError } from "../services/user.service";
import type { CreateUserDTO, UpdateUserDTO, RegisterUserDTO, LoginUserDTO } from "../users.types";

// NOTE: dashboard is /home

/**
 * extract the user id from the request headers
 */
function currentUserId(request: FastifyRequest): string | undefined {
    const value = request.headers["x-user"];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * sendUserError is a helper function to send a user service error to the client
 */
function sendUserError(reply: FastifyReply, error: unknown) {
    if (error instanceof UserServiceError) return reply.status(error.statusCode).send({ error: error.message });
    return reply.status(500).send({ error: "User service operation failed." });
}

export async function userServiceRoutes(fastify: FastifyInstance) {

    // user registration routes
    fastify.post<{
        Body: RegisterUserDTO;
    }>(
        "/auth/register",
        async (request, reply) => {
            try {
                const newUser = await userService.registerUser(request.body);
                return reply.status(201).send(newUser)
            } catch (error) {
                return sendUserError(reply, error);
            }
        }
    );

    // user login, this is public endpoint
    fastify.post<{
        Body: LoginUserDTO;
    }>(
        "/auth/login",
        async (request, reply) => {
            try {
                const realUser = await userService.loginUser(request.body);
                return reply.status(200).send(realUser);
            } catch (error) {
                return sendUserError(reply, error);
            }
        }
    );

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
                const current_user_id = request.headers["x-user"] as string;
                const { userId } = request.params;
               const userProfile = await userService.getUserById(userId, current_user_id);
               if (!userProfile) {
                return reply.status(404).send({ error: "User not found." });
               }
               // service knows what to reture: full view or public view
               return reply.status(200).send(userProfile);

            } catch (error) {
                return sendUserError(reply, error);
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
                return sendUserError(reply, error);
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
                // this is REAL / auth userid, so it will have a match compare
                const userId = currentUserId(request);
                if (!userId || userId !== request.params.userId) {
                    return reply.status(401).send({ error: "Unauthenticated user." });
                }
                const updatedUser = await userService.updateUser(
                    userId,
                    request.params.userId,
                    request.body
                );

                if (!updatedUser) {
                    return reply.status(500).send({ error: "Fail to update profile." });
                }
                return reply.status(200).send(updatedUser);
            } catch (err) {
                return sendUserError(reply, err);
            }
        },
    );

    // update user avatar picture
    fastify.put(
        "/users/:userId/avatar",
        async (
            request: FastifyRequest<{
                Params: {
                    userId: string,
                },
                Body: {
                    avatarUrl: string,
                },
            }>,
            reply: FastifyReply,
        ) => {
            try {
                // this is REAL / auth userid, so it will have a match compare later
                const userId = currentUserId(request);
                if (!userId) {
                    return reply.status(401).send({
                        error: "Unauthenticated user.",
                    });
                }
                if (userId !== request.params.userId) {
                    return reply.status(403).send({
                        error: "Forbidden operation.",
                    });
                }
                const updatedUser = await userService.replaceAvatar(
                    userId,
                    request.body.avatarUrl,
                );
                if (!updatedUser) {
                    return reply.status(500).send({ error: "Fail to update profile." });
                }
                return reply.status(200).send(updatedUser);
            } catch (err) {
                return sendUserError(reply, err);
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
                const userId = currentUserId(request);
                if (!userId || userId !== request.params.userId) {
                    return reply.status(401).send({ error: "Unauthenticated user." });
                }
                await userService.deleteUser(userId, request.params.userId);                
                return reply.status(204).send({ message: "Successfully deleted user." });
            } catch (error) {
                return sendUserError(reply, error); 
            }
        },
    );
}