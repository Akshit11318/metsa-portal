# 📋 MetSA Portal - Quick Reference

## 🔐 Default Login Credentials

### Admin Account
```
Username: admin
Password: admin123
Role:     Admin
Access:   Full system access
```

### Core Lead Accounts
```
Events Core:
  Username: events_lead
  Password: events123
  
FinOps Core:
  Username: finops_lead
  Password: finops123
  
Sponsorship Core:
  Username: sponsor_lead
  Password: sponsor123
  
Media Core:
  Username: media_lead
  Password: media123
```

---

## 🚀 Quick Start Commands

### Start Everything
```bash
# Make executable (first time only)
chmod +x run.sh

# Start both frontend and backend
./run.sh
```

### Start Backend Only
```bash
cd backend
npm run dev
# or
node src/server.js
```

### Start Frontend Only
```bash
cd frontend
npm run dev
```

---

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application UI |
| Backend | http://localhost:5000 | API server |
| API Docs | http://localhost:5000/api | Health check |
| Database GUI | `npx prisma studio` | Prisma Studio (run in backend/) |

---

## 📡 API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

### Core Features
- `GET/POST/PATCH/DELETE /api/notes` - Notes
- `GET/POST/PATCH/DELETE /api/members` - Members
- `GET/POST/PATCH /api/transactions` - Transactions
- `GET/POST/PATCH /api/events` - Events
- `GET/POST/PATCH /api/sponsors` - Sponsors
- `GET/POST /api/admin/updates` - Admin updates
- `GET /api/followups` - Follow-up reminders

---

## 🛠️ Common Tasks

### Reset Database
```bash
cd backend
npm run db:reset
```

### View Database
```bash
cd backend
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Check Logs
```bash
# Backend logs
tail -f /tmp/metsa-backend.log

# Frontend logs
tail -f /tmp/metsa-frontend.log
```

### Stop All Services
```
Press Ctrl+C in the terminal running run.sh
```

---

## 🔧 Configuration Files

### Backend
- `backend/.env` - Environment variables
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/server.js` - Main server

### Frontend
- `frontend/.env` - Environment variables
- `frontend/src/lib/api.ts` - API configuration
- `frontend/src/store/authStore.ts` - Auth state

---

## 📚 Documentation

- `README.md` - Project overview
- `INTEGRATION.md` - Frontend-Backend integration
- `backend/README.md` - Backend documentation
- `backend/API_DOCS.md` - Complete API reference
- `backend/DEPLOYMENT.md` - Deployment guide
- `backend/TESTING.md` - API testing guide

---

## 💡 Quick Tips

1. **Always start with `./run.sh`** - It handles everything
2. **Default year is `2025-26`** - Can be changed in .env
3. **JWT tokens expire in 7 days** - Will need to re-login
4. **Database is SQLite** - Stored in `backend/prisma/dev.db`
5. **CORS is pre-configured** - For localhost:5173

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
kill -9 <PID>
```

**Can't login:**
- Check backend is running: `curl http://localhost:5000`
- Reset database: `cd backend && npm run db:reset`

**CORS error:**
- Verify backend .env: `CORS_ORIGIN=http://localhost:5173`
- Restart backend after changing .env

**Database error:**
- Delete `backend/prisma/dev.db`
- Run: `cd backend && npm run db:setup`

---

## 📞 Need Help?

1. Check documentation files
2. View logs: `tail -f /tmp/metsa-*.log`
3. Reset everything: `cd backend && npm run db:reset`
4. Restart servers: `./run.sh`

---

**Last Updated:** October 9, 2025
**Version:** 1.0.0
