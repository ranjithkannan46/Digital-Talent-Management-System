const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
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
      createdBy: { select: { email: true, name: true } },
      assignedTo: { select: { email: true, name: true } },
    },
  });

  console.log(JSON.stringify({ count: tasks.length, tasks }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

