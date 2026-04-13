# ChefBounty Dashboard

Full-stack marketplace dashboard connecting event hosts with professional chefs. Hosts post dining events, chefs submit competitive bids, and the platform handles messaging, payments, and moderation.

## Features

### For Hosts
- **Event Management** -- Create, edit, and manage dining events with cuisine preferences, guest counts, and dietary requirements
- **Bid Management** -- Review chef proposals with qualifications and accept the best fit
- **Real-time Messaging** -- WebSocket-powered direct messaging with chefs
- **Payment Processing** -- Invoice handling and payment tracking

### For Chefs
- **Profile & Portfolio** -- Comprehensive chef profiles with specialties and experience
- **Event Discovery** -- Browse available events with detailed requirements
- **Bid Submission** -- Submit competitive proposals for events
- **Earnings Dashboard** -- Track payments and performance metrics

### Admin
- **Event Moderation** -- Approve or reject events before publication
- **Email Notifications** -- Automated approval/rejection workflows via Resend
- **User Management** -- Role-based access control (Host / Chef / Admin)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| UI | Radix UI, shadcn/ui, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT + bcrypt, Passport.js (LinkedIn OAuth) |
| Real-time | WebSocket (ws) |
| Email | Resend |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/chandrasingh1623/chefbounty-dashboard.git
cd chefbounty-dashboard
npm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See `.env.example` for all required and optional variables.

### Database Setup

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:3001` by default.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
client/                  React frontend
  src/
    components/          Reusable UI components
    pages/               Application pages/routes
    hooks/               Custom React hooks
    lib/                 Utility functions
server/                  Express.js backend
  routes.ts              API route definitions
  storage.ts             Database interface layer
  moderation.ts          Event moderation system
  email.ts               Email service integration
  auth/                  OAuth and authentication
shared/                  Shared TypeScript types
  schema.ts              Database schema (Drizzle)
migrations/              SQL migration files
scripts/                 Database and deployment scripts
docs/                    Additional documentation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Apply database schema changes |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides covering Vercel, Render, Railway, and EC2.

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for endpoint reference.

## License

MIT
