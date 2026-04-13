# GitHub Actions Deployment Setup

## Overview
This guide explains how to set up automatic deployment using GitHub Actions for the ChefBounty dashboard.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. EC2_SSH_KEY
The private key (PEM file) used to SSH into your EC2 instance.

**How to get it:**
- This is the `.pem` file you downloaded when creating your EC2 key pair
- Open the file and copy the entire contents (including the BEGIN and END lines)

**Format:**
```
-----BEGIN PRIVATE KEY-----
(your key content here)
-----END PRIVATE KEY-----
```

### 2. EC2_HOST
The public IP address or domain name of your EC2 instance.

**Example:** `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`

### 3. EC2_USER
The SSH username for your EC2 instance.

**Common values:**
- `ec2-user` (for Amazon Linux)
- `ubuntu` (for Ubuntu)
- `admin` (for Debian)

### 4. DATABASE_URL
Your PostgreSQL database connection string.

**Format:** `postgresql://username:password@host:5432/database_name`

### 5. RESEND_API_KEY
Your Resend API key for sending emails.

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository, not your profile)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name as listed above

## Deployment Process

Once secrets are configured, deployment happens automatically when:
- You push to the `main` branch
- You manually trigger the workflow from the Actions tab

The deployment workflow will:
1. Build the application
2. Create a deployment package
3. Upload it to your EC2 instance
4. Run database migrations (including the events and chefs data)
5. Restart the application with PM2

## Manual Deployment Trigger

To manually trigger a deployment:
1. Go to the **Actions** tab in your repository
2. Click on **Deploy Dashboard to EC2**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Verifying Deployment

After deployment, check:
1. The Actions tab to see if the workflow succeeded
2. Your application at `https://chefbounty.com`
3. Browse Events page should show 10 events
4. Browse Chefs page should show 8 chef profiles
5. Cuisine types display without brackets
6. Guest counts show actual numbers

## Troubleshooting

### SSH Connection Failed
- Verify EC2 security group allows SSH (port 22) from GitHub Actions IPs
- Check that the SSH key is correctly formatted in the secret
- Ensure the EC2 instance is running

### Database Migration Failed
- Check DATABASE_URL is correct
- Verify the database is accessible from EC2
- Check logs in the Actions tab for specific errors

### Application Not Starting
- Check PM2 logs: `pm2 logs chefbounty-dashboard`
- Verify all environment variables are set correctly
- Check disk space on EC2 instance