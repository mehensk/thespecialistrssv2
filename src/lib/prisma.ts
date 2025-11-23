import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error(
    '⚠️  DATABASE_URL environment variable is not set!\n' +
    'Please check your .env file and ensure DATABASE_URL is configured.\n' +
    'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"'
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pool settings for better reliability
    // These help prevent "Connection closed" errors
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to handle connection errors with helpful messages
export async function handlePrismaError(error: unknown): Promise<never> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('Closed') || errorMessage.includes('connection')) {
    console.error(
      '\n⚠️  Database connection error detected!\n' +
      'Error: ' + errorMessage + '\n\n' +
      'Common causes:\n' +
      '1. Database server is not running\n' +
      '2. DATABASE_URL is incorrect in .env file\n' +
      '3. Database credentials are wrong\n' +
      '4. Network/firewall blocking connection\n\n' +
      'Quick fixes:\n' +
      '- Check if PostgreSQL is running (Windows: Get-Service postgresql*)\n' +
      '- Verify DATABASE_URL in .env file\n' +
      '- For Neon/Supabase: Ensure connection string includes ?sslmode=require\n' +
      '- Restart your database service if using local PostgreSQL\n' +
      '- See TROUBLESHOOTING.md for detailed solutions\n'
    );
  }
  
  throw error;
}

