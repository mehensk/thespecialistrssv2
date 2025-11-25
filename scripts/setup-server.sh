#!/bin/bash

# DigitalOcean Server Setup Script
# This script sets up a fresh Ubuntu server for Next.js deployment
# Usage: ./setup-server.sh YOUR_DROPLET_IP

set -e

SERVER_IP=$1

if [ -z "$SERVER_IP" ]; then
    echo "❌ Error: Server IP required"
    echo "Usage: ./setup-server.sh YOUR_DROPLET_IP"
    exit 1
fi

echo "🚀 Setting up DigitalOcean server at $SERVER_IP..."
echo ""

# Check if we can connect
echo "📡 Testing SSH connection..."
ssh -o ConnectTimeout=5 root@$SERVER_IP "echo '✅ Connection successful'" || {
    echo "❌ Cannot connect to server. Check:"
    echo "   - Server IP is correct: $SERVER_IP"
    echo "   - SSH key is added to DigitalOcean"
    echo "   - Firewall allows SSH (port 22)"
    exit 1
}

echo ""
echo "📦 Installing Node.js 20..."
ssh root@$SERVER_IP << 'ENDSSH'
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Verify installation
    node -v
    npm -v
ENDSSH

echo ""
echo "🗄️  Installing PostgreSQL..."
ssh root@$SERVER_IP << 'ENDSSH'
    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Optimize PostgreSQL for 1GB RAM server
    PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
    PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
    
    # Backup original config
    cp $PG_CONF ${PG_CONF}.backup
    
    # Optimize memory settings for 1GB RAM
    sed -i "s/#shared_buffers = 128MB/shared_buffers = 128MB/" $PG_CONF
    sed -i "s/#effective_cache_size = 4GB/effective_cache_size = 256MB/" $PG_CONF
    sed -i "s/#maintenance_work_mem = 64MB/maintenance_work_mem = 32MB/" $PG_CONF
    sed -i "s/#work_mem = 4MB/work_mem = 4MB/" $PG_CONF
    sed -i "s/#max_connections = 100/max_connections = 20/" $PG_CONF
    
    # Restart PostgreSQL to apply changes
    systemctl restart postgresql
    
    echo "✅ PostgreSQL installed and optimized for 1GB RAM"
ENDSSH

echo ""
echo "🌐 Installing Nginx..."
ssh root@$SERVER_IP << 'ENDSSH'
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo "✅ Nginx installed"
ENDSSH

echo ""
echo "⚙️  Installing PM2..."
ssh root@$SERVER_IP << 'ENDSSH'
    npm install -g pm2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    echo "✅ PM2 installed"
ENDSSH

echo ""
echo "🔒 Configuring firewall..."
ssh root@$SERVER_IP << 'ENDSSH'
    ufw --force enable
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw status
    echo "✅ Firewall configured"
ENDSSH

echo ""
echo "💾 Setting up swap file (important for 1GB RAM)..."
ssh root@$SERVER_IP << 'ENDSSH'
    # Create 1GB swap file (helps prevent out-of-memory issues)
    fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=1048576
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo "✅ Swap file created (1GB)"
ENDSSH

echo ""
echo "📁 Creating app directory..."
ssh root@$SERVER_IP << 'ENDSSH'
    mkdir -p /var/www/thespecialistrealty
    mkdir -p /var/log/pm2
    chown -R $USER:$USER /var/www/thespecialistrealty
    echo "✅ Directories created"
ENDSSH

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy your app: ./scripts/deploy.sh $SERVER_IP"
echo "2. Or manually:"
echo "   ssh root@$SERVER_IP"
echo "   cd /var/www"
echo "   git clone YOUR_REPO_URL thespecialistrealty"
echo "   cd thespecialistrealty"
echo "   npm install"
echo "   # Create .env file with your environment variables"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"

