# ChefBounty Dashboard - Complete Functionality Breakdown

## Application Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite with HMR

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: WebSocket server for messaging
- **Validation**: Zod schemas for type safety

## Core Features by User Role

### Host Features (Event Organizers)

#### 1. Dashboard Overview
**File**: `client/src/pages/dashboard.tsx`
- Recent events summary
- Pending bids counter
- Quick statistics
- Revenue overview
- Upcoming events timeline

**API Endpoints Used**:
- `GET /api/events/host/:id` - Host's events
- `GET /api/bids/recent` - Recent bids

#### 2. Post New Event
**File**: `client/src/pages/post-event.tsx`
- Event details form (title, description, date, duration)
- Cuisine type selection
- Budget specification
- Venue type (indoor/outdoor)
- Location input
- Event image upload

**API Endpoints**:
- `POST /api/events` - Create event

**Form Validation**:
```typescript
const eventSchema = insertEventSchema.extend({
  eventDate: z.string().min(1, "Event date is required"),
  budget: z.number().min(1, "Budget must be greater than 0"),
});
```

#### 3. Manage Events
**File**: `client/src/pages/my-events.tsx`
- View all posted events
- Edit event details
- Change event status (open/closed)
- View applications per event
- Event performance metrics

**API Endpoints**:
- `GET /api/user/events` - User's events
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

#### 4. View & Manage Bids
**File**: `client/src/pages/bids.tsx`
- List all bids by event
- Chef profile preview
- Bid amount and message
- Accept/reject bid actions
- Compare multiple bids

**API Endpoints**:
- `GET /api/events/:id/bids` - Event bids
- `PUT /api/bids/:id/status` - Update bid status

### Chef Features (Service Providers)

#### 1. Chef Dashboard
**File**: `client/src/pages/dashboard.tsx` (conditional rendering)
- Available events feed
- Active bids status
- Earnings overview
- Profile completion status
- Recent messages

**API Endpoints**:
- `GET /api/events` - Available events
- `GET /api/bids/user` - Chef's bids
- `GET /api/user/profile` - Profile data

#### 2. Profile Management
**File**: `client/src/pages/profile.tsx`
- Personal information
- Professional bio
- Cuisine specialties
- Hourly rate setting
- Portfolio images
- Location settings

**API Endpoints**:
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

**Profile Schema**:
```typescript
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  hourlyRate: z.number().optional(),
  specialties: z.string().optional(),
});
```

#### 3. Browse Events
**File**: `client/src/pages/browse-events.tsx`
- Event search and filtering
- Cuisine type filter
- Location-based filtering
- Budget range filter
- Date range selection
- Event details modal

**Features**:
- Search by keywords
- Filter by cuisine type
- Filter by location
- Sort by date/budget
- Infinite scroll loading

#### 4. Submit & Track Bids
**File**: `client/src/pages/my-bids.tsx`
- Bid submission form
- Bid history tracking
- Status updates (pending/accepted/rejected)
- Bid analytics
- Resubmission capability

**API Endpoints**:
- `POST /api/bids` - Submit bid
- `GET /api/bids/user` - User's bids
- `PUT /api/bids/:id` - Update bid

## Shared Features

### 1. Real-time Messaging
**File**: `client/src/pages/messages.tsx`
- Direct messaging between hosts and chefs
- Event-specific conversations
- Real-time message delivery
- Message read status
- File attachment support

**WebSocket Implementation**:
```typescript
// Connection
const socket = new WebSocket(`ws://localhost:5000/ws?userId=${userId}`);

// Message events
socket.on('new_message', (message) => {
  // Handle incoming message
});

socket.on('message_read', (messageId) => {
  // Update message status
});
```

**API Endpoints**:
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### 2. Payment System
**File**: `client/src/pages/payments.tsx`
- Payment history
- Invoice generation
- Payment method management
- Transaction tracking
- Dispute resolution

### 3. Settings & Preferences
**File**: `client/src/pages/settings.tsx`
- Account settings
- Notification preferences
- Privacy settings
- Data export
- Account deletion

## Technical Implementation Details

### Authentication Flow
**File**: `client/src/lib/auth.ts`

```typescript
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const { user, token } = await response.json();
      localStorage.setItem('token', token);
      return user;
    }
    throw new Error('Login failed');
  },

  async register(userData: RegisterData) {
    // Registration logic
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      return jwt.decode(token);
    }
    return null;
  }
};
```

### Database Schema
**File**: `shared/schema.ts`

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'host' | 'chef'
  name: text("name").notNull(),
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
  location: text("location"),
  specialties: text("specialties").array(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cuisineType: text("cuisine_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  duration: integer("duration").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  venueType: text("venue_type").notNull(),
  eventImage: text("event_image"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  chefId: integer("chef_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### API Route Handlers
**File**: `server/routes.ts`

Key implementation patterns:
- JWT middleware for authentication
- Zod validation for request bodies
- Error handling with try/catch
- Database transactions for data consistency
- WebSocket integration for real-time features

### Component Architecture
**File**: `client/src/components/dashboard/layout.tsx`

```typescript
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

## State Management Strategy

### TanStack Query Implementation
```typescript
// Query for events
export const useEvents = () => {
  return useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events'),
  });
};

// Mutation for creating events
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: InsertEvent) => 
      apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/events'] });
    },
  });
};
```

## Mobile App Development Recommendations

### State Synchronization
- Implement optimistic updates for better UX
- Use background sync for offline scenarios
- Cache critical data locally with AsyncStorage

### Performance Optimization
- Implement image lazy loading
- Use FlatList for large datasets
- Implement pull-to-refresh patterns
- Add loading skeletons

### Push Notifications
- New bid notifications for hosts
- Bid status updates for chefs
- New message alerts
- Event reminders

### Additional Mobile Features
- Camera integration for profile/event photos
- GPS location services
- Biometric authentication
- In-app payments with Stripe
- Calendar integration for events
- Map integration for event locations

This comprehensive breakdown provides the foundation for developing a React Native mobile app that mirrors the dashboard functionality while optimizing for mobile user experience.