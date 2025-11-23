// scripts/dev-with-db.js
// Automatically sets up database and starts Next.js dev server
const { spawn, spawnSync } = require('child_process');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || '';

console.log('🚀 Starting development environment with database...\n');

// Check if using Prisma local dev server
const isPrismaDev = DATABASE_URL.startsWith('prisma+postgres://');

let prismaDevProcess = null;



async function setupDatabase() {
  if (isPrismaDev) {
    console.log('📦 Detected Prisma local dev server (prisma+postgres://)');
    console.log('   Starting Prisma dev server in background...\n');
    
    // Start Prisma dev server (not detached, but with separate stdio)
    prismaDevProcess = spawn('npx', ['prisma', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'], // Separate stdout/stderr
      shell: true,
      detached: false // Keep attached so we can manage it
    });

    // Log Prisma dev output (non-blocking)
    prismaDevProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.trim()) {
        process.stdout.write(`[Prisma] ${output}`);
      }
    });

    prismaDevProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.trim()) {
        process.stderr.write(`[Prisma] ${output}`);
      }
    });

    prismaDevProcess.on('error', (error) => {
      console.error('❌ Failed to start Prisma dev server:', error.message);
      process.exit(1);
    });

    // Wait a bit for Prisma dev to start, then continue
    console.log('   Waiting for Prisma dev server to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('   Prisma dev server should be running now\n');
    
  } else {
    console.log('📦 Using regular PostgreSQL connection');
    console.log('   Ensuring database is up to date...\n');
    
    // For regular PostgreSQL, use migrate dev to apply migrations
    // This will create the database if it doesn't exist and apply all migrations
    const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'dev', '--name', 'auto'], {
      stdio: 'inherit',
      shell: true
    });

    if (migrateResult.status !== 0) {
      console.error('\n❌ Database migration failed.');
      console.error('   Please check:');
      console.error('   1. Your DATABASE_URL in .env file is correct');
      console.error('   2. Your database server is running');
      console.error('   3. You have the necessary permissions\n');
      process.exit(1);
    }
    
    console.log('✅ Database is ready!\n');
  }
}

// Function to start Next.js dev server
let nextDevProcess = null;

function startNextDev() {
  console.log('🚀 Starting Next.js development server...\n');
  console.log('   Access your app at: http://localhost:3000\n');
  console.log('   Press Ctrl+C to stop all servers\n');
  
  nextDevProcess = spawn('npm', ['run', 'dev:next'], {
    stdio: 'inherit',
    shell: true
  });

  nextDevProcess.on('error', (error) => {
    console.error('❌ Failed to start Next.js dev server:', error.message);
    cleanup();
    process.exit(1);
  });

  // Handle cleanup on exit
  const cleanupHandler = () => {
    console.log('\n\n🛑 Shutting down...');
    cleanup();
    process.exit(0);
  };

  process.on('SIGINT', cleanupHandler);
  process.on('SIGTERM', cleanupHandler);

  return nextDevProcess;
}

// Cleanup function
function cleanup() {
  if (nextDevProcess) {
    try {
      nextDevProcess.kill('SIGTERM');
    } catch (e) {
      // Ignore if already killed
    }
  }
  if (prismaDevProcess) {
    console.log('   Stopping Prisma dev server...');
    try {
      // On Windows, use taskkill if available, otherwise use kill
      if (process.platform === 'win32') {
        if (prismaDevProcess.pid) {
          spawnSync('taskkill', ['/F', '/T', '/PID', prismaDevProcess.pid.toString()], {
            stdio: 'ignore',
            shell: true
          });
        }
      } else {
        if (prismaDevProcess.pid) {
          process.kill(-prismaDevProcess.pid, 'SIGTERM');
        } else {
          prismaDevProcess.kill('SIGTERM');
        }
      }
    } catch (e) {
      // Ignore if already killed
    }
  }
}

// Main execution
(async () => {
  try {
    // Ensure Prisma client is generated
    console.log('📦 Generating Prisma client...\n');
    const generateResult = spawnSync('npx', ['prisma', 'generate'], {
      stdio: 'inherit',
      shell: true
    });

    if (generateResult.status !== 0) {
      console.error('❌ Prisma generate failed');
      process.exit(1);
    }

    // Setup database
    await setupDatabase();

    // Start Next.js dev server
    startNextDev();

  } catch (error) {
    console.error('❌ Error:', error.message);
    cleanup();
    process.exit(1);
  }
})();

