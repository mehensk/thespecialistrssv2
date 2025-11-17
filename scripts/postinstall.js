// scripts/postinstall.js
const { spawnSync } = require('child_process');

// On Netlify, if DATABASE_URL is not set, use a placeholder for prisma generate
// Prisma generate doesn't need a real connection, just the env var to exist
if (process.env.NETLIFY && !process.env.DATABASE_URL) {
  console.log('Netlify build detected: Using placeholder DATABASE_URL for prisma generate');
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/dbname?schema=public';
}

console.log('Running prisma generate...');
const res = spawnSync('npx', ['prisma', 'generate'], { 
  stdio: 'inherit',
  env: { ...process.env }
});

if (res.status !== 0) {
  console.error('prisma generate failed');
  process.exit(res.status || 1);
}

console.log('prisma generate completed successfully');

