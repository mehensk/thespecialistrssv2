// scripts/postinstall.js
const { spawnSync } = require('child_process');

// On Netlify, if DATABASE_URL is not set, use a placeholder for prisma generate
// Prisma generate doesn't need a real connection, just the env var to exist
if (process.env.NETLIFY && !process.env.DATABASE_URL) {
  console.log('Netlify build detected: Using placeholder DATABASE_URL for prisma generate');
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/dbname?schema=public';
}

// Ensure DATABASE_URL exists for prisma generate (even if it's a placeholder)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/dbname?schema=public';
}

// Cache Prisma engines in-repo to reduce re-downloads in CI
if (!process.env.PRISMA_ENGINES_CACHE_DIR) {
  process.env.PRISMA_ENGINES_CACHE_DIR = '.prisma';
}

// If a local proxy points to loopback, it can break Prisma engine downloads.
// Clear it for the generate step to avoid false failures in CI/local sims.
const loopbackProxyPattern = /^(http|https):\/\/(127\.0\.0\.1|localhost)(:\d+)?/i;
if (process.env.HTTP_PROXY && loopbackProxyPattern.test(process.env.HTTP_PROXY)) {
  console.log('Clearing HTTP_PROXY for prisma generate (loopback proxy detected).');
  delete process.env.HTTP_PROXY;
}
if (process.env.HTTPS_PROXY && loopbackProxyPattern.test(process.env.HTTPS_PROXY)) {
  console.log('Clearing HTTPS_PROXY for prisma generate (loopback proxy detected).');
  delete process.env.HTTPS_PROXY;
}

console.log('Running prisma generate...');
const res = spawnSync('npx', ['prisma', 'generate'], { 
  stdio: 'inherit',
  env: { ...process.env },
  shell: true, // Add shell option for Windows compatibility
  cwd: process.cwd()
});

if (res.status !== 0) {
  console.error('prisma generate failed');
  process.exit(res.status || 1);
}

console.log('prisma generate completed successfully');

