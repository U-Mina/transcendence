import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Shared with event-service seed — keep these IDs in sync. */
export const DEFAULT_PASSWORD = "Password123!";

/** Served from api-gateway via `database/assets` → `/uploads/avatars/defaults/`. */
export const defaultUsers = [
    {
        id: "f4b80163-2981-43e0-84f3-522806210e10",
        userName: "Dariusz Paluszkiewicz",
        userEmail: "dpaluszk@student.42heilbronn.de",
        intraName: "dpaluszk",
        avatarUrl: "/uploads/avatars/defaults/weepinbell.png",
    },
    {
        id: "f9978293-911a-4998-98d0-443b39bbc413",
        userName: "Erya Wu",
        userEmail: "ewu@student.42heilbronn.de",
        intraName: "ewu",
        avatarUrl: "/uploads/avatars/defaults/evee.png",
    },
    {
        id: "cb6d773c-dbce-44ba-8f0e-f260c009dbdc",
        userName: "Halime Pehlivan",
        userEmail: "hpehliva@student.42heilbronn.de",
        intraName: "hpehliva",
        avatarUrl: "/uploads/avatars/defaults/Pikachu.png",
    },
    {
        id: "af588e28-fb57-497b-b1ff-ee39b9fca146",
        userName: "Paula Drettas",
        userEmail: "pdrettas@student.42heilbronn.de",
        intraName: "pdrettas",
        avatarUrl: "/uploads/avatars/defaults/jigglepuff.png",
    },
] as const;

async function main() {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    for (const user of defaultUsers) {
        const byEmail = await prisma.user.findUnique({ where: { userEmail: user.userEmail } });
        if (byEmail && byEmail.id !== user.id) {
            await prisma.user.delete({ where: { id: byEmail.id } });
        }

        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                userName: user.userName,
                userEmail: user.userEmail,
                passwordHash,
                intraName: user.intraName,
                avatarUrl: user.avatarUrl,
            },
            create: {
                id: user.id,
                userName: user.userName,
                userEmail: user.userEmail,
                passwordHash,
                intraName: user.intraName,
                avatarUrl: user.avatarUrl,
            },
        });
    }

    console.log(`Seeded ${defaultUsers.length} default users (password: ${DEFAULT_PASSWORD})`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
