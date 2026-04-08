const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const assignedToId = process.argv[2];
  if (!assignedToId) {
    throw new Error("Usage: node scripts/debug-tasks.js <assignedToId>");
  }

  const tasks = await prisma.task.findMany({
    where: { assignedToId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      createdById: true,
      assignedToId: true,
    },
  });

  console.log(JSON.stringify({ assignedToId, count: tasks.length, tasks }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

