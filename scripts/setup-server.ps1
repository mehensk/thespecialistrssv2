# DigitalOcean Server Setup Script (PowerShell)
# This script sets up a fresh Ubuntu server for Next.js deployment
# Usage: .\setup-server.ps1 -ServerIP YOUR_DROPLET_IP

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP
)

Write-Host "🚀 Setting up DigitalOcean server at $ServerIP..." -ForegroundColor Cyan
Write-Host ""

# Check if we can connect
Write-Host "📡 Testing SSH connection..." -ForegroundColor Yellow
try {
    ssh -o ConnectTimeout=5 root@$ServerIP "echo '✅ Connection successful'" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to server. Check:" -ForegroundColor Red
    Write-Host "   - Server IP is correct: $ServerIP" -ForegroundColor Red
    Write-Host "   - SSH key is added to DigitalOcean" -ForegroundColor Red
    Write-Host "   - Firewall allows SSH (port 22)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Node.js 20..." -ForegroundColor Yellow
$nodeScript = @"
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
"@

ssh root@$ServerIP $nodeScript

Write-Host ""
Write-Host "🗄️  Installing PostgreSQL..." -ForegroundColor Yellow
$postgresScript = @"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Optimize PostgreSQL for 1GB RAM server
PG_VERSION=`$(psql --version | grep -oP '\d+' | head -1)
PG_CONF="/etc/postgresql/`${PG_VERSION}/main/postgresql.conf"

# Backup original config
cp `$PG_CONF `${PG_CONF}.backup

# Optimize memory settings for 1GB RAM
sed -i 's/#shared_buffers = 128MB/shared_buffers = 128MB/' `$PG_CONF
sed -i 's/#effective_cache_size = 4GB/effective_cache_size = 256MB/' `$PG_CONF
sed -i 's/#maintenance_work_mem = 64MB/maintenance_work_mem = 32MB/' `$PG_CONF
sed -i 's/#work_mem = 4MB/work_mem = 4MB/' `$PG_CONF
sed -i 's/#max_connections = 100/max_connections = 20/' `$PG_CONF

# Restart PostgreSQL to apply changes
systemctl restart postgresql

echo '✅ PostgreSQL installed and optimized for 1GB RAM'
"@
ssh root@$ServerIP $postgresScript

Write-Host ""
Write-Host "🌐 Installing Nginx..." -ForegroundColor Yellow
$nginxScript = @"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo '✅ Nginx installed'
"@
ssh root@$ServerIP $nginxScript

Write-Host ""
Write-Host "⚙️  Installing PM2..." -ForegroundColor Yellow
$pm2Script = @"
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
echo '✅ PM2 installed'
"@
ssh root@$ServerIP $pm2Script

Write-Host ""
Write-Host "🔒 Configuring firewall..." -ForegroundColor Yellow
$firewallScript = @"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status
echo '✅ Firewall configured'
"@
ssh root@$ServerIP $firewallScript

Write-Host ""
Write-Host "💾 Setting up swap file (important for 1GB RAM)..." -ForegroundColor Yellow
$swapScript = @"
fallocate -l 1G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=1048576
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
echo '✅ Swap file created (1GB)'
"@
ssh root@$ServerIP $swapScript

Write-Host ""
Write-Host "📁 Creating app directory..." -ForegroundColor Yellow
$dirScript = @"
mkdir -p /var/www/thespecialistrealty
mkdir -p /var/log/pm2
chown -R `$USER:`$USER /var/www/thespecialistrealty
echo '✅ Directories created'
"@
ssh root@$ServerIP $dirScript

Write-Host ""
Write-Host "✅ Server setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy your app: .\scripts\deploy.ps1 -ServerIP $ServerIP"
Write-Host "2. Or manually:" -ForegroundColor Gray
Write-Host "   ssh root@$ServerIP"
Write-Host "   cd /var/www"
Write-Host "   git clone YOUR_REPO_URL thespecialistrealty"
Write-Host "   cd thespecialistrealty"
Write-Host "   npm install"
Write-Host "   # Create .env file with your environment variables"
Write-Host "   npm run build"
Write-Host "   pm2 start ecosystem.config.js"
Write-Host "   pm2 save"
Write-Host "   pm2 startup"

