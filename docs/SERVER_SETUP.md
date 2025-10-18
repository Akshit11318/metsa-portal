# MetSA Portal - Server Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Server Setup](#initial-server-setup)
- [Environment Variables](#environment-variables)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **OS**: Ubuntu 20.04 LTS or higher (recommended)
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Docker**: v24.x or higher
- **Docker Compose**: v2.x or higher
- **Git**: Latest version

### Optional (Recommended)
- **PM2**: For process management (non-Docker deployments)
- **Nginx**: As reverse proxy
- **Cloudflare Tunnel**: For secure public access

---

## Initial Server Setup

### 1. Clone Repository
```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to desired directory
cd /opt  # or /home/user/apps

# Clone the repository
git clone https://github.com/Akshit11318/metsa-portal.git
cd metsa-portal

# Make scripts executable
chmod +x setup.sh run.sh
```

### 2. Install Dependencies (if not using Docker)

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
```

#### Install Docker (if using Docker deployment)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin
docker compose version  # Verify installation
```

---

## Environment Variables

### Backend Environment Variables (`backend/.env`)

Create a `backend/.env` file with the following variables:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=5000

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="file:./dev.db"

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate a strong random secret (64+ characters)
# Use: openssl rand -base64 64
JWT_SECRET=your_super_secure_random_jwt_secret_here_min_64_chars

# JWT expiration time
JWT_EXPIRES_IN=7d

# ============================================
# CORS CONFIGURATION
# ============================================
# Set to your frontend domain in production
CORS_ORIGIN=https://metsa.yourdomain.com

# For development (allow all origins)
# CORS_ORIGIN=*

# ============================================
# CSRF PROTECTION
# ============================================
CSRF_ENABLED=true

# ============================================
# UPLOAD CONFIGURATION
# ============================================
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
```

### Frontend Environment Variables (`frontend/.env.production`)

Create a `frontend/.env.production` file:

```bash
# API Configuration
VITE_API_URL=https://metsa.yourdomain.com/api

# Or for local development
# VITE_API_URL=http://localhost:5000/api
```

### Generating Secure Secrets

```bash
# Generate JWT Secret (64 characters)
openssl rand -base64 64

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate shorter alphanumeric password (32 characters)
openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 32
```

---

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

#### Step 1: Update Configuration
```bash
# Edit docker-compose.yml and update CORS_ORIGIN
nano docker-compose.yml
# Change: CORS_ORIGIN=https://metsa.yourdomain.com
```

#### Step 2: Run Setup Script
```bash
./setup.sh
```
This will:
- Install backend dependencies
- Generate Prisma client
- Reset database and run migrations
- Seed database with default accounts (strong random passwords)
- Create `credentials.txt` with login details
- Generate secure JWT and CSRF secrets

#### Step 3: Save Credentials
```bash
# View generated credentials
cat credentials.txt

# Copy credentials to a secure location
# Then delete the file
rm credentials.txt
```

#### Step 4: Start Application
```bash
# Build and start all services
./run.sh start

# Or manually
docker compose up -d --build
```

#### Step 5: Verify Deployment
```bash
# Check service status
./run.sh status
# Or
docker compose ps

# View logs
./run.sh logs
# Or
docker compose logs -f
```

### Option 2: PM2 Deployment (Without Docker)

#### Step 1: Install PM2
```bash
sudo npm install -g pm2
```

#### Step 2: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file (use template above)
nano .env

# Setup database
npm run db:setup

# Generate credentials
cd ..
./setup.sh  # This will generate credentials
```

#### Step 3: Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create production env file
nano .env.production

# Build frontend
npm run build
```

#### Step 4: Start with PM2
```bash
# Start backend
cd backend
pm2 start src/server.js --name metsa-backend --env production

# Serve frontend with PM2 (using http-server)
sudo npm install -g http-server
cd ../frontend/dist
pm2 start http-server --name metsa-frontend -- -p 80

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 5: Setup Nginx as Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/metsa
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name metsa.yourdomain.com;

    # Frontend
    location / {
        root /opt/metsa-portal/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/metsa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Post-Deployment

### 1. Change Default Passwords
```bash
# Login to the application
# Navigate to profile/settings
# Change all default passwords immediately
```

### 2. Setup SSL/HTTPS (Recommended)

#### Using Certbot (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d metsa.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Using Cloudflare Tunnel
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create metsa-portal

# Configure tunnel
nano ~/.cloudflared/config.yml
```

Add configuration:
```yaml
tunnel: <tunnel-id>
credentials-file: /home/user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: metsa.yourdomain.com
    service: http://localhost:4556
  - service: http_status:404
```

Start tunnel:
```bash
cloudflared tunnel run metsa-portal
```

### 3. Setup Monitoring

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

#### Docker Monitoring
```bash
docker compose logs -f
docker stats
```

### 4. Setup Automated Backups

Create backup script (`backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backup/metsa"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp backend/prisma/dev.db $BACKUP_DIR/db_backup_$DATE.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Setup cron job:
```bash
chmod +x backup.sh

# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/metsa-portal/backup.sh >> /var/log/metsa-backup.log 2>&1
```

---

## Default Accounts

After running `setup.sh`, the following accounts are created with **strong random passwords**:

| Username       | Role            | Core Area    |
|----------------|-----------------|--------------|
| admin          | Admin           | -            |
| events_lead    | Core Lead       | Events       |
| finops_lead    | Core Lead       | FinOps       |
| sponsor_lead   | Core Lead       | Sponsorship  |
| media_lead     | Core Lead       | Media        |

**⚠️ IMPORTANT:**
1. Passwords are saved in `credentials.txt` after setup
2. Copy these passwords to a secure location
3. Delete `credentials.txt` after copying
4. Change all passwords after first login

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5000
sudo lsof -i :4556

# Kill the process
sudo kill -9 <PID>
```

### Docker Issues
```bash
# Clean up Docker system
docker system prune -a

# Rebuild from scratch
./run.sh clean
./run.sh start
```

### Database Issues
```bash
# Reset database
cd backend
npm run db:reset

# Or manually
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/metsa-portal
chmod +x *.sh
```

### Check Logs
```bash
# Docker logs
docker compose logs backend
docker compose logs frontend

# PM2 logs
pm2 logs metsa-backend

# System logs
journalctl -u metsa-portal -f
```

### API Not Responding
```bash
# Check backend health
curl http://localhost:5000/

# Check backend inside Docker
docker compose exec backend curl http://localhost:5000/
```

---

## Maintenance Commands

### Update Application
```bash
# Pull latest changes
git pull origin main

# Restart services
./run.sh restart

# Or for Docker
docker compose pull
docker compose up -d --build
```

### Database Management
```bash
# Access Prisma Studio (GUI)
cd backend
npx prisma studio
# Opens at http://localhost:5555

# Run migrations
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

### View Statistics
```bash
# Docker stats
docker stats

# PM2 stats
pm2 status
pm2 monit
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Setup automated backups
- [ ] Configure CORS_ORIGIN properly
- [ ] Enable CSRF_ENABLED=true
- [ ] Regular security updates
- [ ] Monitor logs regularly
- [ ] Secure credentials.txt (delete after use)

---

## Support

For issues or questions:
- Check logs first
- Review this documentation
- Check GitHub issues
- Contact MetSA technical team

---

**Last Updated**: October 2024
**Version**: 1.0.0
