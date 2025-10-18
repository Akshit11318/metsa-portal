# MetSA Portal Backend (2025-26)

Backend API for the MetSA Portal management system built with Node.js, Express, Prisma, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and update JWT_SECRET
```

3. **Set up database**
```bash
npm run db:setup
```
This will:
- Generate Prisma client
- Run migrations
- Seed initial data (admin user + sample data)

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/                # API route handlers
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── members.js
│   │   ├── finops.js
│   │   ├── events.js
│   │   ├── sponsors.js
│   │   ├── admin.js
│   │   └── followups.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── utils/                 # Utility functions
│       └── response.js
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js               # Database seeder
├── .env                       # Environment variables
└── package.json
```

## 🔐 Default Users

After seeding, you can log in with:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Admin
- Year: 2025-26

**Core Lead Accounts:**
- Username: `events_lead` / Password: `events123` (Events Core)
- Username: `finops_lead` / Password: `finops123` (FinOps Core)
- Username: `sponsor_lead` / Password: `sponsor123` (Sponsorship Core)
- Username: `media_lead` / Password: `media123` (Media Core)

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User login (with year)
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Notes
- `GET /api/notes` - Get all notes (filterable)
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Add member
- `PATCH /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### FinOps
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event

### Sponsorships
- `GET /api/sponsors` - Get all sponsors
- `POST /api/sponsors` - Create sponsor
- `PATCH /api/sponsors/:id` - Update sponsor

### Admin
- `GET /api/admin/updates` - Get admin updates
- `POST /api/admin/updates` - Create admin update

### Follow-ups
- `GET /api/followups` - Get all upcoming reminders/tasks

## 🛠 Useful Commands

```bash
# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio (GUI)
npm run prisma:seed        # Seed database
npm run db:setup           # Complete setup
npm run db:reset           # Reset database

# Development
npm run dev                # Start with nodemon
npm start                  # Start production server
```

## 🔒 Authentication

All endpoints (except `/api/login`) require JWT authentication.

**Include token in requests:**
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Year Filtering

All requests automatically filter data by year. Include year in request headers:
```
X-Year: 2025-26
```

If not provided, defaults to `DEFAULT_YEAR` from `.env`.

## 🚢 Deployment

### Local Deployment
The backend is configured for local deployment with SQLite.

1. Build and run:
```bash
npm install --production
npm run db:setup
npm start
```

2. The SQLite database (`dev.db`) will be created in the `prisma/` folder.

### Production Deployment
For production, consider:
1. Change `JWT_SECRET` in `.env`
2. Set `NODE_ENV=production`
3. Use a process manager like PM2
4. Set up proper logging
5. Configure reverse proxy (nginx)

## 📝 License

MIT License - MetSA Team 2025
