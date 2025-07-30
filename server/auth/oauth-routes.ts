import { Router } from 'express';
import passport from './passport-config';
import jwt from 'jsonwebtoken';
import mockOAuthRouter from './mock-oauth';
import linkedInManualRouter from './linkedin-manual-oauth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Debug endpoint to check OAuth configuration
router.get('/debug-oauth', (req, res) => {
  res.json({
    app_url: process.env.APP_URL,
    facebook_callback: `${process.env.APP_URL}/api/auth/facebook/callback`,
    linkedin_callback: `${process.env.APP_URL}/api/auth/linkedin/callback`,
    mock_oauth: process.env.MOCK_OAUTH,
    facebook_client_id: process.env.FACEBOOK_CLIENT_ID ? 'configured' : 'missing',
    linkedin_client_id: process.env.LINKEDIN_CLIENT_ID ? 'configured' : 'missing'
  });
});

// Use mock OAuth in development if enabled
if (process.env.NODE_ENV === 'development' && process.env.MOCK_OAUTH === 'true') {
  router.use('/', mockOAuthRouter);
} else {
  // Use manual LinkedIn OAuth implementation
  router.use('/', linkedInManualRouter);

// Facebook OAuth routes
router.get('/facebook', 
  passport.authenticate('facebook', { 
    scope: ['email', 'public_profile'] 
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const authResult = req.user as any;
    if (!authResult || !authResult.token) {
      return res.redirect('/login?error=auth_failed');
    }
    
    // Redirect with token and user state
    const redirectUrl = authResult.user.needsOnboarding 
      ? '/onboarding' 
      : '/dashboard';
    
    // Pass token via URL fragment to avoid server logs
    res.redirect(`${redirectUrl}#token=${authResult.token}&provider=facebook&newUser=${authResult.user.isNewUser}`);
  }
);

// LinkedIn OAuth routes - handled by manual implementation above
// router.get('/linkedin', ...) - see linkedin-manual-oauth.ts
// router.get('/linkedin/callback', ...) - see linkedin-manual-oauth.ts

// Get user profile with SSO data
router.get('/profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    console.log('Verifying token in /api/auth/profile:', { 
      token: token.substring(0, 20) + '...', 
      JWT_SECRET: JWT_SECRET.substring(0, 10) + '...' 
    });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token decoded successfully:', decoded);
    
    const { simpleStorage } = await import('../simple-storage');
    
    const user = await simpleStorage.getUser(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get linked accounts
    const linkedAccounts = await simpleStorage.getAccountsByUserId(user.id);
    const providers = linkedAccounts.map(acc => acc.provider);
    
    res.json({
      user: {
        ...user,
        password: undefined,
        linkedProviders: providers,
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
});

} // End of non-mock OAuth routes

export default router;