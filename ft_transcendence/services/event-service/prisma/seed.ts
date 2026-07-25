import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Must match user-service/prisma/seed.ts */
const users = {
    dariusz: "f4b80163-2981-43e0-84f3-522806210e10",
    erya: "f9978293-911a-4998-98d0-443b39bbc413",
    halime: "cb6d773c-dbce-44ba-8f0e-f260c009dbdc",
    paula: "af588e28-fb57-497b-b1ff-ee39b9fca146",
} as const;

const defaultEvents = [
    {
        eventId: "e1000001-0000-4000-8000-000000000001",
        eventName: "Campus Coffee Walk",
        creatorId: users.dariusz,
        category: "social",
        description: "Casual walk and coffee around campus.",
        location: "42 Heilbronn campus",
        minParticipant: 2,
        safetyCheck: false,
        startOffsetDays: 7,
        durationHours: 2,
        participantIds: [users.erya, users.halime],
    },
    {
        eventId: "e1000001-0000-4000-8000-000000000002",
        eventName: "Algo Study Session",
        creatorId: users.erya,
        category: "study",
        description: "Group session for algorithm practice.",
        location: "Cluster B",
        minParticipant: 3,
        safetyCheck: false,
        startOffsetDays: 10,
        durationHours: 3,
        participantIds: [users.paula, users.dariusz],
    },
    {
        eventId: "e1000001-0000-4000-8000-000000000003",
        eventName: "Board Game Night",
        creatorId: users.halime,
        category: "games",
        description: "Bring a favorite board game and join the night.",
        location: "Student lounge",
        minParticipant: 4,
        safetyCheck: true,
        startOffsetDays: 14,
        durationHours: 4,
        participantIds: [users.paula],
    },
    {
        eventId: "e1000001-0000-4000-8000-000000000004",
        eventName: "Weekend Hiking Trip",
        creatorId: users.paula,
        category: "outdoors",
        description: "Easy hike with a picnic stop.",
        location: "Schweinsberg trailhead",
        minParticipant: 3,
        safetyCheck: true,
        startOffsetDays: 21,
        durationHours: 5,
        participantIds: [users.halime, users.erya],
    },
] as const;

function eventWindow(offsetDays: number, durationHours: number) {
    const startTime = new Date();
    startTime.setUTCDate(startTime.getUTCDate() + offsetDays);
    startTime.setUTCHours(14, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setUTCHours(endTime.getUTCHours() + durationHours);

    return { startTime, endTime };
}

async function main() {
    for (const event of defaultEvents) {
        const { startTime, endTime } = eventWindow(event.startOffsetDays, event.durationHours);

        await prisma.event.upsert({
            where: { eventId: event.eventId },
            update: {
                eventName: event.eventName,
                creatorId: event.creatorId,
                startTime,
                endTime,
                category: event.category,
                description: event.description,
                location: event.location,
                minParticipant: event.minParticipant,
                safetyCheck: event.safetyCheck,
            },
            create: {
                eventId: event.eventId,
                eventName: event.eventName,
                creatorId: event.creatorId,
                startTime,
                endTime,
                category: event.category,
                description: event.description,
                location: event.location,
                minParticipant: event.minParticipant,
                safetyCheck: event.safetyCheck,
            },
        });

        await prisma.eventParticipant.deleteMany({ where: { eventId: event.eventId } });

        if (event.participantIds.length > 0) {
            await prisma.eventParticipant.createMany({
                data: event.participantIds.map((userId) => ({
                    eventId: event.eventId,
                    userId,
                })),
            });
        }
    }

    const joinCount = defaultEvents.reduce((sum, event) => sum + event.participantIds.length, 0);
    console.log(`Seeded ${defaultEvents.length} default events and ${joinCount} joins`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
