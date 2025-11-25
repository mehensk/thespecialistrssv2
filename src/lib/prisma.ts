import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  connectionState: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastHealthCheck: number;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set!\n' +
    'Please check your .env file and ensure DATABASE_URL is configured.\n' +
    'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"'
  );
}

// Parse DATABASE_URL to add connection pool parameters if not present
function enhanceDatabaseUrl(url: string): string {
  // If URL already has connection parameters, return as-is
  if (url.includes('connection_limit') || url.includes('pool_timeout')) {
    return url;
  }
  
  try {
    // Handle both postgresql:// and postgres:// protocols
    const protocolMatch = url.match(/^(postgresql?:\/\/)/);
    if (!protocolMatch) {
      return url; // Not a valid PostgreSQL URL
    }
    
    const protocol = protocolMatch[1];
    const rest = url.substring(protocol.length);
    
    // Split into base URL and query string
    const [base, existingQuery] = rest.split('?');
    const params = new URLSearchParams(existingQuery || '');
    
    // Connection pool settings (optimized for serverless/cloud)
    if (!params.has('connection_limit')) {
      params.set('connection_limit', '10');
    }
    if (!params.has('pool_timeout')) {
      params.set('pool_timeout', '10');
    }
    if (!params.has('connect_timeout')) {
      params.set('connect_timeout', '10');
    }
    
    // For cloud databases (Neon, Supabase), ensure SSL
    if (url.includes('neon.tech') || url.includes('supabase.co')) {
      if (!params.has('sslmode')) {
        params.set('sslmode', 'require');
      }
    }
    
    // Reconstruct URL
    const queryString = params.toString();
    return queryString ? `${protocol}${base}?${queryString}` : `${protocol}${base}`;
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

const enhancedDatabaseUrl = enhanceDatabaseUrl(process.env.DATABASE_URL);

// Create Prisma client with optimized configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: enhancedDatabaseUrl,
      },
    },
    // Connection timeout (10 seconds)
    // Query timeout (30 seconds)
    // These help prevent hanging connections
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.connectionState = 'disconnected';
  globalForPrisma.lastHealthCheck = 0;
}

// Connection health check with retry logic
async function checkConnection(retries = 3, delay = 1000): Promise<boolean> {
  const state = globalForPrisma.connectionState;
  const lastCheck = globalForPrisma.lastHealthCheck;
  const now = Date.now();
  
  // Cache health check for 5 seconds to avoid excessive checks
  if (state === 'connected' && now - lastCheck < 5000) {
    return true;
  }
  
  globalForPrisma.connectionState = 'connecting';
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1`;
      globalForPrisma.connectionState = 'connected';
      globalForPrisma.lastHealthCheck = now;
      return true;
    } catch (error) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      globalForPrisma.connectionState = 'error';
      return false;
    }
  }
  
  return false;
}

// Execute database operations with automatic retry
export async function dbQuery<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  // Check connection health first
  const isHealthy = await checkConnection();
  if (!isHealthy && globalForPrisma.connectionState === 'error') {
    throw new Error(
      'Database connection failed. Please check:\n' +
      '1. DATABASE_URL is correct in .env file\n' +
      '2. Database server is running\n' +
      '3. Network connectivity\n' +
      '4. Database credentials are valid'
    );
  }
  
  // Execute with retry logic
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if it's a connection error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConnectionError = 
        errorMessage.includes('Closed') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('timeout') ||
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1008');
      
      if (isConnectionError && attempt < retries) {
        // Reset connection state to force reconnection
        globalForPrisma.connectionState = 'disconnected';
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      // If not a connection error or out of retries, throw immediately
      if (!isConnectionError) {
        throw error;
      }
    }
  }
  
  // All retries exhausted
  throw lastError;
}

// Health check function for API endpoints
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  latency?: number;
}> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    globalForPrisma.connectionState = 'connected';
    globalForPrisma.lastHealthCheck = Date.now();
    return {
      healthy: true,
      message: 'Database connection is healthy',
      latency,
    };
  } catch (error) {
    globalForPrisma.connectionState = 'error';
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      healthy: false,
      message: `Database connection failed: ${errorMessage}`,
    };
  }
}

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

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

