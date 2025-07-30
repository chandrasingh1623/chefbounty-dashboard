# SSO Setup Guide for ChefBounty Dashboard

## Overview

This guide will help you set up Single Sign-On (SSO) with Facebook and LinkedIn for the ChefBounty dashboard.

## Prerequisites

- ChefBounty dashboard deployed at https://dashboard.chefbounty.com
- Access to Facebook Developer Console
- Access to LinkedIn Developer Console
- Database with SSO tables migrated

## 1. Database Migration

Run the migration to add SSO support:

```bash
# Apply the migration
psql $DATABASE_URL < migrations/0001_add_sso.sql

# Or using your preferred migration tool
npm run db:migrate
```

## 2. Facebook OAuth Setup

### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in app details:
   - App Name: "ChefBounty Dashboard"
   - App Contact Email: your-email@example.com
   - App Purpose: Business

### Configure Facebook Login

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Site URL: `https://dashboard.chefbounty.com`

### OAuth Settings

1. Go to Facebook Login → Settings
2. Add to "Valid OAuth Redirect URIs":
   ```
   https://dashboard.chefbounty.com/api/auth/facebook/callback
   ```
3. Enable:
   - Client OAuth Login: Yes
   - Web OAuth Login: Yes
   - Use Strict Mode for Redirect URIs: Yes

### Get Credentials

1. Go to Settings → Basic
2. Copy:
   - App ID → `FACEBOOK_CLIENT_ID`
   - App Secret → `FACEBOOK_CLIENT_SECRET`

### Required Permissions

The app requests these permissions by default:
- `email`
- `public_profile`

## 3. LinkedIn OAuth Setup

### Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in details:
   - App name: "ChefBounty Dashboard"
   - LinkedIn Page: Your company page
   - App logo: Upload ChefBounty logo
   - Privacy policy URL: `https://dashboard.chefbounty.com/privacy`
   - Terms of use URL: `https://dashboard.chefbounty.com/terms`

### Configure OAuth 2.0

1. Go to "Auth" tab
2. Add Authorized redirect URLs:
   ```
   https://dashboard.chefbounty.com/api/auth/linkedin/callback
   ```
3. OAuth 2.0 scopes - ensure these are selected:
   - `r_liteprofile`
   - `r_emailaddress`

### Get Credentials

1. In the "Auth" tab, copy:
   - Client ID → `LINKEDIN_CLIENT_ID`
   - Client Secret → `LINKEDIN_CLIENT_SECRET`

## 4. Environment Variables

Add these to your `.env` file:

```env
# Authentication
JWT_SECRET=your-secure-random-string-here
APP_URL=https://dashboard.chefbounty.com

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## 5. Deploy Changes

1. Install new dependencies:
   ```bash
   npm install
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy to your server
   ```

3. Restart the application:
   ```bash
   pm2 restart chefbounty-dashboard
   ```

## 6. Testing

### Test Facebook Login

1. Go to https://dashboard.chefbounty.com/login
2. Click "Continue with Facebook"
3. Authorize the app
4. Should redirect to onboarding (new user) or dashboard (existing user)

### Test LinkedIn Login

1. Go to https://dashboard.chefbounty.com/login
2. Click "Continue with LinkedIn"
3. Authorize the app
4. Should redirect to onboarding with LinkedIn data prefilled

## 7. Production Checklist

- [ ] SSL certificate valid and HTTPS enforced
- [ ] Environment variables set in production
- [ ] Database migration applied
- [ ] Facebook app in production mode
- [ ] LinkedIn app verified
- [ ] Error logging configured
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection enabled

## 8. Security Considerations

1. **Token Storage**: Access tokens are stored encrypted in the database
2. **Session Security**: JWT tokens expire after 7 days
3. **HTTPS Only**: OAuth callbacks require HTTPS
4. **State Parameter**: Prevents CSRF attacks during OAuth flow
5. **Minimal Permissions**: Only request necessary scopes

## 9. Troubleshooting

### Facebook Login Issues

- **Invalid Redirect URI**: Ensure the callback URL matches exactly
- **App Not Live**: Switch app to production mode
- **Missing Permissions**: User may have denied email access

### LinkedIn Login Issues

- **Invalid Scope**: Ensure r_liteprofile and r_emailaddress are enabled
- **Redirect Mismatch**: URLs must match exactly (including https://)
- **Rate Limits**: LinkedIn has strict rate limits, implement caching

### General Issues

- **CORS Errors**: Check nginx configuration for proper headers
- **Token Issues**: Verify JWT_SECRET is set and consistent
- **Database Errors**: Ensure migration was applied successfully

## 10. User Flow

1. **First-time SSO Login**:
   - User clicks SSO button
   - Authorizes on provider site
   - Redirects to `/onboarding` with prefilled data
   - User completes profile
   - Redirects to dashboard

2. **Returning SSO User**:
   - User clicks SSO button
   - Authorizes on provider site
   - Redirects directly to `/dashboard`
   - Profile updated with latest provider data

3. **Linking Accounts**:
   - User with existing email logs in via SSO
   - Provider account linked to existing user
   - No duplicate accounts created

## Support

For issues or questions:
- Check server logs: `pm2 logs chefbounty-dashboard`
- Review browser console for client errors
- Verify environment variables are set correctly