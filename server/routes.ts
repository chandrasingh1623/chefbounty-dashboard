import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "./email";

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

  // WebSocket setup for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocket>();

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

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and generate email verification token
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const emailVerificationToken = EmailService.generateVerificationToken(0, userData.email);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken,
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

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email address before signing in. Check your inbox for the verification link.",
          needsEmailVerification: true
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
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
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Generate password reset token (reuse verification token logic)
      const resetToken = EmailService.generateVerificationToken(user.id, email);
      
      // Update user with reset token
      await storage.updateUser(user.id, { emailVerificationToken: resetToken });

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
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });

  app.get("/api/events/:id", authenticateToken, async (req, res) => {
    try {
      const event = await storage.getEventById(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to get event" });
    }
  });

  app.get("/api/events/host/:hostId", authenticateToken, async (req, res) => {
    try {
      const events = await storage.getEventsByHostId(parseInt(req.params.hostId));
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get host events" });
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
      });
      
      console.log('POST /api/events - Parsed event data:', JSON.stringify(eventData, null, 2));
      
      const event = await storage.createEvent(eventData);
      console.log('POST /api/events - Created event:', JSON.stringify(event, null, 2));
      
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

  app.put("/api/bids/:id/status", authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      const bid = await storage.updateBidStatus(parseInt(req.params.id), status);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      res.json(bid);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bid status" });
    }
  });

  // Chef routes
  app.get("/api/chefs", authenticateToken, async (req, res) => {
    try {
      const { search, sort, location, available, cuisines, minRate, maxRate } = req.query;
      
      // Get all chef users who have launched their profiles
      const allUsers = await storage.getUsers();
      let chefs = allUsers.filter(user => user.role === 'chef' && user.profileLive === true);
      
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
        chefs = chefs.filter(chef => 
          chef.hourlyRate && chef.hourlyRate >= min && chef.hourlyRate <= max
        );
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
      const chef = await storage.getUser(chefId);
      
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
      const receiverWs = clients.get(messageData.receiverId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(JSON.stringify({
          type: 'new_message',
          message
        }));
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
      const conversations = await storage.getConversationsForUser(userId);
      res.json(conversations);
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
      const { cardNumber, expiryMonth, expiryYear, cvc } = req.body;
      const userId = req.user!.id;
      
      // In real implementation, this would integrate with Stripe
      const paymentMethod = await storage.createPaymentMethod({
        userId,
        stripePaymentMethodId: `pm_${Date.now()}`, // Mock Stripe ID
        cardBrand: "visa", // Would be determined by Stripe
        cardLast4: cardNumber.slice(-4),
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
      const chef = await storage.getUser(chefId);
      
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
      const updatedChef = await storage.updateUser(chefId, { profileLive });
      
      if (!updatedChef) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      res.json({ profileLive: updatedChef.profileLive });
    } catch (error) {
      console.error("Failed to update profile status:", error);
      res.status(500).json({ message: "Failed to update profile status" });
    }
  });

  return httpServer;
}
