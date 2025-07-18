# ChefBounty Dashboard Application

## Overview

ChefBounty is a marketplace platform connecting hosts who need chefs for events with professional chefs looking for opportunities. The application features a full-stack architecture with a React frontend dashboard and Express.js backend API, using PostgreSQL for data persistence and real-time messaging capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite with hot module replacement in development

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time**: WebSocket server for live messaging
- **Database Provider**: Neon serverless PostgreSQL

### Design System
- **Component Library**: shadcn/ui with "new-york" style variant
- **Theme**: Light mode with CSS custom properties
- **Primary Color**: #0a51be (premium blue theme)
- **Typography**: Neutral base color scheme
- **Responsive**: Mobile-first design approach

## Key Components

### Authentication System
- JWT token-based authentication stored in localStorage
- Role-based access control (host/chef roles)
- Custom auth service mimicking Supabase-like API
- Password hashing with bcrypt
- Protected routes with middleware

### Dashboard Layout
- Sidebar navigation with role-specific menu items
- Top header with user context and quick actions
- Main content area with conditional rendering based on user role
- Responsive design with mobile considerations

### User Roles & Permissions
**Host Users:**
- Dashboard Overview
- Post New Event
- My Events management
- View and manage bids
- Messaging system

**Chef Users:**
- Dashboard Overview
- Profile management
- Browse available events
- Submit and track bids
- Messaging system

### Real-time Features
- WebSocket server for instant messaging
- Live bid notifications
- Real-time dashboard updates

## Data Flow

### Authentication Flow
1. User submits login/registration form
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage and used for API requests
4. Auth context provides user state throughout the application

### Event Management Flow
1. Host creates event through dashboard form
2. Event stored in PostgreSQL database
3. Chefs browse available events
4. Chefs submit bids with pricing and messages
5. Host reviews bids and accepts/rejects them
6. Real-time notifications sent via WebSocket

### Database Schema
- **Users**: id, email, password, role, name, profile data
- **Events**: id, hostId, title, description, date, location, budget
- **Bids**: id, eventId, chefId, amount, message, status
- **Messages**: id, senderId, receiverId, content, timestamps

## External Dependencies

### Core Framework Dependencies
- React 18 with TypeScript support
- Express.js with middleware ecosystem
- Drizzle ORM for type-safe database operations
- TanStack Query for server state management

### UI & Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- React Hook Form with Zod validation

### Database & Auth
- Neon serverless PostgreSQL
- bcrypt for password hashing
- jsonwebtoken for JWT implementation
- WebSocket (ws) for real-time communication

### Development Tools
- Vite for fast development and building
- TypeScript for type safety
- ESLint and Prettier for code quality
- Replit-specific development plugins

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild compiles TypeScript server to `dist/index.js`
- Database: Drizzle migrations manage schema changes

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- JWT secret configuration for token signing
- Production/development environment detection

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless)
- Static file serving for React build
- WebSocket support for real-time features

### Development Workflow
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production assets
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

### Recent Changes (July 30, 2025)
- **Complete Event Moderation System**: Comprehensive admin oversight and quality control
  - New event status workflow: pending → approved/rejected → open for bids
  - Admin dashboard with event review interface and moderation actions
  - Automated email notifications to administrators when new events require moderation
  - Professional email templates for approval/rejection notifications to hosts
  - Database schema updates with moderation status tracking
  - Public event filtering: only approved events visible in browse events
  - Enhanced event cards with proper status badges (Pending Approval, Approved, Rejected, etc.)
  - One-click approval/rejection with automatic email notifications
  - Quality assurance process ensuring platform standards and chef safety
- **Fixed Email Verification Links**: Resolved 403 authentication errors in moderation emails
  - Added GET routes for email-based approve/reject actions without authentication
  - Updated redirect URLs to use dashboard.chefbounty.com instead of local frontend
  - Email links now properly update event status and send host notifications
  - Eliminates 404 frontend routing issues by bypassing local router entirely
  - Maintained POST routes for authenticated admin dashboard actions
- **Enhanced Host Event Management**: Complete edit and delete functionality
  - Edit button loads existing event data into form for modification
  - Delete button removes events with proper ownership validation
  - Added PUT route for event updates with security checks
  - Updated EnhancedEventForm to support both create and edit modes

### Previous Changes (July 29, 2025)
- **Chef Privacy Protection System**: Complete implementation to prevent platform bypass
  - Masked chef names in FirstInitial***LastInitial format (e.g., "Keeana Gondy" → "K***y") for pending bids
  - Full name reveal only after bid acceptance with security messaging
  - Updated search functionality to work with both actual and masked names
  - Enhanced BidCard components with conditional privacy rendering
- **Enhanced Chef Qualification Display**: Comprehensive bid UI improvements
  - Cuisine specialization tags with stylized pill badges
  - Experience summary with chef hat icons
  - Travel radius information with map pin icons
  - Service capacity display (max party size) with user icons
  - Certification badges for food safety credentials
  - Formal training display with award icons
  - Updated storage layer to include all chef qualification fields
- **Complete Bid Acceptance Flow**: Automated post-acceptance workflow
  - Confirmation modal with bid summary and privacy notices
  - Automated system messaging to both chef and host
  - Event status updates from "open" to "in_progress"
  - Automatic rejection of other pending bids
  - Role-based dashboard notifications
  - Security banners enforcing in-app communication only

### Previous Updates (July 25, 2025)
- **Enhanced Chef Profile System**: Comprehensive rebuild with multi-section editing capabilities
- **Calendar Integration**: Chef availability management with interactive calendar for booking slots
- **Real-time Messaging**: Full message center with conversation management and real-time chat
- **Payment Processing**: Complete payment dashboard with invoices, payment methods, and withdrawals
- **Enhanced Event Creation**: Structured event forms with detailed cuisine, chef, venue, and style preferences

### Previous Updates (July 23, 2025)
- **Email Verification System**: Complete implementation using Resend service
- **Professional Email Templates**: Branded HTML emails with ChefBounty styling
- **Security Enhancement**: JWT-based email verification with 24-hour expiration
- **User Experience**: Interactive verification UI with resend functionality
- **Email Configuration**: All emails sending from noreply@chefbounty.com
- **Database Schema**: Added emailVerified and emailVerificationToken fields
- **Authentication Flow**: Users must verify email before dashboard access

The application now features a comprehensive dashboard system with calendar integration, real-time messaging, payment processing, and enhanced event management, following a modern full-stack architecture with clear separation between client and server concerns, type safety throughout, and a focus on premium user experience.