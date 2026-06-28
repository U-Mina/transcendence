/**
 * @public not protected routes, namely, vistor/evaluator can visit
 * this is to check the health of api gateway and availability of internal service
 */
import { proxyToService } from "../services/proxy.service";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "http://localhost:3001";
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL ?? "http:localhost:3002";

export async function internalServiceStatusCheckRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/status",
        async(
            _: FastifyRequest,
            reply: FastifyReply,
        ) => {
            const userServiceStatus = await proxyToService(
                "GET",
                `${USER_SERVICE_URL}/health`
            );

            const eventServiceStatus = await proxyToService(
                "GET",
                `${EVENT_SERVICE_URL}/health`,
            );

            /** here return 200 for the 'api-gateway' status check itself, no matter what
             * the status of internal service is, api-gatwway status check already RETURNED the result
            */
            return reply.status(200).send({
                service: "api gateway status check",
                status: "healthy",
                dependencies: {
                    userServiceStatus: {
                        statusCode: userServiceStatus.statusCode,
                        body: userServiceStatus.body,
                    },
                    eventServiceStatus: {
                        statusCode: eventServiceStatus.statusCode,
                        body: eventServiceStatus.body,
                    },
                }
            });
        }
    );
}