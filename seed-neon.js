// Temporary script to seed Neon database
require('dotenv').config();
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Override DATABASE_URL for Neon
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Seeding Neon database...\n');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const agentPassword = await bcrypt.hash('agent123', 10);
  const writerPassword = await bcrypt.hash('writer123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@thespecialistrealty.com' },
    update: {},
    create: {
      email: 'admin@thespecialistrealty.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create agent user
  const agent = await prisma.user.upsert({
    where: { email: 'agent@thespecialistrealty.com' },
    update: {},
    create: {
      email: 'agent@thespecialistrealty.com',
      name: 'Sample Agent',
      password: agentPassword,
      role: UserRole.AGENT,
    },
  });
  console.log('✅ Created agent user:', agent.email);

  // Create writer user
  const writer = await prisma.user.upsert({
    where: { email: 'writer@thespecialistrealty.com' },
    update: {},
    create: {
      email: 'writer@thespecialistrealty.com',
      name: 'Sample Writer',
      password: writerPassword,
      role: UserRole.WRITER,
    },
  });
  console.log('✅ Created writer user:', writer.email);

  console.log('\n✅ Seed completed!');
  console.log('\nDefault login credentials:');
  console.log('Admin: admin@thespecialistrealty.com / admin123');
  console.log('Agent: agent@thespecialistrealty.com / agent123');
  console.log('Writer: writer@thespecialistrealty.com / writer123');
  console.log('\n⚠️  Please change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

