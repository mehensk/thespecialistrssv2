import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@thespecialistrealty.com';
  const adminPassword = 'admin123'; // Change this in production!

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample agent user
  const agentEmail = 'agent@thespecialistrealty.com';
  const agentPassword = 'agent123'; // Change this in production!

  const agentHashedPassword = await bcrypt.hash(agentPassword, 10);

  const agent = await prisma.user.upsert({
    where: { email: agentEmail },
    update: {},
    create: {
      email: agentEmail,
      name: 'Sample Agent',
      password: agentHashedPassword,
      role: UserRole.AGENT,
    },
  });

  console.log('Created agent user:', agent.email);

  // Create sample writer user
  const writerEmail = 'writer@thespecialistrealty.com';
  const writerPassword = 'writer123'; // Change this in production!

  const writerHashedPassword = await bcrypt.hash(writerPassword, 10);

  const writer = await prisma.user.upsert({
    where: { email: writerEmail },
    update: {},
    create: {
      email: writerEmail,
      name: 'Sample Writer',
      password: writerHashedPassword,
      role: UserRole.WRITER,
    },
  });

  console.log('Created writer user:', writer.email);

  console.log('\n✅ Seed completed!');
  console.log('\nDefault login credentials:');
  console.log('Admin: admin@thespecialistrealty.com / admin123');
  console.log('Agent: agent@thespecialistrealty.com / agent123');
  console.log('Writer: writer@thespecialistrealty.com / writer123');
  console.log('\n⚠️  Please change these passwords in production!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

