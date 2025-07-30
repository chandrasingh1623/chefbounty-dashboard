# SSO Testing Plan

## Test Scenarios

### 1. Facebook Login - New User
- [ ] Click "Continue with Facebook" on login page
- [ ] Authorize app on Facebook
- [ ] Verify redirect to `/onboarding`
- [ ] Check prefilled fields:
  - Name (from Facebook)
  - Email (from Facebook)
  - Avatar (profile picture)
- [ ] Complete onboarding form
- [ ] Verify redirect to dashboard
- [ ] Check database for:
  - User record created
  - Account record with provider="facebook"

### 2. LinkedIn Login - New User
- [ ] Click "Continue with LinkedIn" on login page
- [ ] Authorize app on LinkedIn
- [ ] Verify redirect to `/onboarding`
- [ ] Check prefilled fields:
  - Name (from LinkedIn)
  - Email (from LinkedIn)
  - Avatar (profile picture)
  - Headline (if available)
  - Company/Title (if available)
- [ ] Complete onboarding form
- [ ] Verify redirect to dashboard
- [ ] Check database for:
  - User record created
  - Account record with provider="linkedin"

### 3. Returning User Login
- [ ] Login with Facebook (existing user)
- [ ] Verify direct redirect to `/dashboard`
- [ ] Check profile updated with latest data
- [ ] Login with LinkedIn (existing user)
- [ ] Verify direct redirect to `/dashboard`

### 4. Account Linking
- [ ] Create account with email/password
- [ ] Logout
- [ ] Login with Facebook using same email
- [ ] Verify account linked (no new user created)
- [ ] Check database for two account records (local + facebook)
- [ ] Repeat for LinkedIn

### 5. Error Scenarios
- [ ] Cancel OAuth authorization
- [ ] Verify redirect to login with error message
- [ ] Test with invalid OAuth tokens
- [ ] Test with expired tokens

### 6. Security Tests
- [ ] Verify HTTPS enforced on callbacks
- [ ] Check JWT tokens have expiration
- [ ] Verify no sensitive data in URL params
- [ ] Test CSRF protection on OAuth flow

### 7. UI/UX Tests
- [ ] SSO buttons styled correctly
- [ ] Hover states work
- [ ] Loading states during OAuth
- [ ] Error messages display properly
- [ ] Mobile responsive

### 8. Performance Tests
- [ ] OAuth flow completes in < 3 seconds
- [ ] Profile data loads quickly
- [ ] No duplicate API calls

## Manual Test Commands

```bash
# Check if user was created
psql $DATABASE_URL -c "SELECT * FROM users WHERE email='test@example.com';"

# Check linked accounts
psql $DATABASE_URL -c "SELECT * FROM accounts WHERE user_id=1;"

# Monitor OAuth flow
tail -f pm2 logs chefbounty-dashboard

# Test JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" https://dashboard.chefbounty.com/api/auth/profile
```