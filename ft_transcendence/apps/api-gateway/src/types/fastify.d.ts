import "fastify";
import "@fastify/jwt";

declare module "fastify" {
    interface FastifyRequest {
        metricsStartTime?: bigint;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: { id: string; email: string };
    }
}
