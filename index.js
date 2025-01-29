const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create user
  const user = await prisma.user.create({
    data: {
      name: "test user",
      email: "john@example.com",
      password: "password",
    },
  });

  console.log("User created:", user);

  // Find all users
  const users = await prisma.user.findMany();
  console.log("List of users:", users);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });