# MetSA Portal - Quick Reference Card

## 🚀 First Time Setup (5 Minutes)

```bash
# 1. Clone
git clone https://github.com/Akshit11318/metsa-portal.git
cd metsa-portal

# 2. Setup (installs deps, creates DB, generates passwords)
chmod +x setup.sh run.sh
./setup.sh

# 3. Save passwords
cat credentials.txt
# Copy passwords to password manager
rm credentials.txt

# 4. Update domains
nano backend/.env              # Change CORS_ORIGIN
nano frontend/.env.production  # Change VITE_API_URL

# 5. Start
./run.sh start

# 6. Access
# Local: http://localhost:4556
# Production: https://your-domain.com
```

---

## 📋 Environment Files to Update

### `backend/.env`
```bash
CORS_ORIGIN=https://your-actual-domain.com  # ← CHANGE THIS
```

### `frontend/.env.production`
```bash
VITE_API_URL=https://your-actual-domain.com/api  # ← CHANGE THIS
```

---

## 🔐 Default Accounts (Created by setup.sh)

```
Username: admin          Role: Admin           Password: [in credentials.txt]
Username: events_lead    Role: Core - Events   Password: [in credentials.txt]
Username: finops_lead    Role: Core - FinOps   Password: [in credentials.txt]
Username: sponsor_lead   Role: Core - Sponsor  Password: [in credentials.txt]
Username: media_lead     Role: Core - Media    Password: [in credentials.txt]
```

**⚠️ Remember:**
1. Passwords are in `credentials.txt` after setup
2. Copy to password manager
3. Delete `credentials.txt` immediately
4. Change passwords after first login

---

## 🛠️ Common Commands

### Application Management
```bash
./run.sh start     # Start all services
./run.sh stop      # Stop all services
./run.sh restart   # Restart services
./run.sh logs      # View live logs
./run.sh status    # Check status
./run.sh clean     # Clean Docker (removes everything)
```

### Database Management
```bash
cd backend
npx prisma studio         # Open database GUI (localhost:5555)
npx prisma migrate dev    # Create new migration
npm run db:reset          # Reset database (WARNING: deletes data)
```

### View Logs
```bash
./run.sh logs              # All services
docker logs metsa-backend  # Backend only
docker logs metsa-frontend # Frontend only
```

---

## 🔍 Health Checks

```bash
# Check if services are running
./run.sh status

# Test backend
curl http://localhost:5000/

# Test full stack
curl http://localhost:4556/

# Check database
cd backend && npx prisma studio
```

---

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :5000      # Check port 5000
sudo kill -9 <PID>      # Kill process
```

### Docker Issues
```bash
./run.sh clean          # Remove everything
./run.sh start          # Fresh start
```

### CORS Errors
```bash
# Check backend/.env
cat backend/.env | grep CORS_ORIGIN

# Should match your frontend domain
# Update and restart:
./run.sh restart
```

### Database Issues
```bash
cd backend
npm run db:reset        # ⚠️ Deletes all data!
```

---

## 📦 Project Structure

```
metsa-portal/
├── backend/           # Node.js API
│   ├── src/          # Source code
│   ├── prisma/       # Database
│   ├── .env          # ← CONFIGURE THIS
│   └── uploads/      # File uploads
├── frontend/         # React app
│   ├── src/          # Source code
│   └── .env.production  # ← CONFIGURE THIS
├── docs/             # Documentation
├── setup.sh          # ← RUN THIS FIRST
└── run.sh            # ← USE THIS TO MANAGE APP
```

---

## 🔒 Security Checklist

Before going live:
- [ ] Run `./setup.sh` (generates strong passwords)
- [ ] Copy `credentials.txt` to password manager
- [ ] Delete `credentials.txt`
- [ ] Update `CORS_ORIGIN` in `backend/.env`
- [ ] Update `VITE_API_URL` in `frontend/.env.production`
- [ ] Change all default passwords after first login
- [ ] Setup HTTPS/SSL
- [ ] Configure firewall
- [ ] Setup automated backups

---

## 📞 Need Help?

1. **Check Documentation:**
   - Main guide: `README.md`
   - Server setup: `docs/SERVER_SETUP.md`
   - Environment vars: `docs/ENVIRONMENT_VARIABLES.md`
   - Deployment checklist: `docs/DEPLOYMENT_CHECKLIST.md`

2. **Check Logs:**
   ```bash
   ./run.sh logs
   ```

3. **Common Issues:**
   - CORS errors → Update `CORS_ORIGIN` in `backend/.env`
   - Can't login → Check credentials in `credentials.txt`
   - Port in use → Kill process: `sudo lsof -i :PORT`
   - Docker issues → Clean and rebuild: `./run.sh clean && ./run.sh start`

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `setup.sh` | Initial setup (run once) |
| `run.sh` | Manage application |
| `backend/.env` | Backend configuration |
| `frontend/.env.production` | Frontend configuration |
| `credentials.txt` | Generated passwords (delete after use) |
| `docker-compose.yml` | Docker orchestration |

---

## 📊 URLs

| Service | Local URL | Production URL |
|---------|-----------|----------------|
| Frontend | http://localhost:4556 | https://your-domain.com |
| Backend API | http://localhost:5000 | https://your-domain.com/api |
| Database GUI | http://localhost:5555 | N/A (local only) |

---

## 💡 Tips

- Always run `./setup.sh` before first deployment
- Use `./run.sh` to manage the application
- Keep `credentials.txt` secret and delete after copying
- Update environment files before production deployment
- Change all passwords after first login
- Setup SSL/HTTPS for production
- Configure automated backups

---

## 🚨 Important Notes

1. **credentials.txt** contains sensitive passwords
   - Only exists after running `./setup.sh`
   - Copy to secure location immediately
   - Delete the file after copying
   
2. **Environment variables** need updating
   - `CORS_ORIGIN` in `backend/.env`
   - `VITE_API_URL` in `frontend/.env.production`
   
3. **Default passwords** must be changed
   - Login to each account
   - Change password in profile/settings
   - All 5 accounts need new passwords

---

**Print this page for quick reference! 📄**

---

**Version:** 1.0 | **Last Updated:** October 2024
