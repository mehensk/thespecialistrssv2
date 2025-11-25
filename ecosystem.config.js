/**
 * PM2 Ecosystem Configuration
 * This file configures PM2 to run your Next.js app in production
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'thespecialistrealty',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/thespecialistrealty',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart on crash
      autorestart: true,
      // Watch for file changes (disable in production)
      watch: false,
      // Max memory before restart (optimized for 1GB RAM server)
      max_memory_restart: '300M',
      // Log files
      error_file: '/var/log/pm2/thespecialistrealty-error.log',
      out_file: '/var/log/pm2/thespecialistrealty-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Merge logs
      merge_logs: true,
      // Time to wait before considering app crashed
      min_uptime: '10s',
      // Number of unstable restarts before stopping
      max_restarts: 10,
    },
  ],
};

