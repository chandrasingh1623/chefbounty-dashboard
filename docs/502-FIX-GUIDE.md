# 502 Bad Gateway Fix Guide

## Quick Fix (Most Common Solution)

1. **SSH into the server:**
   ```bash
   ssh -i chefbounty-dashboard-key.pem ubuntu@dashboard.chefbounty.com
   ```

2. **Restart the application:**
   ```bash
   cd /home/ubuntu/chefbounty-dashboard
   pm2 restart all
   ```

3. **Check logs for errors:**
   ```bash
   pm2 logs --lines 50
   ```

## Common Causes & Solutions

### 1. Application Crashed
```bash
# Check PM2 status
pm2 list

# If app shows "errored" or "stopped"
pm2 delete all
pm2 start npm --name "chefbounty-backend" -- start
```

### 2. Port Conflict
```bash
# Check if something else is using port 5000
sudo lsof -i :5000

# Kill any conflicting process
sudo kill -9 <PID>
```

### 3. Out of Memory
```bash
# Check memory
free -h

# If low on memory, restart PM2 with memory limit
pm2 delete all
pm2 start npm --name "chefbounty-backend" --max-memory-restart 400M -- start
```

### 4. Environment Variables Missing
```bash
# Check if env vars are loaded
cat /etc/environment

# Reload environment and restart
export $(cat /etc/environment | xargs)
pm2 restart all
```

### 5. Nginx Configuration Issue
```bash
# Test nginx config
sudo nginx -t

# Check nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

## Nuclear Option (Full Reset)

If nothing else works:

```bash
# SSH into server
ssh -i chefbounty-dashboard-key.pem ubuntu@dashboard.chefbounty.com

# Stop everything
pm2 kill
sudo systemctl stop nginx

# Clear everything
cd /home/ubuntu/chefbounty-dashboard
rm -rf node_modules package-lock.json
pm2 flush

# Reinstall and restart
npm install
pm2 start npm --name "chefbounty-backend" -- start
sudo systemctl start nginx
```

## Monitoring Commands

```bash
# Watch PM2 logs in real-time
pm2 logs

# Monitor resources
pm2 monit

# Check system resources
htop
```

## Prevention

1. Set up PM2 to auto-restart on crash:
   ```bash
   pm2 startup
   pm2 save
   ```

2. Set memory limits:
   ```bash
   pm2 set pm2:max-memory-restart 400M
   ```

3. Enable log rotation:
   ```bash
   pm2 install pm2-logrotate
   ```