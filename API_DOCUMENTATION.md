# ChefBounty Dashboard API Documentation

## Overview
Complete REST API for the ChefBounty marketplace platform connecting hosts who need chefs for events with professional chefs looking for opportunities.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe", 
  "role": "host" | "chef"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "host",
    "profilePhoto": null,
    "bio": null,
    "location": null,
    "specialties": null,
    "hourlyRate": null,
    "rating": null,
    "createdAt": "2025-07-23T16:20:29.187Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### User Management

#### GET /user/profile
Get current user profile (Protected).

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "host",
  "profilePhoto": "https://example.com/photo.jpg",
  "bio": "Experienced event host",
  "location": "New York, NY",
  "specialties": ["Italian", "French"],
  "hourlyRate": "75.00",
  "rating": "4.8",
  "createdAt": "2025-07-23T16:20:29.187Z"
}
```

#### PUT /user/profile
Update user profile (Protected).

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "location": "Los Angeles, CA",
  "specialties": ["Italian", "French", "Mexican"],
  "hourlyRate": "85.00"
}
```

### Events Management

#### GET /events
Get all available events (Protected).

**Response:**
```json
[
  {
    "id": 1,
    "hostId": 1,
    "title": "Corporate Dinner Event",
    "description": "Need chef for corporate dinner",
    "cuisineType": "Italian",
    "eventDate": "2025-08-15T18:00:00.000Z",
    "duration": 4,
    "location": "New York, NY",
    "budget": "500.00",
    "venueType": "indoor",
    "eventImage": "https://example.com/event.jpg",
    "status": "open",
    "createdAt": "2025-07-23T16:30:00.000Z"
  }
]
```

#### GET /events/:id
Get specific event details (Protected).

#### POST /events
Create new event (Protected - Host only).

**Request Body:**
```json
{
  "title": "Wedding Reception",
  "description": "Need chef for 100-person wedding",
  "cuisineType": "French",
  "eventDate": "2025-09-15T17:00:00.000Z",
  "duration": 6,
  "location": "San Francisco, CA",
  "budget": "1200.00",
  "venueType": "outdoor"
}
```

#### GET /user/events
Get current user's events (Protected).

#### GET /events/:id/bids
Get all bids for an event (Protected).

### Bids Management

#### GET /bids/user
Get current user's bids (Protected).

#### POST /bids
Submit bid for an event (Protected - Chef only).

**Request Body:**
```json
{
  "eventId": 1,
  "amount": "450.00",
  "message": "I have 10 years experience with Italian cuisine..."
}
```

#### PUT /bids/:id/status
Update bid status (Protected - Host only).

**Request Body:**
```json
{
  "status": "accepted" | "rejected"
}
```

### Messaging

#### GET /messages
Get user's messages (Protected).

#### POST /messages
Send message (Protected).

**Request Body:**
```json
{
  "receiverId": 2,
  "eventId": 1,
  "content": "Hi, I'm interested in your event..."
}
```

#### PUT /messages/:id/read
Mark message as read (Protected).

### WebSocket Events

Connect to WebSocket at `/ws?userId={userId}` for real-time features:

**Events:**
- `new_bid`: New bid received
- `bid_status_changed`: Bid accepted/rejected
- `new_message`: New message received
- `user_online`: User came online
- `user_offline`: User went offline

## Error Responses

All endpoints return consistent error format:
```json
{
  "message": "Error description",
  "error": "Detailed error info (in development)"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Data Models

### User
```typescript
interface User {
  id: number;
  email: string;
  password: string; // hashed
  role: 'host' | 'chef';
  name: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  hourlyRate?: string;
  rating?: string;
  createdAt: Date;
}
```

### Event
```typescript
interface Event {
  id: number;
  hostId: number;
  title: string;
  description: string;
  cuisineType: string;
  eventDate: Date;
  duration: number; // hours
  location: string;
  budget: string;
  venueType: 'indoor' | 'outdoor';
  eventImage?: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: Date;
}
```

### Bid
```typescript
interface Bid {
  id: number;
  eventId: number;
  chefId: number;
  amount: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
```

### Message
```typescript
interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  eventId?: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- WebSocket: 50 connections per user

## Security Features
- JWT token authentication
- Password hashing with bcrypt
- Input validation with Zod schemas
- SQL injection protection via Drizzle ORM
- CORS configuration for production

## Mobile App Integration Notes

### Recommended Architecture
1. **State Management**: Use React Query/TanStack Query for server state
2. **Navigation**: React Navigation for mobile routing
3. **Authentication**: Store JWT in secure storage (Keychain/Keystore)
4. **Real-time**: WebSocket connection for live updates
5. **Offline Support**: Cache critical data locally

### Key Mobile Considerations
- Implement pull-to-refresh on lists
- Use infinite scrolling for events/bids
- Add push notifications for new bids/messages
- Implement image upload for profile photos and event images
- Add location services for automatic location detection
- Consider implementing biometric authentication

### Suggested Mobile App Structure
```
/src
  /screens
    /auth
      - LoginScreen.tsx
      - RegisterScreen.tsx
    /host
      - HostDashboard.tsx
      - CreateEvent.tsx
      - ManageEvents.tsx
      - ViewBids.tsx
    /chef
      - ChefDashboard.tsx
      - BrowseEvents.tsx
      - MyBids.tsx
      - ProfileSetup.tsx
    /shared
      - Messages.tsx
      - Settings.tsx
      - Payments.tsx
  /components
    - EventCard.tsx
    - BidCard.tsx
    - MessageBubble.tsx
  /services
    - api.ts
    - websocket.ts
    - auth.ts
  /hooks
    - useAuth.ts
    - useEvents.ts
    - useBids.ts
```