const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    throw new Error("Usage: node scripts/debug-notifs.js <userId>");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.read).length;

  console.log(JSON.stringify({ user, unread, notifications }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

