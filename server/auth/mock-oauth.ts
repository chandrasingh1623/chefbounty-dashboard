// Mock OAuth for local testing
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enable mock OAuth only in development
const ENABLE_MOCK_OAUTH = process.env.NODE_ENV === 'development' && process.env.MOCK_OAUTH === 'true';

if (ENABLE_MOCK_OAUTH) {
  console.log('⚠️  Mock OAuth enabled for testing - DO NOT USE IN PRODUCTION');

  // Mock Facebook login
  router.get('/facebook', (req, res) => {
    res.redirect('/api/auth/facebook/callback?mock=true');
  });

  router.get('/facebook/callback', async (req, res) => {
    if (req.query.mock !== 'true') {
      return res.redirect('/login?error=invalid_mock');
    }

    // Create mock user data
    const mockUser = {
      id: 99999,
      email: 'test.facebook@example.com',
      name: 'Test Facebook User',
      role: 'chef',
      provider: 'facebook',
      isNewUser: true,
      needsOnboarding: true,
      firstName: 'Test',
      lastName: 'Facebook User',
      avatarUrl: 'https://via.placeholder.com/200x200?text=FB+User',
    };

    // Generate token
    const token = jwt.sign(
      { 
        id: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role,
        provider: mockUser.provider 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect with token
    res.redirect(`/onboarding#token=${token}&provider=facebook&newUser=true`);
  });

  // Mock LinkedIn login
  router.get('/linkedin', (req, res) => {
    res.redirect('/api/auth/linkedin/callback?mock=true');
  });

  router.get('/linkedin/callback', async (req, res) => {
    if (req.query.mock !== 'true') {
      return res.redirect('/login?error=invalid_mock');
    }

    // Create mock user data
    const mockUser = {
      id: 99998,
      email: 'test.linkedin@example.com',
      name: 'Test LinkedIn User',
      role: 'host',
      provider: 'linkedin',
      isNewUser: true,
      needsOnboarding: true,
      firstName: 'Test',
      lastName: 'LinkedIn User',
      fullName: 'Test LinkedIn User',
      avatarUrl: 'https://via.placeholder.com/200x200?text=LI+User',
      headline: 'Senior Chef | Culinary Expert',
      company: 'Test Restaurant Group',
      title: 'Executive Chef',
    };

    // Generate token
    const token = jwt.sign(
      { 
        id: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role,
        provider: mockUser.provider 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect with token
    res.redirect(`/onboarding#token=${token}&provider=linkedin&newUser=true`);
  });

  // Mock profile endpoint
  router.get('/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Return mock user based on provider
      const mockUsers: any = {
        facebook: {
          id: 99999,
          email: 'test.facebook@example.com',
          name: 'Test Facebook User',
          role: 'chef',
          firstName: 'Test',
          lastName: 'Facebook User',
          avatarUrl: 'https://via.placeholder.com/200x200?text=FB+User',
          linkedProviders: ['facebook'],
        },
        linkedin: {
          id: 99998,
          email: 'test.linkedin@example.com',
          name: 'Test LinkedIn User',
          role: 'host',
          firstName: 'Test',
          lastName: 'LinkedIn User',
          fullName: 'Test LinkedIn User',
          avatarUrl: 'https://via.placeholder.com/200x200?text=LI+User',
          headline: 'Senior Chef | Culinary Expert',
          company: 'Test Restaurant Group',
          title: 'Executive Chef',
          linkedProviders: ['linkedin'],
        },
      };

      const user = mockUsers[decoded.provider] || mockUsers.facebook;
      res.json({ user });
    } catch (error) {
      res.status(403).json({ message: 'Invalid token' });
    }
  });
}

export default router;