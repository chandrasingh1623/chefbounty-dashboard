import { Router } from 'express';
import crypto from 'crypto';
import { simpleStorage } from '../simple-storage';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store state for CSRF protection
const stateStore = new Map<string, { timestamp: number }>();

// LinkedIn OAuth URLs
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

// Manual LinkedIn OAuth implementation
router.get('/linkedin', (req, res) => {
  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  stateStore.set(state, { timestamp: Date.now() });
  console.log('Generated OAuth state:', { state, storeSize: stateStore.size });
  
  // Clean up old states (older than 10 minutes)
  let cleaned = 0;
  for (const [key, value] of stateStore.entries()) {
    if (Date.now() - value.timestamp > 600000) {
      stateStore.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired OAuth states`);
  }
  
  // Build authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/auth/linkedin/callback`,
    scope: 'openid profile email',
    state: state
  });
  
  res.redirect(`${LINKEDIN_AUTH_URL}?${params.toString()}`);
});

router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return res.redirect('/login?error=oauth_denied');
    }
    
    // Verify state
    if (!state || !stateStore.has(state as string)) {
      console.error('Invalid state parameter:', { state, hasState: !!state, inStore: state ? stateStore.has(state as string) : false });
      return res.redirect('/login?error=invalid_state');
    }
    stateStore.delete(state as string);
    
    // Exchange code for token
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.APP_URL}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }).toString()
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return res.redirect('/login?error=token_exchange_failed');
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;
    
    // Get user info
    const userResponse = await fetch(LINKEDIN_USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error('Failed to fetch user info:', error);
      return res.redirect('/login?error=profile_fetch_failed');
    }
    
    const userInfo = await userResponse.json();
    console.log('LinkedIn userInfo:', userInfo);
    
    // Create normalized profile
    const profile = {
      provider: 'linkedin' as const,
      providerAccountId: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      profileUrl: `https://linkedin.com/in/${userInfo.sub}`,
    };
    
    // Handle OAuth login
    const result = await handleOAuthLogin(profile, accessToken, tokenData.refresh_token);
    
    // Redirect with token
    const redirectUrl = result.user.needsOnboarding ? '/onboarding' : '/dashboard';
    res.redirect(`${redirectUrl}#token=${result.token}&provider=linkedin&newUser=${result.user.isNewUser}`);
    
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect('/login?error=auth_failed');
  }
});

// OAuth login handler (copied from passport-config.ts)
async function handleOAuthLogin(
  profile: any, 
  accessToken: string, 
  refreshToken?: string
) {
  // Check if account exists
  const existingAccount = await simpleStorage.getAccountByProvider(
    profile.provider, 
    profile.providerAccountId
  );
  
  let userId: number;
  let isNewUser = false;
  
  if (existingAccount) {
    // Existing user, update profile if needed
    userId = existingAccount.userId;
    const user = await simpleStorage.getUser(userId);
    
    if (user) {
      // Update user profile with latest data (non-destructive)
      await simpleStorage.updateUser(userId, {
        profilePhoto: user.profilePhoto || profile.avatarUrl,
        name: user.name || profile.fullName || `${profile.firstName} ${profile.lastName}`.trim(),
        location: user.location || profile.location,
      });
      
      // Update SSO fields
      await simpleStorage.updateUserSSOFields(userId, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        [`${profile.provider}Url`]: profile.profileUrl,
      });
    }
    
    // Update tokens
    await simpleStorage.updateAccount(existingAccount.id, {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
  } else {
    // New user or linking new provider
    let user = profile.email ? await simpleStorage.getUserByEmail(profile.email) : null;
    
    if (user) {
      // User exists with same email, link the provider
      userId = user.id;
    } else {
      // Create new user
      isNewUser = true;
      const newUser = await simpleStorage.createUser({
        email: profile.email || `${profile.provider}_${profile.providerAccountId}@temp.com`,
        password: '', // No password for SSO users
        role: 'chef', // Default role, will be updated in onboarding
        name: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim() || 'New User',
      });
      userId = newUser.id;
    }
    
    // Create account link
    await simpleStorage.createAccount({
      userId,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }
  
  // Get full user data
  const user = await simpleStorage.getUser(userId);
  if (!user) throw new Error('User not found after OAuth');
  
  // Generate JWT token
  const tokenPayload = { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    provider: profile.provider 
  };
  console.log('Generating JWT token with payload:', tokenPayload);
  console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
  
  const token = jwt.sign(
    tokenPayload,
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  console.log('Generated token:', token.substring(0, 20) + '...');
  
  return {
    token,
    user: {
      ...user,
      password: undefined,
      isNewUser,
      needsOnboarding: isNewUser || !user.role || !user.name || user.name === 'New User'
    }
  };
}

export default router;