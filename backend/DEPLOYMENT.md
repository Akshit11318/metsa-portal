# MetSA Portal - Deployment Guide

## 🚀 Local Deployment

### Prerequisites
- Node.js v18+ installed
- npm or yarn installed

### Quick Setup

1. **Run the setup script (Linux/Mac):**
```bash
chmod +x setup.sh
./setup.sh
```

2. **Or manual setup:**
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and update JWT_SECRET
nano .env

# Setup database
npm run db:setup

# Start server
npm run dev
```

3. **Access the API:**
- API: http://localhost:5000
- Health check: http://localhost:5000/

---

## 🖥️ Production Deployment

### Option 1: PM2 (Recommended for Linux servers)

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Start the application:**
```bash
# Production mode
NODE_ENV=production pm2 start src/server.js --name metsa-portal

# View logs
pm2 logs metsa-portal

# Monitor
pm2 monit

# Auto-restart on system reboot
pm2 startup
pm2 save
```

3. **Update application:**
```bash
git pull
npm install
npx prisma migrate deploy
pm2 restart metsa-portal
```

### Option 2: Docker (Containerized)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./prisma:/app/prisma
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

### Option 3: Systemd Service (Linux)

Create `/etc/systemd/system/metsa-portal.service`:
```ini
[Unit]
Description=MetSA Portal Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable metsa-portal
sudo systemctl start metsa-portal
sudo systemctl status metsa-portal
```

---

## 🔒 Security Checklist

### Before Production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update default user passwords
- [ ] Enable HTTPS (use nginx/apache as reverse proxy)
- [ ] Set `NODE_ENV=production`
- [ ] Restrict CORS origins
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Regular database backups
- [ ] Keep dependencies updated

### Generate secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/metsa-portal`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/metsa-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Enable HTTPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 💾 Database Backup

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/path/to/backend/prisma/dev.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/metsa_backup_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "metsa_backup_*.db" -mtime +30 -delete

echo "Backup completed: metsa_backup_$DATE.db"
```

Add to crontab (daily at 2 AM):
```bash
crontab -e
# Add line:
0 2 * * * /path/to/backup.sh
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Custom Logging:
Add to your `.env`:
```env
LOG_LEVEL=info
LOG_FILE=/var/log/metsa-portal/app.log
```

---

## 🔄 Update Workflow

1. **Pull latest changes:**
```bash
cd /path/to/backend
git pull origin main
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run migrations:**
```bash
npx prisma migrate deploy
```

4. **Restart application:**
```bash
pm2 restart metsa-portal
# or
sudo systemctl restart metsa-portal
```

---

## 🐛 Troubleshooting

### Port already in use:
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Database locked:
```bash
# Stop all processes
pm2 stop all
# Restart
pm2 start metsa-portal
```

### Permission issues:
```bash
# Fix ownership
sudo chown -R $USER:$USER /path/to/backend
```

---

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs metsa-portal`
- Review API_DOCS.md
- Check database: `npx prisma studio`

---

## 📈 Performance Tips

1. **Use production mode:**
   - Set `NODE_ENV=production`
   
2. **Enable compression:**
   ```bash
   npm install compression
   ```
   Add to server.js:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Enable rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

4. **Use Redis for sessions (optional):**
   ```bash
   npm install redis
   ```

---

**Happy Deploying! 🚀**
