import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { simpleStorage } from "./simple-storage";
import { insertUserSchema, insertEventSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "./email";
import passport from "./auth/passport-config";
import oauthRoutes from "./auth/oauth-routes";
import { Pool } from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize passport
  app.use(passport.initialize());

  // WebSocket setup for real-time messaging
  let wss: WebSocketServer | null = null;
  const clients = new Map<number, WebSocket>();

  // Disable WebSocket in environments that don't support it
  if (process.env.DISABLE_WEBSOCKET !== 'true') {
    try {
      wss = new WebSocketServer({ server: httpServer, path: '/ws' });
      
      wss.on('connection', (ws: WebSocket, req) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const userId = parseInt(url.searchParams.get('userId') || '0');
        
        if (userId > 0) {
          clients.set(userId, ws);
        }

        ws.on('close', () => {
          clients.delete(userId);
        });
      });
    } catch (error) {
      console.warn('WebSocket server could not be initialized:', error);
    }
  }

  // OAuth routes
  app.use("/api/auth", oauthRoutes);
  
  // Test database connection endpoint
  app.get("/api/test-db", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json({ 
        success: true, 
        userCount: users.length,
        message: "Database connection working!"
      });
    } catch (error) {
      console.error('Test DB error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Check if accounts table exists
  app.get("/api/check-accounts-table", async (req, res) => {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      
      // Check if accounts table exists
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'accounts'
        )
      `);
      
      const accountsTableExists = result.rows[0].exists;
      
      res.json({
        accountsTableExists,
        message: accountsTableExists ? 'Accounts table exists' : 'Accounts table does not exist - OAuth will fail'
      });
      
      await pool.end();
    } catch (error) {
      console.error('Check accounts table error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  // Create accounts table for OAuth
  app.post("/api/create-accounts-table", async (req, res) => {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      
      // Create accounts table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          provider_account_id TEXT NOT NULL,
          access_token TEXT,
          refresh_token TEXT,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider, provider_account_id),
          UNIQUE(user_id, provider)
        )
      `);
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider)');
      
      res.json({
        success: true,
        message: 'Accounts table created successfully'
      });
      
      await pool.end();
    } catch (error) {
      console.error('Create accounts table error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await simpleStorage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and generate email verification token
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await simpleStorage.createUser({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role
      });

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'production' ? 
        `https://${req.get('host')}` : 
        `http://${req.get('host')}`;
        
      const emailSent = await EmailService.sendVerificationEmail(
        user.email,
        user.name,
        emailVerificationToken,
        baseUrl
      );

      if (!emailSent) {
        console.warn('Failed to send verification email, but user created successfully');
      }

      res.json({ 
        user: { ...user, password: undefined },
        message: "Registration successful! Please check your email to verify your account before signing in."
      });
    } catch (error) {
      console.log("Registration error:", error);
      res.status(400).json({ message: "Invalid user data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for:', email);

      const user = await simpleStorage.getUserByEmail(email);
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Skip email verification check for now since the column doesn't exist in the database
      // TODO: Add email verification when database schema is updated

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Email verification route
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      // Verify the token
      const verificationData = EmailService.verifyEmailToken(token as string);
      if (!verificationData) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(verificationData.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.redirect('/login?message=already-verified');
      }

      // Update user as verified
      const updatedUser = await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
      });

      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to verify email' });
      }

      // Send welcome email
      const baseUrl = process.env.NODE_ENV === 'production' ? 
        `https://${req.get('host')}` : 
        `http://${req.get('host')}`;
        
      await EmailService.sendWelcomeEmail(
        user.email,
        user.name,
        user.role,
        baseUrl
      );

      // Redirect to login with success message
      res.redirect('/login?message=verified');
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Generate new verification token
      const emailVerificationToken = EmailService.generateVerificationToken(user.id, user.email);
      
      // Update user with new token
      await storage.updateUser(user.id, { emailVerificationToken });

      // Send verification email
      const baseUrl = process.env.NODE_ENV === 'production' ? 
        `https://${req.get('host')}` : 
        `http://${req.get('host')}`;
        
      const emailSent = await EmailService.sendVerificationEmail(
        user.email,
        user.name,
        emailVerificationToken,
        baseUrl
      );

      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification email' });
    }
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user exists
      const user = await simpleStorage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Generate password reset token (reuse verification token logic)
      const resetToken = EmailService.generateVerificationToken(user.id, email);
      
      // For now, skip storing the reset token since our simple schema doesn't support it
      // In production, you'd store this token in the database

      // Send password reset email
      const baseUrl = process.env.NODE_ENV === 'production' ? 
        `https://${req.get('host')}` : 
        `http://${req.get('host')}`;
        
      await EmailService.sendPasswordResetEmail(email, user.name, resetToken, baseUrl);

      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.user.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Event routes
  app.get("/api/events", authenticateToken, async (req, res) => {
    try {
      const events = await simpleStorage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  // Browse events endpoint - shows only approved events for public browsing
  // Must come BEFORE /api/events/:id to avoid route conflicts
  app.get("/api/events/browse", authenticateToken, async (req, res) => {
    try {
      // Get all open events from PostgreSQL
      const events = await simpleStorage.getAllEvents();
      
      res.json(events);
    } catch (error) {
      console.error('Browse events error:', error);
      res.status(500).json({ message: "Failed to get browse events" });
    }
  });

  app.get("/api/events/host/:hostId", authenticateToken, async (req, res) => {
    try {
      const events = await simpleStorage.getEventsByHostId(parseInt(req.params.hostId));
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get host events" });
    }
  });

  app.get("/api/events/:id", authenticateToken, async (req, res) => {
    try {
      const event = await simpleStorage.getEventById(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  app.post("/api/events", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('POST /api/events - Request body:', JSON.stringify(req.body, null, 2));
      console.log('POST /api/events - User ID:', req.user.id);
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        eventDate: new Date(req.body.eventDate), // Convert ISO string to Date object
        hostId: req.user.id, // Use authenticated user's ID as hostId
        status: 'pending' // All new events start as pending
      });
      
      console.log('POST /api/events - Parsed event data:', JSON.stringify(eventData, null, 2));
      
      const event = await storage.createEvent(eventData);
      console.log('POST /api/events - Created event:', JSON.stringify(event, null, 2));
      
      // Send moderation email for new events
      const host = await storage.getUser(req.user.id);
      if (host) {
        try {
          const { sendEventModerationEmail } = await import('./moderation');
          await sendEventModerationEmail({
            eventId: event.id,
            eventTitle: event.title,
            hostName: host.name,
            location: event.location,
            eventDate: event.eventDate.toString(),
            budget: event.budget
          });
        } catch (emailError) {
          console.error('Failed to send moderation email:', emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error('POST /api/events - Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: `Invalid event data: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid event data" });
      }
    }
  });

  app.put("/api/events/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Get the event to verify ownership
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only the host who created the event can edit it
      if (existingEvent.hostId !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own events" });
      }
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        eventDate: new Date(req.body.eventDate),
        hostId: req.user.id,
      });
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error('PUT /api/events/:id - Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: `Invalid event data: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid event data" });
      }
    }
  });

  app.delete("/api/events/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Get the event to verify ownership
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only the host who created the event can delete it
      if (event.hostId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own events" });
      }
      
      // Delete associated bids first to maintain data integrity
      // Get all bids for this event
      const bids = await storage.getBidsByEventId(eventId);
      
      // Delete all associated bids
      for (const bid of bids) {
        await storage.deleteBid(bid.id);
      }
      
      // Delete the event
      const deleted = await storage.deleteEvent(eventId);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error('DELETE /api/events/:id - Error:', error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Bid routes
  app.get("/api/bids/event/:eventId", authenticateToken, async (req, res) => {
    try {
      const bids = await storage.getBidsByEventId(parseInt(req.params.eventId));
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to get bids" });
    }
  });

  app.get("/api/bids/chef/:chefId", authenticateToken, async (req, res) => {
    try {
      const bids = await storage.getBidsByChefId(parseInt(req.params.chefId));
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chef bids" });
    }
  });

  app.get("/api/bids/host/:hostId", authenticateToken, async (req, res) => {
    try {
      const bids = await storage.getBidsByHostId(parseInt(req.params.hostId));
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to get host bids" });
    }
  });

  app.get("/api/bids/recent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user.role === 'host') {
        // For hosts, get recent bids on their events
        const bids = await storage.getBidsByHostId(req.user.id);
        res.json(bids);
      } else if (req.user.role === 'chef') {
        // For chefs, get their recent bids
        const bids = await storage.getBidsByChefId(req.user.id);
        res.json(bids);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent bids" });
    }
  });

  app.post("/api/bids", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only chefs can submit bids
      if (req.user.role !== 'chef') {
        return res.status(403).json({ message: "Only chefs can submit bids" });
      }
      
      const bidData = insertBidSchema.parse({
        ...req.body,
        chefId: req.user.id,
      });
      const bid = await storage.createBid(bidData);
      res.json(bid);
    } catch (error) {
      console.error('POST /api/bids - Error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: `Invalid bid data: ${error.message}` });
      } else {
        res.status(400).json({ message: "Invalid bid data" });
      }
    }
  });

  app.put("/api/bids/:id/status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      const bidId = parseInt(req.params.id);
      
      // Get the full bid with chef and event info for messaging
      const fullBid = await storage.getBidById(bidId);
      if (!fullBid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      // Update bid status
      const bid = await storage.updateBidStatus(bidId, status);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      // If bid is accepted, handle post-acceptance flow
      if (status === 'accepted') {
        // Get chef and host info
        const chef = await storage.getUser(bid.chefId);
        const host = await storage.getUser(req.user.id);
        const event = await storage.getEventById(bid.eventId);

        if (chef && host && event) {
          // Update event status to "in_progress"
          await storage.updateEvent(event.id, { status: 'in_progress' });

          // Create automated messages
          const systemMessage = {
            senderId: 1, // System user ID (using ID 1 instead of 0)
          };

          // Message to chef
          await storage.createMessage({
            ...systemMessage,
            receiverId: chef.id,
            eventId: event.id,
            content: `Congratulations! Your bid for "${event.title}" was accepted. You can now coordinate directly with the host via ChefBounty messages.`,
          });

          // Message to host
          await storage.createMessage({
            ...systemMessage,
            receiverId: host.id,
            eventId: event.id,
            content: `You've accepted Chef ${chef.name}'s bid. Start planning your event by messaging the chef directly through ChefBounty.`,
          });

          // Reject all other pending bids for this event
          await storage.rejectOtherBidsForEvent(event.id, bidId);
        }
      }

      res.json(bid);
    } catch (error) {
      console.error('Update bid status error:', error);
      res.status(500).json({ message: "Failed to update bid status" });
    }
  });

  // Chef routes
  app.get("/api/chefs", authenticateToken, async (req, res) => {
    try {
      const { search, sort, location, available, cuisines, minRate, maxRate } = req.query;
      
      // Get all chef users from PostgreSQL
      const allUsers = await simpleStorage.getAllChefs();
      let chefs = allUsers;
      
      console.log('Initial chefs count:', chefs.length);
      console.log('Query params:', { search, sort, location, available, cuisines, minRate, maxRate });
      
      // Apply search filter
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        chefs = chefs.filter(chef => 
          chef.name.toLowerCase().includes(searchTerm) ||
          (chef.bio && chef.bio.toLowerCase().includes(searchTerm)) ||
          (chef.specialties && chef.specialties.some((s: string) => s.toLowerCase().includes(searchTerm)))
        );
      }

      // Apply location filter
      if (location) {
        const locationTerm = (location as string).toLowerCase();
        chefs = chefs.filter(chef => 
          chef.location && chef.location.toLowerCase().includes(locationTerm)
        );
      }

      // Apply cuisine filter
      if (cuisines) {
        const selectedCuisines = (cuisines as string).split(',');
        chefs = chefs.filter(chef => 
          chef.specialties && chef.specialties.some((s: string) => selectedCuisines.includes(s))
        );
      }

      // Apply budget filter
      if (minRate || maxRate) {
        const min = minRate ? parseInt(minRate as string) : 0;
        const max = maxRate ? parseInt(maxRate as string) : 1000;
        chefs = chefs.filter(chef => {
          if (!chef.hourlyRate) return true; // Include if no rate specified
          // Handle string rates like "75-150"
          const rateStr = chef.hourlyRate.toString();
          const rateMatch = rateStr.match(/(\d+)/);
          if (rateMatch) {
            const rate = parseInt(rateMatch[1]);
            return rate >= min && rate <= max;
          }
          return true;
        });
      }

      // Apply availability filter
      if (available === 'true') {
        chefs = chefs.filter(chef => chef.availableNow === true);
      }

      // Apply sort
      switch (sort) {
        case 'rating':
          chefs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'price_low':
          chefs.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
          break;
        case 'price_high':
          chefs.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
          break;
        case 'experience':
          chefs.sort((a, b) => (b.experience || 0) - (a.experience || 0));
          break;
        case 'name':
          chefs.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          // Featured chefs first, then by rating
          chefs.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.rating || 0) - (a.rating || 0);
          });
      }

      // Remove password field for security
      const safeChefs = chefs.map(chef => ({ ...chef, password: undefined }));
      
      res.json(safeChefs);
    } catch (error) {
      console.error("Failed to get chefs:", error);
      res.status(500).json({ message: "Failed to get chefs" });
    }
  });

  app.get("/api/chefs/:id", authenticateToken, async (req, res) => {
    try {
      const chefId = parseInt(req.params.id);
      const chef = await simpleStorage.getUser(chefId);
      
      if (!chef || chef.role !== 'chef') {
        return res.status(404).json({ message: "Chef not found" });
      }

      // Remove password field for security
      const safeChef = { ...chef, password: undefined };
      res.json(safeChef);
    } catch (error) {
      console.error("Failed to get chef:", error);
      res.status(500).json({ message: "Failed to get chef" });
    }
  });

  // Message routes
  // Get all messages for current user
  app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const messages = await storage.getMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.get("/api/messages/:userId", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(
        req.user!.id,
        parseInt(req.params.userId)
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });
      const message = await storage.createMessage(messageData);
      
      // Send real-time message to receiver if connected
      if (wss) {
        const receiverWs = clients.get(messageData.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Mark message as read
  app.put("/api/messages/:id/read", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Get conversations for user
  app.get("/api/conversations", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { type } = req.query;
      
      if (type === 'sent') {
        // Get conversations where user is the sender
        const conversations = await storage.getSentConversationsForUser(userId);
        res.json(conversations);
      } else {
        // Get regular conversations (inbox)
        const conversations = await storage.getConversationsForUser(userId);
        res.json(conversations);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Mark conversation as read
  app.put("/api/messages/mark-read/:userId", authenticateToken, async (req, res) => {
    try {
      const currentUserId = req.user!.id;
      const otherUserId = parseInt(req.params.userId);
      
      await storage.markConversationAsRead(currentUserId, otherUserId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark conversation as read" });
    }
  });

  // Toggle message star
  app.put("/api/messages/:id/star", authenticateToken, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.toggleMessageStar(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle star" });
    }
  });

  // Chef Availability Routes
  app.get("/api/chef-availability/:chefId", authenticateToken, async (req, res) => {
    try {
      const chefId = parseInt(req.params.chefId);
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      
      const availability = await storage.getChefAvailability(chefId, start as string, end as string);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post("/api/chef-availability", authenticateToken, async (req, res) => {
    try {
      const { chefId, date, isAvailable, notes } = req.body;
      
      const availability = await storage.createOrUpdateAvailability({
        chefId,
        date: new Date(date),
        isAvailable,
        isBooked: false,
        notes,
      });
      
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  // Payment Routes
  app.get("/api/payments", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const payments = await storage.getPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", authenticateToken, async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Payment Methods Routes
  app.get("/api/payment-methods", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const paymentMethods = await storage.getPaymentMethodsByUserId(userId);
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", authenticateToken, async (req, res) => {
    try {
      const { paymentType, accountIdentifier } = req.body;
      const userId = req.user!.id;
      
      // Validate input
      if (!paymentType || !accountIdentifier) {
        return res.status(400).json({ message: "Payment type and account identifier are required" });
      }
      
      // Validate payment type
      const validTypes = ['Venmo', 'CashApp', 'Zelle', 'PayPal'];
      if (!validTypes.includes(paymentType)) {
        return res.status(400).json({ message: "Invalid payment type" });
      }
      
      const paymentMethod = await storage.createPaymentMethod({
        userId,
        paymentType,
        accountIdentifier,
        isDefault: false,
      });
      
      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ message: "Failed to add payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", authenticateToken, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      await storage.removePaymentMethod(paymentMethodId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove payment method" });
    }
  });

  // Withdrawals (for chefs)
  app.post("/api/withdrawals", authenticateToken, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user!.id;
      
      // In real implementation, this would process the withdrawal
      // For now, just return success
      res.json({ 
        success: true, 
        message: `Withdrawal of $${amount} has been requested and will be processed within 2-3 business days.` 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to request withdrawal" });
    }
  });

  // Chef Profile routes
  app.get("/api/chef-profile/:id", authenticateToken, async (req: any, res) => {
    try {
      const chefId = parseInt(req.params.id);
      const chef = await simpleStorage.getUser(chefId);
      
      if (!chef || chef.role !== 'chef') {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      // Remove password field for security
      const safeChef = { ...chef, password: undefined };
      res.json(safeChef);
    } catch (error) {
      console.error("Failed to get chef profile:", error);
      res.status(500).json({ message: "Failed to get chef profile" });
    }
  });

  app.put("/api/chef-profile/:id", authenticateToken, async (req: any, res) => {
    try {
      console.log("=== CHEF PROFILE UPDATE DEBUG ===");
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      
      const chefId = parseInt(req.params.id);
      
      // Ensure user can only update their own profile
      if (req.user.id !== chefId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }

      // Sanitize the request body to handle potential date/timestamp issues
      const sanitizedData = { ...req.body };
      
      // Remove any fields that should not be updated directly - CRITICAL for timestamp error
      delete sanitizedData.id;
      delete sanitizedData.password;
      delete sanitizedData.createdAt; // This is the timestamp causing the error!
      delete sanitizedData.emailVerificationToken;
      
      // Also remove any other potential timestamp fields that shouldn't be updated
      delete sanitizedData.updatedAt;
      delete sanitizedData.lastLogin;
      
      console.log("After removing system fields:", JSON.stringify(sanitizedData, null, 2));
      
      // Ensure arrays are properly formatted
      const arrayFields = [
        'customTravelAreas', 'languagesSpoken', 'specialties', 'signatureDishes', 
        'dietaryAccommodations', 'foodSafetyCertifications', 'portfolioImages', 
        'clientTestimonials', 'availableServices', 'equipmentList', 'customPackages'
      ];
      
      arrayFields.forEach(field => {
        if (sanitizedData[field] && !Array.isArray(sanitizedData[field])) {
          sanitizedData[field] = [];
        }
      });
      
      // Ensure numeric fields are properly formatted
      if (sanitizedData.maxTravelDistance) {
        sanitizedData.maxTravelDistance = parseInt(sanitizedData.maxTravelDistance) || null;
      }
      if (sanitizedData.experience) {
        sanitizedData.experience = parseInt(sanitizedData.experience) || null;
      }
      if (sanitizedData.maxPartySize) {
        sanitizedData.maxPartySize = parseInt(sanitizedData.maxPartySize) || null;
      }
      if (sanitizedData.hourlyRate) {
        sanitizedData.hourlyRate = parseFloat(sanitizedData.hourlyRate) || null;
      }
      
      // Ensure boolean fields are properly formatted
      const booleanFields = [
        'willingToTravel', 'lastMinuteBookings', 'bringsOwnEquipment', 
        'canProvideStaff', 'profileLive', 'featured', 'availableNow', 'emailVerified'
      ];
      
      booleanFields.forEach(field => {
        if (sanitizedData[field] !== undefined) {
          sanitizedData[field] = Boolean(sanitizedData[field]);
        }
      });
      
      // Check for any fields that might contain invalid date values - only check actual timestamp fields
      Object.keys(sanitizedData).forEach(key => {
        const value = sanitizedData[key];
        if (value !== null && value !== undefined) {
          // Only validate fields that are actually supposed to be timestamps
          const timestampFields = ['createdAt', 'updatedAt', 'lastLogin', 'eventDate', 'completedAt'];
          if (timestampFields.includes(key) && typeof value === 'string') {
            console.log(`WARNING: Timestamp field ${key} contains: ${value}`);
            // Try to parse and validate actual timestamp fields
            try {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                console.log(`ERROR: Timestamp field ${key} contains invalid date, removing it`);
                delete sanitizedData[key];
              }
            } catch (e) {
              console.log(`ERROR: Timestamp field ${key} failed date parsing, removing it`);
              delete sanitizedData[key];
            }
          }
        }
      });
      
      console.log("Final sanitized data for database:", JSON.stringify(sanitizedData, null, 2));

      const updatedChef = await storage.updateUser(chefId, sanitizedData);
      
      if (!updatedChef) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      // Remove password field for security
      const safeChef = { ...updatedChef, password: undefined };
      res.json(safeChef);
    } catch (error) {
      console.error("Failed to update chef profile:", error);
      res.status(500).json({ message: "Failed to update chef profile" });
    }
  });

  app.put("/api/chef-profile/:id/launch", authenticateToken, async (req: any, res) => {
    try {
      const chefId = parseInt(req.params.id);
      
      // Ensure user can only update their own profile
      if (req.user.id !== chefId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }

      const { profileLive } = req.body;
      const updatedChef = await simpleStorage.updateUser(chefId, { profileLive });
      
      if (!updatedChef) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      res.json({ profileLive: updatedChef.profileLive });
    } catch (error) {
      console.error("Failed to update profile status:", error);
      res.status(500).json({ message: "Failed to update profile status" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;
      const notifications = await storage.getNotificationsByUserId(req.user.id, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Failed to get notifications:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.post("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Failed to create notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/mark-as-read/:id", authenticateToken, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationAsRead(parseInt(req.params.id));
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-as-read", authenticateToken, async (req: any, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Demo data routes (development only)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/demo/seed", async (req, res) => {
      try {
        const { seedDemoData } = await import('./seed-demo-data');
        const result = await seedDemoData();
        res.json(result);
      } catch (error) {
        console.error("Failed to seed demo data:", error);
        res.status(500).json({ message: "Failed to seed demo data" });
      }
    });

    app.delete("/api/demo/clear", async (req, res) => {
      try {
        const { clearDemoData } = await import('./seed-demo-data');
        const result = await clearDemoData();
        res.json(result);
      } catch (error) {
        console.error("Failed to clear demo data:", error);
        res.status(500).json({ message: "Failed to clear demo data" });
      }
    });
  }

  // Event Moderation Routes (GET for email links)
  app.get("/api/events/approve/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Update event status to approved
      const event = await storage.updateEvent(eventId, { status: 'approved' });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get host information for email
      const host = await storage.getUser(event.hostId);
      if (host) {
        try {
          const { sendEventApprovalEmail } = await import('./moderation');
          await sendEventApprovalEmail(host.email, event.title);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }
      
      // Return simple success page instead of redirect
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Event Approved</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success { color: #059669; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #1e293b; margin-bottom: 10px; }
            p { color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Event Approved Successfully</h1>
            <p><strong>"${event.title}"</strong> has been approved and is now live on ChefBounty.</p>
            <p>The host has been notified via email.</p>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Event approval error:', error);
      res.status(500).json({ message: "Failed to approve event" });
    }
  });

  app.get("/api/events/reject/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Update event status to rejected
      const event = await storage.updateEvent(eventId, { status: 'rejected' });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get host information for email
      const host = await storage.getUser(event.hostId);
      if (host) {
        try {
          const { sendEventRejectionEmail } = await import('./moderation');
          await sendEventRejectionEmail(host.email, event.title);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
      }
      
      // Return simple success page instead of redirect
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Event Rejected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .warning { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #1e293b; margin-bottom: 10px; }
            p { color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">❌</div>
            <h1>Event Rejected</h1>
            <p><strong>"${event.title}"</strong> has been rejected and will not appear on ChefBounty.</p>
            <p>The host has been notified via email with feedback.</p>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Event rejection error:', error);
      res.status(500).json({ message: "Failed to reject event" });
    }
  });

  // Event Moderation Routes (POST for admin dashboard)
  app.post("/api/events/approve/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Update event status to approved
      const event = await storage.updateEvent(eventId, { status: 'approved' });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get host information for email
      const host = await storage.getUser(event.hostId);
      if (host) {
        try {
          const { sendEventApprovalEmail } = await import('./moderation');
          await sendEventApprovalEmail(host.email, event.title);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }
      
      res.json({ 
        message: "Event approved successfully", 
        event
      });
    } catch (error) {
      console.error('Event approval error:', error);
      res.status(500).json({ message: "Failed to approve event" });
    }
  });

  app.post("/api/events/reject/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Update event status to rejected
      const event = await storage.updateEvent(eventId, { status: 'rejected' });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Get host information for email
      const host = await storage.getUser(event.hostId);
      if (host) {
        try {
          const { sendEventRejectionEmail } = await import('./moderation');
          await sendEventRejectionEmail(host.email, event.title);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
      }
      
      res.json({ 
        message: "Event rejected successfully", 
        event
      });
    } catch (error) {
      console.error('Event rejection error:', error);
      res.status(500).json({ message: "Failed to reject event" });
    }
  });

  // Admin routes for pending events
  app.get("/api/admin/pending-events", async (req, res) => {
    try {
      const pendingEvents = await storage.getEventsByStatus('pending');
      res.json(pendingEvents);
    } catch (error) {
      console.error('Failed to get pending events:', error);
      res.status(500).json({ message: "Failed to get pending events" });
    }
  });

  return httpServer;
}
