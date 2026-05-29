// import type { FastifyInstance } from 'fastify';
import Fastify from "fastify";
import { healthCheckRoutes } from "./routes/health.routes.js";

// create a fastify instance
const fastify = Fastify({
    logger: true
})

// start the server
const startServer = async () => {
    try {
        // register routes
        await fastify.register(healthCheckRoutes);
        // start listening, host is 0.0.0.0 for docker container to access the service
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

startServer();

// old school way, just leave here for ref
// fastify.listen({ port: 3000 }, (err, address ) => {
//     if (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     };
//     console.log(`User-service server is listening at ${address}.`);
// });