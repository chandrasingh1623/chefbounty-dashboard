# Local SSO Testing Guide

## Quick Start (Mock OAuth)

1. **Enable Mock OAuth**:
   ```bash
   # Add to .env.local
   MOCK_OAUTH=true
   ```

2. **Run the test script**:
   ```bash
   ./test-sso-local.sh
   ```

3. **Test the flow**:
   - Go to http://localhost:3000/login
   - Click "Continue with Facebook" or "Continue with LinkedIn"
   - You'll be redirected to onboarding with mock data
   - Complete the form and submit

## Testing with Real OAuth Providers

### Option 1: Using ngrok (Recommended)

1. **Install ngrok**:
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. **Start your local server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Update .env with ngrok URL**:
   ```env
   APP_URL=https://your-subdomain.ngrok.io
   ```

5. **Configure OAuth apps**:
   - Facebook: Add `https://your-subdomain.ngrok.io/api/auth/facebook/callback`
   - LinkedIn: Add `https://your-subdomain.ngrok.io/api/auth/linkedin/callback`

### Option 2: Local OAuth Test Apps

1. **Facebook Test App**:
   - Go to Facebook Developers
   - Create a test app
   - Add `http://localhost:3000` as valid OAuth redirect
   - Add `http://localhost:3000/api/auth/facebook/callback`

2. **LinkedIn Test App**:
   - Create a development app
   - Add `http://localhost:3000/api/auth/linkedin/callback`

## What to Test

1. **UI Elements**:
   - [ ] SSO buttons appear correctly
   - [ ] Hover states work
   - [ ] Icons display properly
   - [ ] Responsive on mobile

2. **OAuth Flow**:
   - [ ] Click SSO button
   - [ ] Redirects to provider (or mock)
   - [ ] Returns to app with token
   - [ ] Onboarding page loads

3. **Data Prefilling**:
   - [ ] Name is prefilled
   - [ ] Email is prefilled
   - [ ] Avatar shows (if available)
   - [ ] LinkedIn: headline/company prefilled

4. **Form Submission**:
   - [ ] Can edit prefilled data
   - [ ] Validation works
   - [ ] Submits successfully
   - [ ] Redirects to dashboard

## Debugging

Check the console for:
```bash
# Server logs
npm run dev

# Browser console
# Check for token in URL hash
# Check localStorage for token
localStorage.getItem('token')

# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/auth/profile
```

## Common Issues

1. **"Cannot GET /api/auth/facebook"**
   - Make sure server is running
   - Check that routes are registered

2. **Redirect errors**
   - Verify APP_URL in .env matches your local URL
   - Check OAuth app settings

3. **Token issues**
   - Ensure JWT_SECRET is set
   - Check token expiration

## Reset Test Data

To start fresh:
```bash
# Clear browser data
localStorage.clear()

# Restart server
npm run dev
```