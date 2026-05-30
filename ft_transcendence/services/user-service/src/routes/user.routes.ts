/**
 * this CRUD route for user-services
 * - /GET profile
 * - /Post to update profile
 */
import { type FastifyInstance } from "fastify";

export async function userServiceRoutes(fastify: FastifyInstance) {
    // get
    fastify.get(
        "/users/:id",
        async (request, reply) => {

        }
    )





    // post
}