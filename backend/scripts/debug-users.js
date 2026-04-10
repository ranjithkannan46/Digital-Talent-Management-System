const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const q = process.argv[2] || "";
  const users = await prisma.user.findMany({
    where: q
      ? { email: { contains: q, mode: "insensitive" } }
      : undefined,
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log(JSON.stringify({ query: q, users }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

