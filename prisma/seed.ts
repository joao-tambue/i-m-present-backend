import { prisma } from "../lib/prisma";

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: "qr-check-in-demo" },
    update: {},
    create: {
      name: "QR Check-in Demo",
      slug: "qr-check-in-demo",
      startsAt: new Date("2026-06-01T09:00:00.000Z"),
      description: "Starter event for local Prisma verification.",
    },
  });

  await prisma.attendee.upsert({
    where: { email: "ana@example.com" },
    update: { eventId: event.id, checkedIn: true },
    create: {
      name: "Ana Silva",
      email: "ana@gmail.com",
      checkedIn: true,
      eventId: event.id,
    },
  });

  await prisma.attendee.upsert({
    where: { email: "joaotambue13@gmail.com" },
    update: { eventId: event.id },
    create: {
      name: "Joao Tambue",
      email: "joaotambue13@gmail.com",
      eventId: event.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
