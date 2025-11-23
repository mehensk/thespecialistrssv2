// Script to help set up two Neon databases (dev and production)
// Run this after creating your databases in Neon dashboard

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('📋 Neon Database Setup Helper\n');
console.log('This script will help you set up your dev and production Neon databases.\n');

// Instructions
console.log('📝 Steps to create Neon databases:');
console.log('1. Go to: https://console.neon.tech/');
console.log('2. Create a new project (this will be your DEV database)');
console.log('3. Copy the connection string (pooler or direct)');
console.log('4. Create another project (this will be your PRODUCTION database)');
console.log('5. Copy that connection string too\n');

console.log('💡 Connection String Format:');
console.log('postgresql://user:password@host/database?sslmode=require\n');

console.log('📝 After creating databases, update your .env file:\n');
console.log('For LOCAL DEV (use DEV Neon database):');
console.log('DATABASE_URL="postgresql://user:password@host/dev-database?sslmode=require"');
console.log('NEXTAUTH_SECRET="jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w="');
console.log('NEXTAUTH_URL="http://localhost:3000"\n');

console.log('For NETLIFY PRODUCTION (use PRODUCTION Neon database):');
console.log('DATABASE_URL="postgresql://user:password@host/prod-database?sslmode=require"');
console.log('NEXTAUTH_SECRET="jCzU1VJ3qVzYC4M+93TDnXC9SJcs0ZHOnzDUV4YyP9w="');
console.log('NEXTAUTH_URL="https://your-site.netlify.app"\n');

console.log('⚠️  Important:');
console.log('- Use the SAME NEXTAUTH_SECRET for both dev and production');
console.log('- NEXTAUTH_URL should be your actual production URL in Netlify');
console.log('- After setting up, run: npx prisma migrate deploy (for each database)');
console.log('- Then run: npm run db:seed (for each database)\n');

// Test current connection if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  console.log('🔍 Testing current DATABASE_URL connection...\n');
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(() => {
      console.log('✅ Successfully connected to database!');
      return prisma.$disconnect();
    })
    .catch((error) => {
      console.error('❌ Connection failed:', error.message);
      console.log('\nMake sure your DATABASE_URL is correct in .env file');
    });
} else {
  console.log('ℹ️  No DATABASE_URL found in .env - set it up first!\n');
}

