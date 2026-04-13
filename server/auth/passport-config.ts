import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { simpleStorage } from '../simple-storage';
import { normalizeProviderProfile } from './profile-normalizer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface OAuthProfile {
  provider: 'linkedin';
  providerAccountId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  headline?: string;
  company?: string;
  title?: string;
  location?: string;
  profileUrl?: string;
}

// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  callbackURL: `${process.env.APP_URL}/api/auth/linkedin/callback`,
  scope: ['openid', 'profile', 'email'],
  // Force the use of the new API
  profileUrl: 'https://api.linkedin.com/v2/userinfo'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('LinkedIn profile received:', JSON.stringify(profile, null, 2));
    console.log('Access token:', accessToken);
    
    const normalizedProfile = normalizeProviderProfile('linkedin', profile);
    const authResult = await handleOAuthLogin(normalizedProfile, accessToken, refreshToken);
    return done(null, authResult);
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return done(error as Error);
  }
}));

// Handle OAuth login/registration
async function handleOAuthLogin(
  profile: OAuthProfile, 
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
        firstName: profile.firstName || user.firstName,
        lastName: profile.lastName || user.lastName,
        fullName: profile.fullName || user.fullName,
        avatarUrl: profile.avatarUrl || user.avatarUrl,
        headline: profile.headline || user.headline,
        company: profile.company || user.company,
        title: profile.title || user.title,
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
        profilePhoto: profile.avatarUrl,
        location: profile.location,
        emailVerified: !!profile.email, // Trust provider's email
        // SSO fields
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        headline: profile.headline,
        company: profile.company,
        title: profile.title,
        [`${profile.provider}Url`]: profile.profileUrl,
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
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      provider: profile.provider 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
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

// Serialize/deserialize for session (minimal since we use JWT)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;