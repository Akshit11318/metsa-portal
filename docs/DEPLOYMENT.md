# MetSA Portal - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Cloudflare Tunnel configured separately (forwarding to localhost:4556)
- Domain: https://metsa.kryptolo121.xyz

### Initial Setup

1. **Run the setup script** to initialize database and create accounts:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   This will:
   - Install all dependencies (backend & frontend)
   - Reset and initialize the database
   - Generate secure random 12-character passwords
   - Create 3 default accounts (admin, core_member, member)
   - Create a `credentials.txt` file with login details
   - Configure environment variables with secure secrets

2. **Save credentials securely**:
   - Open `credentials.txt` and save the passwords
   - **Delete the file** after saving credentials
   - Change all passwords after first login

3. **Start the application**:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

The application will be available at:
- **Local**: http://localhost:4556
- **Public**: https://metsa.kryptolo121.xyz (via your Cloudflare tunnel)

## 📋 Available Commands

### Setup Script (`./setup.sh`)
- Installs dependencies
- Resets database with migrations
- Creates default accounts with secure passwords
- Generates JWT and CSRF secrets
- Creates credentials file

### Run Script (`./run.sh`)
```bash
./run.sh start    # Build and start all services (default)
./run.sh stop     # Stop all services
./run.sh restart  # Restart all services
./run.sh logs     # View service logs (follow mode)
./run.sh status   # Show service status
./run.sh build    # Rebuild Docker images
./run.sh clean    # Remove all containers, volumes, and images
./run.sh help     # Show help message
```

## 🏗️ Architecture

### Services
1. **Backend** (Node.js/Express)
   - Port: 5000 (internal)
   - API endpoints at `/api/*`
   - Database: SQLite with Prisma ORM
   - Authentication: JWT tokens
   - Security: CSRF protection enabled

2. **Frontend** (React/Vite)
   - Port: 80 (internal)
   - Built with TypeScript and shadcn/ui
   - Bundled and served via nginx

3. **Nginx Reverse Proxy**
   - Port: 4556 (exposed to host)
   - Routes `/api/*` to backend
   - Routes `/` to frontend
   - Security headers and rate limiting
   - Gzip compression

### Network Flow
```
Internet → Cloudflare Tunnel → localhost:4556 → Nginx → Backend/Frontend
```

## 🔒 Security Features

### CSRF Protection
- Double Submit Cookie pattern
- Required for all state-changing requests (POST, PUT, PATCH, DELETE)
- Automatic token refresh in frontend
- Configurable via `CSRF_ENABLED` environment variable

### Rate Limiting
- API endpoints: 10 requests/second with burst of 20
- Login endpoint: 5 requests/minute with burst of 3
- Returns 429 status when exceeded

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Content-Security-Policy: configured
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt (10 rounds)
- HTTP-only cookies for CSRF tokens
- Authorization header for API requests

## 📁 Directory Structure

```
metsa-portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── dev.db             # SQLite database
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT authentication
│   │   │   ├── csrf.js        # CSRF protection
│   │   │   └── errorHandler.js
│   │   ├── routes/            # API routes
│   │   └── server.js          # Express server
│   ├── uploads/               # Uploaded files (receipts)
│   ├── Dockerfile
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities and API client
│   │   └── store/             # Zustand state management
│   ├── Dockerfile
│   ├── nginx.conf             # Frontend nginx config
│   └── .env.production        # Build-time variables
├── nginx/
│   ├── nginx.conf             # Main nginx configuration
│   └── security-headers.conf  # Security headers
├── cloudflare/
│   └── README.md              # Cloudflare tunnel info
├── docker-compose.yml         # Docker orchestration
├── setup.sh                   # Initial setup script
└── run.sh                     # Run/management script
```

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=<randomly-generated-secret>
DEFAULT_YEAR=2025
CORS_ORIGIN=https://metsa.kryptolo121.xyz
CSRF_ENABLED=true
CSRF_SECRET=<randomly-generated-secret>
```

### Frontend Environment Variables (`frontend/.env.production`)
```env
VITE_API_URL=https://metsa.kryptolo121.xyz/api
VITE_APP_NAME=MetSA Portal
VITE_APP_DOMAIN=metsa.kryptolo121.xyz
```

## 📦 Database Management

### Backup Database
```bash
docker exec metsa-backend cp /app/prisma/dev.db /app/prisma/backup.db
docker cp metsa-backend:/app/prisma/backup.db ./database-backup.db
```

### Restore Database
```bash
docker cp ./database-backup.db metsa-backend:/app/prisma/dev.db
docker restart metsa-backend
```

### Reset Database
```bash
cd backend
npx prisma migrate reset --force
npx prisma generate
node prisma/seed.js
```

## 🐳 Docker Commands

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Execute commands in containers
```bash
# Access backend shell
docker exec -it metsa-backend sh

# Access database
docker exec -it metsa-backend npx prisma studio
```

### Rebuild specific service
```bash
docker compose build backend
docker compose up -d backend
```

## 🔍 Troubleshooting

### Application not accessible
1. Check if all services are running:
   ```bash
   ./run.sh status
   ```

2. Check logs for errors:
   ```bash
   ./run.sh logs
   ```

3. Verify port 4556 is not in use:
   ```bash
   lsof -i :4556
   ```

4. Check Cloudflare tunnel status:
   ```bash
   cloudflared tunnel info metsa-portal
   ```

### CSRF errors
1. Clear browser cookies
2. Check `CSRF_ENABLED=true` in backend/.env
3. Verify CORS_ORIGIN matches your domain
4. Check browser console for CSRF token errors

### Database errors
1. Check database file exists:
   ```bash
   docker exec metsa-backend ls -la /app/prisma/dev.db
   ```

2. Run migrations:
   ```bash
   docker exec metsa-backend npx prisma migrate deploy
   ```

3. Reset database (WARNING: destroys data):
   ```bash
   ./run.sh stop
   ./setup.sh
   ./run.sh start
   ```

### Port conflicts
If port 4556 is in use, edit `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"  # Change 4556 to your preferred port
```

Then update your Cloudflare tunnel to forward to the new port.

## 🔄 Updates and Maintenance

### Update application code
```bash
# Pull latest changes
git pull

# Rebuild and restart
./run.sh restart
```

### Update dependencies
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Clean rebuild
```bash
./run.sh clean
./run.sh start
```

## 📊 Monitoring

### Health checks
- Backend: http://localhost:4556/api/
- Frontend: http://localhost:4556/
- Nginx: http://localhost:4556/health

### Service status
```bash
docker compose ps
```

### Resource usage
```bash
docker stats
```

## 🚨 Security Best Practices

1. **Change default passwords immediately** after first login
2. **Rotate JWT_SECRET** periodically (requires all users to re-login)
3. **Keep dependencies updated** (run `npm audit` regularly)
4. **Monitor logs** for suspicious activity
5. **Backup database** regularly
6. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
7. **Enable Cloudflare security features** (WAF, rate limiting, bot protection)
8. **Review CORS_ORIGIN** setting matches your domain exactly
9. **Keep Docker images updated** (rebuild periodically)
10. **Monitor failed login attempts** in logs

## 📞 Support

For issues or questions:
1. Check logs: `./run.sh logs`
2. Review this guide
3. Check Docker/Cloudflare documentation
4. Contact MetSA technical team

## 📝 Default Accounts

After running `setup.sh`, three accounts are created:

1. **Admin Account**
   - Username: `admin`
   - Email: `admin@metsa.kryptolo121.xyz`
   - Role: Administrator
   - Password: (in credentials.txt)

2. **Core Member Account**
   - Username: `core_member`
   - Email: `core@metsa.kryptolo121.xyz`
   - Role: User (Core)
   - Password: (in credentials.txt)

3. **Regular Member Account**
   - Username: `member`
   - Email: `member@metsa.kryptolo121.xyz`
   - Role: User (Member)
   - Password: (in credentials.txt)

**⚠️ IMPORTANT**: Change all default passwords after first login!

## 🎯 Production Checklist

Before going live:
- [ ] Run `./setup.sh` to initialize database
- [ ] Save credentials from `credentials.txt` securely
- [ ] Delete `credentials.txt` file
- [ ] Change all default passwords
- [ ] Verify CORS_ORIGIN in backend/.env
- [ ] Verify VITE_API_URL in frontend/.env.production
- [ ] Test Cloudflare tunnel connection
- [ ] Configure Cloudflare security settings
- [ ] Set up database backup schedule
- [ ] Test all major features
- [ ] Monitor logs for errors
- [ ] Document custom configurations
