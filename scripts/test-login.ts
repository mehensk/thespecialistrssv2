// Test login credentials
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login credentials...\n');
    
    const email = 'admin@thespecialistrealty.com';
    const password = 'admin123';
    
    console.log(`Looking for user: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database');
      console.log('\n💡 Possible issues:');
      console.log('   1. Wrong database URL');
      console.log('   2. User doesn\'t exist');
      console.log('   3. Run: npm run db:seed');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`);

    console.log(`\n🔐 Testing password: "${password}"`);
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ Password is VALID - login should work!');
    } else {
      console.log('❌ Password is INVALID');
      console.log('\n💡 Possible issues:');
      console.log('   1. Password was changed in database');
      console.log('   2. Password hash is corrupted');
      console.log('   3. Run: npm run db:seed (to reset password)');
    }

    // Test other default users
    console.log('\n📋 Testing other default users:');
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'admin@thespecialistrealty.com',
            'agent@thespecialistrealty.com',
            'writer@thespecialistrealty.com',
          ],
        },
      },
      select: {
        email: true,
        role: true,
      },
    });

    users.forEach((u) => {
      console.log(`   ✅ ${u.email} (${u.role})`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('connect') || error.message.includes('database')) {
      console.error('\n💡 Database connection failed!');
      console.error('   Check your DATABASE_URL environment variable');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

