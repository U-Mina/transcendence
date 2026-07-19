/**
 * Prisma Client singleton.
 * Prevents exhausting DB connections when `tsx watch` hot-reloads modules.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
