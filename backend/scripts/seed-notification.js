const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];
  if (!userId) throw new Error("Usage: node scripts/seed-notification.js <userId>");

  const n = await prisma.notification.create({
    data: {
      userId,
      title: "Test Notification",
      message: "If you can see this, notifications are working.",
      type: "info",
    },
  });

  console.log(JSON.stringify(n, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });