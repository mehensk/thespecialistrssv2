#!/bin/bash

# Deployment Script for DigitalOcean
# This script deploys your Next.js app to a DigitalOcean droplet
# Usage: ./deploy.sh YOUR_DROPLET_IP [yourdomain.com]

set -e

SERVER_IP=$1
DOMAIN=$2

if [ -z "$SERVER_IP" ]; then
    echo "❌ Error: Server IP required"
    echo "Usage: ./deploy.sh YOUR_DROPLET_IP [yourdomain.com]"
    exit 1
fi

echo "🚀 Deploying to DigitalOcean server at $SERVER_IP..."
echo ""

# Check if .env exists locally
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found locally"
    echo "   Make sure to create .env on server with all required variables"
fi

# Check if we can connect
echo "📡 Testing SSH connection..."
ssh -o ConnectTimeout=5 root@$SERVER_IP "echo '✅ Connected'" || {
    echo "❌ Cannot connect to server"
    exit 1
}

echo ""
echo "📦 Cloning/updating repository..."
ssh root@$SERVER_IP << ENDSSH
    cd /var/www
    if [ -d "thespecialistrealty" ]; then
        echo "📥 Updating existing repository..."
        cd thespecialistrealty
        git pull origin main || git pull origin master
    else
        echo "📥 Cloning repository..."
        read -p "Enter your Git repository URL: " REPO_URL
        git clone \$REPO_URL thespecialistrealty
        cd thespecialistrealty
    fi
ENDSSH

echo ""
echo "📥 Installing dependencies..."
ssh root@$SERVER_IP << 'ENDSSH'
    cd /var/www/thespecialistrealty
    npm install --production=false
ENDSSH

echo ""
echo "⚙️  Setting up environment variables..."
echo "📝 Please create/update .env file on server with your environment variables"
echo "   Required variables:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo ""
read -p "Press Enter after you've created/updated .env on the server..."

echo ""
echo "🗄️  Setting up database..."
ssh root@$SERVER_IP << 'ENDSSH'
    cd /var/www/thespecialistrealty
    
    # Generate Prisma client
    npx prisma generate
    
    # Check if database exists, create if not
    DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w thespecialistrealty | wc -l)
    if [ "$DB_EXISTS" -eq "0" ]; then
        echo "📦 Creating database and user..."
        sudo -u postgres psql << PSQL
CREATE DATABASE thespecialistrealty;
CREATE USER appuser WITH PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;
ALTER USER appuser CREATEDB;
PSQL
        echo "⚠️  Database created with default password. Please update .env with secure password!"
    fi
    
    # Run migrations
    npx prisma migrate deploy || echo "⚠️  Migration failed or already applied"
ENDSSH

echo ""
echo "🔨 Building application..."
ssh root@$SERVER_IP << 'ENDSSH'
    cd /var/www/thespecialistrealty
    npm run build
ENDSSH

echo ""
echo "🚀 Starting application with PM2..."
ssh root@$SERVER_IP << 'ENDSSH'
    cd /var/www/thespecialistrealty
    pm2 delete thespecialistrealty 2>/dev/null || true
    pm2 start ecosystem.config.js || pm2 start npm --name "thespecialistrealty" -- start
    pm2 save
    pm2 startup || true
ENDSSH

if [ -n "$DOMAIN" ]; then
    echo ""
    echo "🌐 Setting up Nginx for $DOMAIN..."
    
    # Copy Nginx config
    scp nginx/thespecialistrealty.conf root@$SERVER_IP:/tmp/thespecialistrealty.conf
    
    ssh root@$SERVER_IP << ENDSSH
        # Replace domain placeholder
        sed -i "s/yourdomain.com/$DOMAIN/g" /tmp/thespecialistrealty.conf
        
        # Copy to Nginx sites-available
        cp /tmp/thespecialistrealty.conf /etc/nginx/sites-available/thespecialistrealty
        
        # Create symlink
        ln -sf /etc/nginx/sites-available/thespecialistrealty /etc/nginx/sites-enabled/
        
        # Remove default site
        rm -f /etc/nginx/sites-enabled/default
        
        # Test Nginx config
        nginx -t
        
        # Reload Nginx
        systemctl reload nginx
        
        echo "✅ Nginx configured"
ENDSSH

    echo ""
    echo "🔒 Setting up SSL certificate..."
    read -p "Set up SSL with Let's Encrypt? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh root@$SERVER_IP << ENDSSH
            apt install -y certbot python3-certbot-nginx
            certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo "⚠️  SSL setup failed - run manually: certbot --nginx -d $DOMAIN"
ENDSSH
    fi
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check app status:"
echo "   ssh root@$SERVER_IP 'pm2 list'"
echo ""
echo "📝 View logs:"
echo "   ssh root@$SERVER_IP 'pm2 logs thespecialistrealty'"
echo ""
if [ -n "$DOMAIN" ]; then
    echo "🌐 Your app should be live at: https://$DOMAIN"
else
    echo "🌐 Your app is running on: http://$SERVER_IP:3000"
    echo "   (Set up Nginx and domain for HTTPS)"
fi

