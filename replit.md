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

### Recent Changes (July 25, 2025)
- **Enhanced Chef Profile System**: Comprehensive rebuild with multi-section editing capabilities
  - Basic Info: Full name, location, travel preferences, languages spoken
  - Culinary Specialties: Primary cuisines, signature dishes, dietary accommodations
  - Credentials & Background: Formal training, food safety certifications, work history
  - Service Capabilities: Available services, party size limits, equipment, staff provision
  - Rates & Packages: Base rates, additional fees, custom packages
- **Profile Launch System**: Modal confirmation dialog for making profiles public to hosts
- **Database Schema Enhancement**: Expanded users table with 20+ new profile fields
- **Backend API Integration**: Complete CRUD operations for chef profile management
- **Multi-select UI**: Interactive selection for cuisines, languages, services, and certifications
- **Profile Status Control**: Live/draft toggle with visual indicators and authorization controls
- **Comprehensive Dashboard Enhancements**: Complete implementation of advanced dashboard features
- **Calendar Integration**: Chef availability management with interactive calendar for booking slots
- **Real-time Messaging**: Full message center with conversation management and real-time chat
- **Payment Processing**: Complete payment dashboard with invoices, payment methods, and withdrawals
- **Enhanced Event Creation**: Structured event forms with detailed cuisine, chef, venue, and style preferences
- **Database Schema Expansion**: Added chef availability, payments, and payment methods tables
- **UI/UX Improvements**: Premium styling with collapsible sections and intuitive user flows
- **Role-based Features**: Distinct functionality for chef and host user roles

### Previous Updates (July 23, 2025)
- **Email Verification System**: Complete implementation using Resend service
- **Professional Email Templates**: Branded HTML emails with ChefBounty styling
- **Security Enhancement**: JWT-based email verification with 24-hour expiration
- **User Experience**: Interactive verification UI with resend functionality
- **Email Configuration**: All emails sending from noreply@chefbounty.com
- **Database Schema**: Added emailVerified and emailVerificationToken fields
- **Authentication Flow**: Users must verify email before dashboard access

The application now features a comprehensive dashboard system with calendar integration, real-time messaging, payment processing, and enhanced event management, following a modern full-stack architecture with clear separation between client and server concerns, type safety throughout, and a focus on premium user experience.