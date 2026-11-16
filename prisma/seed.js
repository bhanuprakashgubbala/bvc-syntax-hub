const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'student@nextgenlabs.co' },
    update: {},
    create: {
      email: 'student@nextgenlabs.co',
      password: 'password123',
      fullName: 'Gubbala Bhanu Prakash',
      studentId: 'NL-2029-001',
      department: 'Computer Science',
      batchYear: '2029',
      totalPoints: 1250,
    },
  });
  console.log('Seeded User:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
