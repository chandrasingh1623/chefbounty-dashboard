# Quick Manual Fix for 502 Error

## Step 1: Fix PEM Permissions
```bash
chmod 400 chefbounty-dashboard-key.pem
```

## Step 2: Try SSH with Different Users

### Option A: Ubuntu User
```bash
ssh -i chefbounty-dashboard-key.pem ubuntu@dashboard.chefbounty.com
```

### Option B: EC2-User
```bash
ssh -i chefbounty-dashboard-key.pem ec2-user@dashboard.chefbounty.com
```

### Option C: Use IP Address
```bash
# Get the IP
nslookup dashboard.chefbounty.com

# SSH with IP (replace with actual IP)
ssh -i chefbounty-dashboard-key.pem ubuntu@3.19.56.71
```

## Step 3: Once Connected, Fix the Backend

```bash
# Check what's running
pm2 list

# If nothing is running or shows error
cd /home/ubuntu/chefbounty-dashboard
pm2 delete all
pm2 start npm --name "backend" -- start

# Check logs
pm2 logs --lines 50

# If you see database connection errors
export $(cat /etc/environment | xargs)
pm2 restart all
```

## Step 4: Test
```bash
# On the server
curl http://localhost:5000

# From your browser
https://dashboard.chefbounty.com
```

## Alternative: AWS Console Method

1. Go to AWS EC2 Console
2. Find your dashboard instance
3. Click "Connect" → "EC2 Instance Connect"
4. Once connected via browser terminal:
   ```bash
   sudo su - ubuntu
   cd /home/ubuntu/chefbounty-dashboard
   pm2 restart all
   ```

## If PEM File is Wrong

You need the correct PEM file that was used when creating the dashboard EC2 instance. Check:
- Your AWS console for the key pair name
- Your local AWS keys folder
- The original instance creation details