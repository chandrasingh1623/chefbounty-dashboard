# ChefBounty Dashboard Deployment Guide

This guide covers deploying the ChefBounty Dashboard to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel + Railway

**Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist/public`
4. Add environment variables for API URL

**Backend (Railway)**
1. Connect repository to Railway
2. Set start command: `npm run start`
3. Add environment variables
4. Railway will provide PostgreSQL database

### Option 2: Full Stack on Render

1. **Create Web Service**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Start command: `npm run start`

2. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgresql_url
   JWT_SECRET=your_jwt_secret
   RESEND_API_KEY=your_resend_key
   ```

3. **Database**
   - Create PostgreSQL service on Render
   - Connect using provided DATABASE_URL

## 🗄️ Database Setup

### PostgreSQL Configuration

1. **Create Database**
   - Use Neon, Supabase, or any PostgreSQL provider
   - Ensure connection string includes SSL if required

2. **Apply Schema**
   ```bash
   npm run db:push
   ```

3. **Seed Demo Data (Optional)**
   ```bash
   npm run seed:demo
   ```

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?ssl=true` |
| `JWT_SECRET` | Secret for JWT signing | `your-super-secure-secret-key` |
| `RESEND_API_KEY` | Email service API key | `re_xxxxxxxxxx` |
| `NODE_ENV` | Environment | `production` |

## 🔧 Build Configuration

### Production Build
```bash
npm run build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### Build Scripts
```json
{
  "build": "npm run build:server && npm run build:client",
  "build:client": "vite build",
  "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:pg-native"
}
```

## 🌐 Domain & SSL

### Custom Domain Setup
1. **DNS Configuration**
   - Point your domain to your hosting provider
   - Set up CNAME or A records as required

2. **SSL Certificate**
   - Most platforms (Vercel, Render, Railway) provide automatic SSL
   - For custom setups, use Let's Encrypt or Cloudflare

3. **Email Domain**
   - Configure email sending from your domain
   - Update email templates with your domain
   - Set up SPF/DKIM records for deliverability

## 🔒 Security Considerations

### Production Security
1. **Environment Variables**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Restrict database access by IP

3. **API Security**
   - Rate limiting on endpoints
   - CORS configuration
   - Input validation and sanitization

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
```

## 📊 Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog

### Health Check Endpoint
The application includes a health check at `/health`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## 🚀 Performance Optimization

### Frontend Optimization
- Static asset caching (images, CSS, JS)
- CDN for global content delivery
- Image optimization and lazy loading
- Bundle size optimization

### Backend Optimization
- Database connection pooling
- Redis for session storage
- API response caching
- Background job processing

### Database Optimization
- Index optimization
- Query performance monitoring
- Connection pooling
- Read replicas for scaling

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancing across multiple instances
- Separate frontend and backend scaling
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Memory and CPU monitoring
- Disk space management

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test
      - name: Deploy to Platform
        # Add deployment steps
```

## 🛠️ Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check firewall/security group settings
   - Ensure SSL configuration

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

3. **Email Delivery Issues**
   - Verify RESEND_API_KEY
   - Check domain configuration
   - Review email logs and bounces

### Debug Commands
```bash
# Check database connection
npm run db:studio

# View build output
npm run build --verbose

# Check environment variables
printenv | grep -E "(DATABASE|JWT|RESEND)"
```

## 📞 Support

For deployment issues or questions:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Contact the development team
4. Create an issue in the repository

---

This deployment guide covers the most common scenarios. Adjust configurations based on your specific requirements and infrastructure choices.