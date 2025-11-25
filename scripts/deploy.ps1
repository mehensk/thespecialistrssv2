# Deployment Script for DigitalOcean (PowerShell)
# This script deploys your Next.js app to a DigitalOcean droplet
# Usage: .\deploy.ps1 -ServerIP YOUR_DROPLET_IP [-Domain yourdomain.com]

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [string]$Domain
)

Write-Host "🚀 Deploying to DigitalOcean server at $ServerIP..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists locally
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: No .env file found locally" -ForegroundColor Yellow
    Write-Host "   Make sure to create .env on server with all required variables" -ForegroundColor Yellow
}

# Check if we can connect
Write-Host "📡 Testing SSH connection..." -ForegroundColor Yellow
try {
    ssh -o ConnectTimeout=5 root@$ServerIP "echo '✅ Connected'" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to server" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Cloning/updating repository..." -ForegroundColor Yellow
$repoScript = @"
cd /var/www
if [ -d "thespecialistrealty" ]; then
    echo '📥 Updating existing repository...'
    cd thespecialistrealty
    git pull origin main || git pull origin master
else
    echo '📥 Cloning repository...'
    read -p 'Enter your Git repository URL: ' REPO_URL
    git clone `$REPO_URL thespecialistrealty
    cd thespecialistrealty
fi
"@
ssh root@$ServerIP $repoScript

Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
ssh root@$ServerIP "cd /var/www/thespecialistrealty && npm install --production=false"

Write-Host ""
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow
Write-Host "📝 Please create/update .env file on server with your environment variables" -ForegroundColor Cyan
Write-Host "   Required variables:" -ForegroundColor Gray
Write-Host "   - DATABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_URL" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter after you've created/updated .env on the server"

Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
$dbScript = @"
cd /var/www/thespecialistrealty
npx prisma generate

# Check if database exists
DB_EXISTS=`$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w thespecialistrealty | wc -l)
if [ `"`$DB_EXISTS`" -eq `"0`" ]; then
    echo '📦 Creating database and user...'
    sudo -u postgres psql << PSQL
CREATE DATABASE thespecialistrealty;
CREATE USER appuser WITH PASSWORD 'changeme123';
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;
ALTER USER appuser CREATEDB;
PSQL
    echo '⚠️  Database created with default password. Please update .env with secure password!'
fi

# Run migrations
npx prisma migrate deploy || echo '⚠️  Migration failed or already applied'
"@
ssh root@$ServerIP $dbScript

Write-Host ""
Write-Host "🔨 Building application..." -ForegroundColor Yellow
ssh root@$ServerIP "cd /var/www/thespecialistrealty && npm run build"

Write-Host ""
Write-Host "🚀 Starting application with PM2..." -ForegroundColor Yellow
$pm2Script = @"
cd /var/www/thespecialistrealty
pm2 delete thespecialistrealty 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start npm --name 'thespecialistrealty' -- start
pm2 save
pm2 startup || true
"@
ssh root@$ServerIP $pm2Script

if ($Domain) {
    Write-Host ""
    Write-Host "🌐 Setting up Nginx for $Domain..." -ForegroundColor Yellow
    
    # Copy Nginx config
    if (Test-Path "nginx/thespecialistrealty.conf") {
        $nginxConfig = Get-Content "nginx/thespecialistrealty.conf" -Raw
        $nginxConfig = $nginxConfig -replace "yourdomain.com", $Domain
        $nginxConfig | ssh root@$ServerIP "cat > /tmp/thespecialistrealty.conf"
        
        $nginxSetup = @"
cp /tmp/thespecialistrealty.conf /etc/nginx/sites-available/thespecialistrealty
ln -sf /etc/nginx/sites-available/thespecialistrealty /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo '✅ Nginx configured'
"@
        ssh root@$ServerIP $nginxSetup
        
        Write-Host ""
        Write-Host "🔒 Setting up SSL certificate..." -ForegroundColor Yellow
        $setupSSL = Read-Host "Set up SSL with Let's Encrypt? (y/n)"
        if ($setupSSL -eq "y" -or $setupSSL -eq "Y") {
            $sslScript = @"
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $Domain -d www.$Domain --non-interactive --agree-tos --email admin@$Domain || echo '⚠️  SSL setup failed - run manually: certbot --nginx -d $Domain'
"@
            ssh root@$ServerIP $sslScript
        }
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check app status:" -ForegroundColor Cyan
Write-Host "   ssh root@$ServerIP 'pm2 list'" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Cyan
Write-Host "   ssh root@$ServerIP 'pm2 logs thespecialistrealty'" -ForegroundColor Gray
Write-Host ""
if ($Domain) {
    Write-Host "🌐 Your app should be live at: https://$Domain" -ForegroundColor Green
} else {
    Write-Host "🌐 Your app is running on: http://$ServerIP:3000" -ForegroundColor Green
    Write-Host "   (Set up Nginx and domain for HTTPS)" -ForegroundColor Gray
}

