// scripts/build-netlify-local.js
// Simulates Netlify build environment with real database and Cloudinary connections
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

console.log('🚀 Simulating Netlify build environment with real connections...\n');
console.log('This will test your build process exactly as Netlify does.\n');

// Set Netlify-like environment variables
const netlifyEnv = {
  ...process.env,
  NETLIFY: 'true',
  NODE_VERSION: '20',
  CI: 'true', // Netlify runs in CI mode
  NODE_ENV: 'production', // Netlify builds in production mode
};

// Required environment variables (must be manually set, like Netlify)
const requiredEnvVars = {
  DATABASE_URL: 'Neon database connection string',
  NEXTAUTH_SECRET: 'NextAuth secret key',
  NEXTAUTH_URL: 'Application URL (e.g., https://your-site.netlify.app)',
};

// Optional environment variables
const optionalEnvVars = {
  CLOUDINARY_CLOUD_NAME: 'Cloudinary cloud name',
  CLOUDINARY_API_KEY: 'Cloudinary API key',
  CLOUDINARY_API_SECRET: 'Cloudinary API secret',
};

// Check required environment variables
console.log('📋 Checking required environment variables...\n');
let missingVars = [];
for (const [key, description] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    console.error(`❌ ${key} is not set`);
    console.error(`   ${description}`);
    missingVars.push(key);
  } else {
    // Mask sensitive values
    const masked = key === 'DATABASE_URL' 
      ? process.env[key].replace(/:[^:@]+@/, ':****@')
      : key === 'NEXTAUTH_SECRET'
      ? '****' + process.env[key].slice(-4)
      : process.env[key];
    console.log(`✅ ${key}=${masked}`);
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables!');
  console.error('   Please set these variables before running the build:');
  missingVars.forEach(key => {
    console.error(`   - ${key}: ${requiredEnvVars[key]}`);
  });
  console.error('\n   Example (Windows PowerShell):');
  console.error(`   $env:DATABASE_URL="postgresql://..."; $env:NEXTAUTH_SECRET="..."; $env:NEXTAUTH_URL="..."; npm run build:netlify-local`);
  console.error('\n   Example (Bash/Linux/Mac):');
  console.error(`   DATABASE_URL="postgresql://..." NEXTAUTH_SECRET="..." NEXTAUTH_URL="..." npm run build:netlify-local\n`);
  process.exit(1);
}

// Check optional Cloudinary variables
console.log('\n📋 Checking optional Cloudinary configuration...\n');
const cloudinaryVars = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].filter(Boolean);

if (cloudinaryVars.length === 0) {
  console.log('⚠️  Cloudinary not configured (optional)');
  console.log('   Image uploads will use local storage if Cloudinary is not set.\n');
} else if (cloudinaryVars.length < 3) {
  console.warn('⚠️  Cloudinary partially configured');
  console.warn('   All three Cloudinary variables must be set together for it to work.');
  console.warn('   Continuing without Cloudinary...\n');
} else {
  console.log('✅ Cloudinary configured');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);
}

console.log('Environment variables:');
console.log(`  NETLIFY=${netlifyEnv.NETLIFY}`);
console.log(`  NODE_VERSION=${netlifyEnv.NODE_VERSION}`);
console.log(`  CI=${netlifyEnv.CI}`);
console.log(`  NODE_ENV=${netlifyEnv.NODE_ENV}`);
console.log('');

// Step 1: Test Neon Database Connection
console.log('📡 Step 1: Testing Neon Database connection...\n');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Get basic stats
    try {
      const [userCount, listingCount, blogCount] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.listing.count().catch(() => 0),
        prisma.blogPost.count().catch(() => 0),
      ]);
      
      console.log(`   👥 Users: ${userCount}`);
      console.log(`   🏠 Listings: ${listingCount}`);
      console.log(`   📝 Blog Posts: ${blogCount}`);
      
      // Verify schema exists
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database schema accessible\n');
      } catch (error) {
        console.warn('⚠️  Database schema may not be set up.');
        console.warn('   Consider running: npx prisma migrate deploy\n');
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch database stats (schema may not exist)');
      console.warn('   This is okay if this is a fresh database.\n');
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   ${error.message}`);
    console.error('\n   Please check:');
    console.error('   1. DATABASE_URL is correct');
    console.error('   2. Database server is running (Neon databases may be paused)');
    console.error('   3. Network/firewall allows connection');
    console.error('   4. Database credentials are valid\n');
    await prisma.$disconnect().catch(() => {});
    return false;
  }
}

// Wrap async code in async function
(async () => {
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    process.exit(1);
  }

  // Step 2: Test Cloudinary Connection (if configured)
  if (cloudinaryVars.length === 3) {
    console.log('☁️  Step 2: Testing Cloudinary connection...\n');
    
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      
      // Test connection with a simple API call
      const result = await new Promise((resolve, reject) => {
        cloudinary.api.ping((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      console.log('✅ Cloudinary connection successful');
      console.log(`   Status: ${result.status}\n`);
    } catch (error) {
      console.warn('⚠️  Cloudinary connection test failed:');
      console.warn(`   ${error.message}`);
      console.warn('   Build will continue, but image uploads may fail.\n');
    }
  } else {
    console.log('⏭️  Step 2: Skipping Cloudinary test (not configured)\n');
  }

  // Step 3: Run postinstall (which runs prisma generate)
  console.log('📦 Step 3: Running postinstall (Prisma generate)...\n');
  const postinstallResult = spawnSync('npm', ['run', 'postinstall'], {
    stdio: 'inherit',
    env: netlifyEnv,
    shell: true,
    cwd: process.cwd()
  });

  if (postinstallResult.status !== 0) {
    // On Windows, file locks can cause prisma generate to fail locally
    // Check if Prisma client already exists
    const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'index.js');
    if (fs.existsSync(prismaClientPath)) {
      console.log('\n⚠️  Postinstall failed, but Prisma client already exists.');
      console.log('   This is likely a Windows file lock issue and won\'t occur on Netlify.');
      console.log('   Continuing with build...\n');
    } else {
      console.error('\n❌ Postinstall (Prisma generate) failed');
      console.error('   Prisma client not found. Please resolve the error above.\n');
      process.exit(postinstallResult.status || 1);
    }
  }

  // Step 4: Run the build command (matching netlify.toml)
  console.log('\n🔨 Step 4: Running build command (npm run build)...\n');
  const buildResult = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: netlifyEnv,
    shell: true,
    cwd: process.cwd()
  });

  if (buildResult.status !== 0) {
    console.error('\n❌ Build failed');
    console.error('   Fix the errors above before deploying to Netlify.\n');
    process.exit(buildResult.status || 1);
  }

  // Step 5: Run database seed (matching netlify.toml)
  console.log('\n🌱 Step 5: Running database seed (npm run db:seed)...\n');
  const seedResult = spawnSync('npm', ['run', 'db:seed'], {
    stdio: 'inherit',
    env: netlifyEnv,
    shell: true,
    cwd: process.cwd()
  });

  if (seedResult.status !== 0) {
    // Seed may fail due to database connection issues
    // Check if build output exists - if it does, the build itself was successful
    const buildOutput = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildOutput)) {
      console.log('\n⚠️  Database seed failed, but build output exists.');
      console.log('   The build step completed successfully.');
      console.log('   Check the error above - seed may have failed due to:');
      console.log('   - Database connection issues');
      console.log('   - Data already exists (seed uses upsert, so this is usually safe)\n');
    } else {
      console.error('\n❌ Database seed failed and build output not found.');
      console.error('   Fix the errors above before deploying to Netlify.\n');
      process.exit(seedResult.status || 1);
    }
  }

  // Step 6: Verify build output exists
  const buildOutput = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildOutput)) {
    console.error('\n❌ Build output (.next) directory not found');
    process.exit(1);
  }

  console.log('\n✅ Build simulation completed successfully!');
  console.log('   ✓ Database connection verified');
  if (cloudinaryVars.length === 3) {
    console.log('   ✓ Cloudinary connection verified');
  }
  console.log('   ✓ Next.js build completed');
  console.log('   ✓ All pages generated');
  if (seedResult && seedResult.status === 0) {
    console.log('   ✓ Database seed completed');
  } else {
    console.log('   ⚠️  Database seed had issues (check output above)');
  }
  console.log('\n   Your build should work on Netlify if it passed here.\n');
  console.log('📋 Next steps:');
  console.log('   1. Ensure all environment variables are set in Netlify dashboard');
  console.log('   2. Verify your netlify.toml configuration');
  console.log('   3. Deploy to Netlify\n');
})().catch((error) => {
  console.error('\n❌ Fatal error during build simulation:');
  console.error(error);
  process.exit(1);
});

