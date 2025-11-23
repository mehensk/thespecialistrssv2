// scripts/simulate-netlify-build.js
// Simulates Netlify build environment locally
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Simulating Netlify build environment...\n');
console.log('This will test your build process exactly as Netlify does.\n');

// Set Netlify-like environment variables
const netlifyEnv = {
  ...process.env,
  NETLIFY: 'true',
  NODE_VERSION: '20',
  CI: 'true', // Netlify runs in CI mode
  NODE_ENV: 'production', // Netlify builds in production mode
};

// Check and set required environment variables for build
const requiredEnvVars = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/dbname?schema=public',
  NEXTAUTH_SECRET: 'netlify-build-test-secret-change-in-production',
  NEXTAUTH_URL: 'https://your-site.netlify.app',
};

let missingVars = [];
for (const [key, defaultValue] of Object.entries(requiredEnvVars)) {
  if (!netlifyEnv[key]) {
    console.log(`⚠️  ${key} not set. Using placeholder for build simulation.`);
    netlifyEnv[key] = defaultValue;
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.log('\n📝 Note: These variables should be set in Netlify dashboard:');
  missingVars.forEach(key => console.log(`   - ${key}`));
  console.log('');
}

console.log('Environment variables:');
console.log(`  NETLIFY=${netlifyEnv.NETLIFY}`);
console.log(`  NODE_VERSION=${netlifyEnv.NODE_VERSION}`);
console.log(`  CI=${netlifyEnv.CI}`);
console.log(`  NODE_ENV=${netlifyEnv.NODE_ENV}`);
console.log('');

// Check if .next directory exists and warn about cleaning
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('⚠️  Note: .next directory exists.');
  console.log('   Netlify builds from a clean state, but keeping it for faster local testing.\n');
}

// Step 1: Run postinstall (which runs prisma generate)
console.log('📦 Step 1: Running postinstall (Prisma generate)...\n');
const postinstallResult = spawnSync('npm', ['run', 'postinstall'], {
  stdio: 'inherit',
  env: netlifyEnv,
  shell: true,
  cwd: process.cwd()
});

if (postinstallResult.status !== 0) {
  console.error('\n❌ Postinstall (Prisma generate) failed');
  process.exit(postinstallResult.status || 1);
}

// Step 2: Run the build command (matching netlify.toml)
console.log('\n🔨 Step 2: Running build command (npm run build)...\n');
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

// Step 3: Check if build output exists
const buildOutput = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildOutput)) {
  console.error('\n❌ Build output (.next) directory not found');
  process.exit(1);
}

console.log('\n✅ Build simulation completed successfully!');
console.log('   Your build should work on Netlify if it passed here.\n');
console.log('📋 Next steps:');
console.log('   1. Ensure all environment variables are set in Netlify dashboard');
console.log('   2. Verify your netlify.toml configuration');
console.log('   3. Deploy to Netlify\n');

