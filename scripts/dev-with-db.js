// scripts/dev-with-db.js
// Automatically sets up database and starts Next.js dev server
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || '';

console.log('🚀 Starting development environment with database...\n');

// Check if using Prisma local dev server
const isPrismaDev = DATABASE_URL.startsWith('prisma+postgres://');

let prismaDevProcess = null;

// Function to check for locked files (Windows-specific)
// Note: We don't kill processes automatically as it's risky
// Users should manually close other Node processes if needed
function checkForLockedFiles() {
  if (process.platform === 'win32') {
    const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'query_engine-windows.dll.node');
    if (fs.existsSync(prismaPath)) {
      try {
        // Try to access the file to see if it's locked
        fs.accessSync(prismaPath, fs.constants.R_OK);
      } catch (e) {
        console.log('   ⚠️  Prisma client files may be locked by another process');
        console.log('   💡 If generation fails, close other Node processes and try again');
      }
    }
  }
}

// Function to clean Prisma client cache
function cleanPrismaCache() {
  const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaPath)) {
    try {
      fs.rmSync(prismaPath, { recursive: true, force: true });
      console.log('   Cleaned Prisma client cache\n');
    } catch (e) {
      // Ignore if cleanup fails
    }
  }
}



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
    console.log('   Checking database status...\n');
    
    // First check if migrations are already applied
    const statusResult = spawnSync('npx', ['prisma', 'migrate', 'status'], {
      stdio: 'pipe',
      shell: true,
      encoding: 'utf8'
    });

    const statusOutput = statusResult.stdout + statusResult.stderr;
    const isUpToDate = statusOutput.includes('Database schema is up to date') || 
                       statusOutput.includes('No pending migrations');

    if (isUpToDate) {
      console.log('✅ Database schema is already up to date!\n');
    } else {
      // Check if schema exists by trying db push first (safer for existing databases)
      console.log('   Syncing database schema...\n');
      const pushResult = spawnSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
        stdio: 'inherit',
        shell: true
      });

      if (pushResult.status !== 0) {
        // If db push fails, try migrate deploy (for production databases)
        console.log('   Trying to apply migrations...\n');
        const deployResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
          stdio: 'inherit',
          shell: true
        });

        if (deployResult.status !== 0) {
          console.error('\n❌ Database migration failed.');
          console.error('   Please check:');
          console.error('   1. Your DATABASE_URL in .env file is correct');
          console.error('   2. Your database server is running');
          console.error('   3. You have the necessary permissions\n');
          process.exit(1);
        }
      }
      
      console.log('✅ Database is ready!\n');
    }
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

// Function to generate Prisma client with better error handling
async function generatePrismaClient() {
  return new Promise((resolve, reject) => {
    console.log('📦 Generating Prisma client...\n');
    
    // On Windows, check for potential file locks
    if (process.platform === 'win32') {
      checkForLockedFiles();
      // Small delay to ensure file system is ready
      setTimeout(() => {
        console.log('   Starting Prisma generation...');
        runGenerate(resolve, reject);
      }, 200);
    } else {
      runGenerate(resolve, reject);
    }
  });
}

function runGenerate(resolve, reject) {
  console.log('   Running: npx prisma generate');
  const generateProcess = spawn('npx', ['prisma', 'generate'], {
    stdio: 'pipe',
    shell: true
  });

  let stdout = '';
  let stderr = '';

  generateProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdout += output;
    process.stdout.write(output);
  });

  generateProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderr += output;
    process.stderr.write(output);
  });

  generateProcess.on('error', (error) => {
    console.error('   Process error:', error.message);
    reject(new Error(`Failed to start Prisma generate: ${error.message}`));
  });

  generateProcess.on('close', async (code) => {
    if (code === 0) {
      resolve();
    } else {
      // If generation failed on Windows, try cleaning cache and retrying
      if (process.platform === 'win32') {
        console.log('\n   Generation failed, cleaning cache and retrying...\n');
        cleanPrismaCache();
        await new Promise(delayResolve => setTimeout(delayResolve, 500));
        
        const retryProcess = spawn('npx', ['prisma', 'generate'], {
          stdio: 'pipe',
          shell: true
        });

        let retryStdout = '';
        let retryStderr = '';

        retryProcess.stdout.on('data', (data) => {
          const output = data.toString();
          retryStdout += output;
          process.stdout.write(output);
        });

        retryProcess.stderr.on('data', (data) => {
          const output = data.toString();
          retryStderr += output;
          process.stderr.write(output);
        });

        retryProcess.on('close', (retryCode) => {
          if (retryCode === 0) {
            resolve();
          } else {
            reject(new Error(`Prisma generate failed after retry (code: ${retryCode})`));
          }
        });

        retryProcess.on('error', (error) => {
          reject(new Error(`Failed to retry Prisma generate: ${error.message}`));
        });
      } else {
        reject(new Error(`Prisma generate failed with code ${code}`));
      }
    }
  });
}

// Main execution
(async () => {
  try {
    // Ensure Prisma client is generated
    await generatePrismaClient();
    console.log('✅ Prisma client generated successfully!\n');

    // Setup database
    await setupDatabase();

    // Start Next.js dev server
    startNextDev();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Try manually running: npx prisma generate');
    console.error('   Or kill any running Node processes and try again\n');
    cleanup();
    process.exit(1);
  }
})();

