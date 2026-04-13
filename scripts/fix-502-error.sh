#!/bin/bash

# Script to diagnose and fix 502 Bad Gateway error on EC2

echo "🔍 Diagnosing 502 Bad Gateway error..."
echo "================================================"

# SSH connection details
HOST="dashboard.chefbounty.com"
USER="ubuntu"
KEY_PATH="./chefbounty-dashboard-key.pem"

# Check if PEM file exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: PEM file not found at $KEY_PATH"
    echo "Please ensure the PEM file is in the current directory"
    exit 1
fi

# Set correct permissions
chmod 400 "$KEY_PATH"

# Connect and diagnose
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$USER@$HOST" << 'ENDSSH'
echo "📊 System Status Check"
echo "----------------------"

# Check if Node.js app is running
echo -e "\n1️⃣ Checking PM2 processes:"
pm2 list

# Check PM2 logs for errors
echo -e "\n2️⃣ Recent PM2 logs:"
pm2 logs --lines 20 --nostream

# Check nginx status
echo -e "\n3️⃣ Nginx status:"
sudo systemctl status nginx --no-pager

# Check nginx error logs
echo -e "\n4️⃣ Recent Nginx errors:"
sudo tail -20 /var/log/nginx/error.log

# Check if app is listening on correct port
echo -e "\n5️⃣ Checking port 5000:"
sudo netstat -tlnp | grep :5000 || echo "❌ App not listening on port 5000"

# Check memory usage
echo -e "\n6️⃣ Memory usage:"
free -h

# Check disk space
echo -e "\n7️⃣ Disk space:"
df -h

echo -e "\n📝 Attempting fixes..."
echo "----------------------"

# Restart the application
echo -e "\n➤ Restarting application with PM2:"
cd /home/ubuntu/chefbounty-dashboard
pm2 stop all
pm2 start npm --name "chefbounty-backend" -- start

# Wait for app to start
sleep 5

# Check if app started successfully
echo -e "\n➤ Checking app status after restart:"
pm2 list
pm2 logs --lines 10 --nostream

# Test if app is responding
echo -e "\n➤ Testing app response:"
curl -I http://localhost:5000 || echo "❌ App not responding on localhost:5000"

# Restart nginx
echo -e "\n➤ Restarting Nginx:"
sudo systemctl restart nginx

# Final status check
echo -e "\n✅ Final Status:"
echo "----------------"
pm2 list
echo -e "\nTesting public URL..."
curl -I https://dashboard.chefbounty.com || echo "Still not accessible"

ENDSSH

echo -e "\n📋 Quick Fix Commands (run these manually if needed):"
echo "ssh -i $KEY_PATH $USER@$HOST"
echo "cd /home/ubuntu/chefbounty-dashboard"
echo "pm2 restart all"
echo "pm2 logs"