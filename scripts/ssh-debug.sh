#!/bin/bash

echo "🔍 SSH Connection Debugger"
echo "=========================="

# Try to find the PEM file
echo "Looking for PEM files..."
find . -name "*.pem" -type f 2>/dev/null

KEY_PATH="./chefbounty-dashboard-key.pem"

if [ ! -f "$KEY_PATH" ]; then
    echo "❌ PEM file not found at $KEY_PATH"
    echo "Please specify the correct path to your PEM file"
    exit 1
fi

echo -e "\n✅ Found PEM file: $KEY_PATH"

# Fix permissions
echo "Setting correct permissions (400)..."
chmod 400 "$KEY_PATH"
ls -la "$KEY_PATH"

# Try different connection methods
echo -e "\n🔐 Attempting SSH connection..."

# Method 1: Direct SSH with verbose output
echo -e "\nMethod 1: Direct SSH with debugging"
ssh -vvv -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@dashboard.chefbounty.com exit 2>&1 | grep -E "debug1: Offering|debug1: Trying|Permission denied|Authentication"

# Method 2: Try with IP address if DNS fails
echo -e "\nMethod 2: Using IP address"
echo "Resolving dashboard.chefbounty.com..."
IP=$(dig +short dashboard.chefbounty.com | tail -1)
echo "IP: $IP"

if [ ! -z "$IP" ]; then
    ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" ubuntu@$IP "echo '✅ SSH Connection Successful!'; pm2 list"
fi

# Method 3: Manual connection string
echo -e "\n📋 Manual SSH Commands to try:"
echo "1. ssh -i $KEY_PATH ubuntu@dashboard.chefbounty.com"
echo "2. ssh -i $KEY_PATH ubuntu@$IP"
echo "3. ssh -i $KEY_PATH ec2-user@dashboard.chefbounty.com (if ubuntu user doesn't work)"

echo -e "\n🔧 Troubleshooting:"
echo "- Make sure this is the correct PEM file for the dashboard EC2 instance"
echo "- Verify the EC2 instance is running in AWS console"
echo "- Check security group allows SSH (port 22) from your IP"
echo "- The instance might use 'ec2-user' instead of 'ubuntu'"