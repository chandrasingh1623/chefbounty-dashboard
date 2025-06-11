import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: { ...user, password: undefined }, token });
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

  // Resend verification email
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // TODO: Send verification email here (placeholder for actual email service)
      console.log(`Resend verification email would be sent to: ${email}`);

      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
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

  app.post("/api/events", authenticateToken, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        hostId: req.user.id,
      });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
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

  app.post("/api/bids", authenticateToken, async (req, res) => {
    try {
      const bidData = insertBidSchema.parse({
        ...req.body,
        chefId: req.user.id,
      });
      const bid = await storage.createBid(bidData);
      res.json(bid);
    } catch (error) {
      res.status(400).json({ message: "Invalid bid data" });
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
      
      // Get all chef users
      const allUsers = await storage.getUsers();
      let chefs = allUsers.filter(user => user.role === 'chef');
      
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
  app.get("/api/messages/:userId", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessagesBetweenUsers(
        req.user.id,
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

  return httpServer;
}
