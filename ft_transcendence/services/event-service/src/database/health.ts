import { prisma } from "../libs/prisma";

export async function checkDatabaseHealth(): Promise<{ status: "healthy" }> {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy" };
}
