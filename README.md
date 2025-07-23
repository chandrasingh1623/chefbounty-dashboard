# ChefBounty Dashboard

A comprehensive marketplace platform connecting hosts with professional chefs for events. Built with React, TypeScript, Express.js, and PostgreSQL.

## 🌟 Features

### For Hosts
- **Event Management**: Create, edit, and manage dining events
- **Bid Management**: Review and accept chef proposals
- **Real-time Messaging**: Communicate directly with chefs
- **Payment Processing**: Handle invoices and payments
- **Calendar Integration**: Manage event scheduling

### For Chefs
- **Profile Management**: Comprehensive chef profiles with portfolios
- **Event Discovery**: Browse available events with detailed requirements
- **Bid Submission**: Submit competitive proposals
- **Messaging System**: Direct communication with hosts
- **Earnings Dashboard**: Track payments and performance

### Admin Features
- **Event Moderation**: Review and approve events before publication
- **Quality Control**: Ensure platform standards and safety
- **Email Notifications**: Automated approval/rejection workflows
- **User Management**: Oversee platform activity

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Wouter routing
- **UI Components**: Radix UI, shadcn/ui, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: WebSocket for messaging
- **Email**: Resend service integration
- **Build**: Vite with hot module replacement

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chandra-bnc/chefbounty-dashboard.git
   cd chefbounty-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗂️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface layer
│   ├── moderation.ts      # Event moderation system
│   └── email.ts           # Email service integration
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema definitions
└── docs/                  # Project documentation
```

## 🎯 Key Features Implemented

### Event Management System
- Complete CRUD operations for events
- Rich event details with cuisine preferences
- Guest count and duration tracking
- Dietary requirements and service styles
- Image upload and gallery management

### Enhanced Bidding System
- Chef privacy protection (masked names until acceptance)
- Detailed chef qualifications display
- Automated bid acceptance workflow
- Real-time notifications

### Comprehensive Authentication
- JWT-based secure authentication
- Email verification system
- Role-based access control (Host/Chef/Admin)
- Password reset functionality

### Admin Moderation
- Event approval/rejection workflow
- Automated email notifications
- Quality assurance processes
- Platform standards enforcement

### Real-time Communication
- WebSocket-powered messaging
- Conversation management
- Message threading by event
- Read/unread status tracking

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Apply database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Host/Chef profiles with authentication
- **Events**: Dining events with detailed requirements
- **Bids**: Chef proposals for events
- **Messages**: Real-time communication system
- **Notifications**: System notifications and alerts

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `RESEND_API_KEY` | Email service API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🚀 Deployment

The application is designed for deployment on platforms like:
- Replit (current hosting)
- Vercel/Netlify (frontend) + Railway/Render (backend)
- Docker containers
- Traditional VPS hosting

## 📧 Email Configuration

Emails are sent from `noreply@chefbounty.com` using Resend service:
- Event moderation notifications
- User verification emails
- Bid acceptance confirmations
- System notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📱 Demo Data

The application includes realistic demo data:
- 13+ sample events with authentic details
- Multiple chef profiles with portfolios
- Sample bids and conversations
- Complete event lifecycle examples

## 🔍 API Documentation

See `API_DOCUMENTATION.md` for detailed API endpoint documentation.

## 📋 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support or questions, please contact the development team.

---

Built with ❤️ for the culinary community