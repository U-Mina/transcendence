import Fastify from "fastify";
import { healthCheckRoutes } from "./routes/health.routes";
import { userServiceRoutes } from "./routes/user.routes";

// create a fastify instance
const fastify = Fastify({
    logger: true
})

// start the server
const start = async () => {
    try {
        fastify.register(healthCheckRoutes);
        fastify.register(userServiceRoutes);
        
        // start listening, host is 0.0.0.0 for docker container to access the service
        fastify.listen({ port: 3001, host: "0.0.0.0" });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();

// old school way, just leave here for ref
// fastify.listen({ port: 3000 }, (err, address ) => {
//     if (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     };
//     console.log(`User-service server is listening at ${address}.`);
// });