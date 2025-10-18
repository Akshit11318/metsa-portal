# MetSA Portal - Deployment Checklist

## 📋 Pre-Deployment Checklist

### Server Requirements
- [ ] Ubuntu 20.04 LTS or higher installed
- [ ] Root or sudo access available
- [ ] Minimum 2GB RAM
- [ ] Minimum 10GB disk space
- [ ] Stable internet connection

### Software Installation
- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] Docker and Docker Compose installed (if using Docker)
- [ ] Git installed

## 🚀 Deployment Steps

### 1. Clone Repository
```bash
# SSH into server
ssh user@your-server-ip

# Clone repository
cd /opt
git clone https://github.com/Akshit11318/metsa-portal.git
cd metsa-portal

# Make scripts executable
chmod +x setup.sh run.sh
```

**Status:** [ ] Complete

---

### 2. Run Setup Script
```bash
./setup.sh
```

This will:
- Install backend dependencies
- Install frontend dependencies
- Generate Prisma client
- Reset and migrate database
- Seed database with 5 admin accounts (strong random passwords)
- Create `credentials.txt` with login details
- Generate secure JWT and CSRF secrets in `backend/.env`
- Create `frontend/.env.production`

**Status:** [ ] Complete

---

### 3. Save Credentials
```bash
# View generated credentials
cat credentials.txt

# Copy to secure location (e.g., password manager)
# Then delete the file
rm credentials.txt
```

**Credentials Saved:** [ ] Yes | [ ] No
**File Deleted:** [ ] Yes | [ ] No

---

### 4. Configure Environment Variables

#### Backend Environment (`backend/.env`)

Update these values:
```bash
# Update CORS_ORIGIN to your domain
CORS_ORIGIN=https://your-actual-domain.com

# Verify JWT_SECRET is set (auto-generated)
# Verify CSRF_SECRET is set (auto-generated)
```

**Status:** [ ] Complete

#### Frontend Environment (`frontend/.env.production`)

Update these values:
```bash
# Update API URL to your domain
VITE_API_URL=https://your-actual-domain.com/api
```

**Status:** [ ] Complete

---

### 5. Start Application

#### Using Docker (Recommended)
```bash
./run.sh start
```

#### Using PM2
See [docs/SERVER_SETUP.md](docs/SERVER_SETUP.md#option-2-pm2-deployment-without-docker)

**Status:** [ ] Complete

---

### 6. Verify Deployment
```bash
# Check service status
./run.sh status

# View logs
./run.sh logs

# Test health endpoint
curl http://localhost:4556/
```

**Services Running:** [ ] Yes | [ ] No
**Health Check Passed:** [ ] Yes | [ ] No

---

### 7. Setup SSL/HTTPS

#### Option A: Cloudflare Tunnel
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create metsa-portal

# Configure tunnel (see docs/SERVER_SETUP.md)
```

**Status:** [ ] Complete

#### Option B: Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**Status:** [ ] Complete

---

### 8. Setup Automated Backups
```bash
# Create backup script (see docs/SERVER_SETUP.md)
nano backup.sh
chmod +x backup.sh

# Setup cron job for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /opt/metsa-portal/backup.sh
```

**Status:** [ ] Complete

---

### 9. Change Default Passwords

Login to each account and change passwords:
- [ ] admin
- [ ] events_lead
- [ ] finops_lead
- [ ] sponsor_lead
- [ ] media_lead

**Status:** [ ] Complete

---

### 10. Configure Firewall (Optional but Recommended)
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application port (if not using tunnel)
sudo ufw allow 4556

# Enable firewall
sudo ufw enable
```

**Status:** [ ] Complete

---

## 🔒 Security Verification

### Environment Variables
- [ ] `JWT_SECRET` is strong (64+ characters)
- [ ] `CSRF_SECRET` is strong (32+ characters)
- [ ] `CORS_ORIGIN` is set to actual domain (not `*`)
- [ ] `CSRF_ENABLED=true` in production
- [ ] `NODE_ENV=production` in production

### Credentials
- [ ] All default passwords changed
- [ ] `credentials.txt` deleted
- [ ] Passwords stored in secure password manager

### SSL/HTTPS
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] HTTP redirects to HTTPS

### Access Control
- [ ] Only necessary ports open
- [ ] Firewall configured
- [ ] SSH key-based authentication enabled

---

## 📊 Post-Deployment Testing

### Basic Functionality
- [ ] Can access application via browser
- [ ] Can login with admin account
- [ ] Can create a test member
- [ ] Can create a test event
- [ ] Can create a test transaction
- [ ] Can upload a receipt
- [ ] Can create a note

### API Endpoints
```bash
# Health check
curl https://your-domain.com/

# Login test
curl -X POST https://your-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password","year":"2025"}'
```

**Status:** [ ] Complete

---

## 🔧 Maintenance Schedule

### Daily
- [ ] Monitor application logs
- [ ] Check disk space
- [ ] Verify backups ran successfully

### Weekly
- [ ] Review error logs
- [ ] Check system resource usage
- [ ] Update dependencies if needed

### Monthly
- [ ] Security updates
- [ ] Database optimization
- [ ] Review and clean old backups

---

## 📞 Emergency Contacts

**Technical Lead:** [Name]
**Email:** [Email]
**Phone:** [Phone]

**Server Provider:** [Provider Name]
**Support:** [Support Contact]

---

## 🐛 Troubleshooting Quick Reference

### Application Won't Start
```bash
# Check logs
./run.sh logs

# Rebuild containers
./run.sh clean
./run.sh start
```

### Database Issues
```bash
cd backend
npm run db:reset  # WARNING: Deletes all data
```

### Port Already in Use
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### CORS Errors
1. Check `CORS_ORIGIN` in `backend/.env`
2. Restart backend: `./run.sh restart`

See [docs/SERVER_SETUP.md](docs/SERVER_SETUP.md#troubleshooting) for complete troubleshooting guide.

---

## 📝 Deployment Notes

**Deployment Date:** _______________

**Deployed By:** _______________

**Server IP:** _______________

**Domain:** _______________

**Cloudflare Tunnel ID:** _______________ (if applicable)

**Backup Location:** _______________

**Additional Notes:**
```




```

---

## ✅ Sign-off

I confirm that:
- [ ] All checklist items are complete
- [ ] Application is accessible and functional
- [ ] All default passwords have been changed
- [ ] Credentials file has been deleted
- [ ] Backups are configured
- [ ] Security measures are in place
- [ ] Documentation has been reviewed

**Name:** _______________

**Signature:** _______________

**Date:** _______________

---

**Document Version:** 1.0
**Last Updated:** October 2024
