#!/bin/bash

# Emergency fix for 502 Bad Gateway

echo "🚨 Emergency Backend Fix for ChefBounty Dashboard"
echo "================================================"

HOST="dashboard.chefbounty.com"
USER="ubuntu"
KEY_PATH="./chefbounty-dashboard-key.pem"

# Check PEM file
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ PEM file not found!"
    exit 1
fi

chmod 400 "$KEY_PATH"

# Connect and fix
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$USER@$HOST" << 'ENDSSH'
set -e

echo "🔧 Starting emergency fix..."

# Navigate to app directory
cd /home/ubuntu/chefbounty-dashboard

# Kill any stuck processes
echo "➤ Killing any stuck Node processes..."
pkill -f node || true
pm2 kill || true

# Clear PM2 logs (they might be too large)
echo "➤ Clearing PM2 logs..."
pm2 flush

# Pull latest changes
echo "➤ Pulling latest code..."
git pull origin main || true

# Install dependencies
echo "➤ Installing dependencies..."
npm install

# Build the application
echo "➤ Building application..."
npm run build || echo "Build step skipped or failed"

# Create ecosystem file for PM2
echo "➤ Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'chefbounty-backend',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Load environment variables and start with PM2
echo "➤ Starting application with PM2..."
export $(cat /etc/environment | xargs)
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Wait for app to stabilize
sleep 10

# Check status
echo -e "\n📊 Application Status:"
pm2 list
pm2 logs --lines 20 --nostream

# Test backend
echo -e "\n🧪 Testing backend..."
curl -I http://localhost:5000 && echo "✅ Backend responding!" || echo "❌ Backend not responding"

# Restart nginx
echo -e "\n🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Final test
sleep 3
echo -e "\n🌐 Testing public URL..."
curl -I https://dashboard.chefbounty.com && echo "✅ Site is UP!" || echo "❌ Site still down"

ENDSSH

echo -e "\n✅ Emergency fix completed!"
echo "Check: https://dashboard.chefbounty.com"