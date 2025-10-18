# 🚀 MetSA Portal Backend - Quick Start

## 1️⃣ Install Dependencies

```bash
cd backend
npm install
```

## 2️⃣ Setup Database

```bash
npm run db:setup
```

This will:
- Generate Prisma Client
- Create SQLite database
- Run migrations
- Seed initial data

## 3️⃣ Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 4️⃣ Test API

**Health check:**
```bash
curl http://localhost:5000
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","year":"2025-26"}'
```

## 📌 Default Credentials

| Username | Password | Role | Core |
|----------|----------|------|------|
| admin | admin123 | Admin | - |
| events_lead | events123 | Core | Events |
| finops_lead | finops123 | Core | FinOps |
| sponsor_lead | sponsor123 | Core | Sponsorship |
| media_lead | media123 | Core | Media |

## 🔧 Useful Commands

```bash
# Database
npm run prisma:studio          # Open database GUI
npm run prisma:migrate         # Run new migrations
npm run prisma:seed            # Seed data
npm run db:reset              # Reset & reseed database

# Development
npm run dev                   # Start with auto-reload
npm start                     # Start production server
```

## 📚 Documentation

- **README.md** - Full documentation
- **API_DOCS.md** - API endpoints reference
- **DEPLOYMENT.md** - Production deployment guide
- **TESTING.md** - Testing guide
- **STRUCTURE.md** - Project structure

## 🌐 Endpoints

- `http://localhost:5000` - Health check
- `http://localhost:5000/api/login` - Login
- `http://localhost:5000/api/notes` - Notes
- `http://localhost:5000/api/members` - Members
- `http://localhost:5000/api/transactions` - FinOps
- `http://localhost:5000/api/events` - Events
- `http://localhost:5000/api/sponsors` - Sponsors
- `http://localhost:5000/api/admin/updates` - Admin updates
- `http://localhost:5000/api/followups` - Follow-ups

## ⚠️ Important

1. **Change JWT_SECRET** in `.env` before production
2. **Update passwords** for default users
3. **Enable HTTPS** for production deployment
4. **Regular backups** of `prisma/dev.db` file

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :5000
kill -9 <PID>
```

**Database issues:**
```bash
npm run db:reset
```

**Can't connect:**
- Check if server is running
- Verify port in `.env`
- Check firewall settings

## 🎉 You're Ready!

Server should be running at **http://localhost:5000**

Connect your frontend to this backend URL.

For detailed API documentation, check **API_DOCS.md**
