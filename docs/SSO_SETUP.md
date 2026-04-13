# SSO Setup Guide for ChefBounty

## Current Status
- ✅ Mock OAuth is working (for local testing)
- ⏳ Real OAuth apps need to be configured

## Setting Up Facebook OAuth

1. **Create Facebook App**
   - Go to https://developers.facebook.com
   - Click "My Apps" → "Create App"
   - Choose "Consumer" type
   - Fill in app details

2. **Configure OAuth Settings**
   - In your app dashboard, go to "Facebook Login" → "Settings"
   - Add these Valid OAuth Redirect URIs:
     - `http://localhost:3001/api/auth/facebook/callback` (for local testing)
     - `https://dashboard.chefbounty.com/api/auth/facebook/callback` (for production)

3. **Get Credentials**
   - Go to "Settings" → "Basic"
   - Copy your App ID and App Secret

## Setting Up LinkedIn OAuth

1. **Create LinkedIn App**
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in app details

2. **Configure OAuth Settings**
   - In "Auth" tab, add Redirect URLs:
     - `http://localhost:3001/api/auth/linkedin/callback` (for local testing)
     - `https://dashboard.chefbounty.com/api/auth/linkedin/callback` (for production)

3. **Request Products**
   - In "Products" tab, request access to "Sign In with LinkedIn using OpenID Connect"
   - Wait for approval (usually instant)

4. **Get Credentials**
   - In "Auth" tab, copy Client ID and Client Secret

## Local Testing with Real OAuth

1. Update your `.env` file:
   ```
   MOCK_OAUTH=false
   FACEBOOK_CLIENT_ID=your_actual_app_id
   FACEBOOK_CLIENT_SECRET=your_actual_app_secret
   LINKEDIN_CLIENT_ID=your_actual_client_id
   LINKEDIN_CLIENT_SECRET=your_actual_client_secret
   ```

2. Restart the server:
   ```bash
   npm run dev
   ```

3. Click the SSO buttons - you'll now see real Facebook/LinkedIn login screens

## Production Deployment

1. Set environment variables on EC2:
   ```bash
   # SSH into your EC2 instance
   ssh -i your-key.pem ubuntu@dashboard.chefbounty.com

   # Edit environment file
   sudo nano /etc/environment

   # Add:
   FACEBOOK_CLIENT_ID="your_production_app_id"
   FACEBOOK_CLIENT_SECRET="your_production_app_secret"
   LINKEDIN_CLIENT_ID="your_production_client_id"
   LINKEDIN_CLIENT_SECRET="your_production_client_secret"
   APP_URL="https://dashboard.chefbounty.com"
   MOCK_OAUTH="false"
   ```

2. Restart the application:
   ```bash
   pm2 restart all
   ```

## Testing Checklist

- [ ] Mock OAuth works locally (✅ confirmed working)
- [ ] Create Facebook app
- [ ] Create LinkedIn app
- [ ] Test with real OAuth locally
- [ ] Deploy to production
- [ ] Test on production

## Troubleshooting

**"Invalid redirect URI" error:**
- Ensure redirect URLs match exactly (including http/https)
- Check for trailing slashes

**"App not authorized" error:**
- For LinkedIn: Ensure you've requested the correct products
- For Facebook: Check app is in development or live mode

**Login works but no data:**
- Check the requested scopes in `passport-config.ts`
- Ensure your apps have permission to access user data