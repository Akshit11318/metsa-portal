# MetSA Portal Backend - Project Structure

```
backend/
│
├── src/                          # Source code
│   ├── server.js                # Main application entry point
│   │
│   ├── routes/                  # API route handlers
│   │   ├── auth.js             # Authentication routes (login, logout, user)
│   │   ├── notes.js            # Notes CRUD operations
│   │   ├── members.js          # Members management
│   │   ├── finops.js           # Financial transactions
│   │   ├── events.js           # Events management
│   │   ├── sponsors.js         # Sponsorships management
│   │   ├── admin.js            # Admin operations & stats
│   │   └── followups.js        # Follow-up reminders
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # JWT authentication & authorization
│   │   └── errorHandler.js    # Global error handling
│   │
│   └── utils/                   # Utility functions
│       └── response.js         # Standard API response helpers
│
├── prisma/                      # Database configuration
│   ├── schema.prisma           # Prisma schema definition
│   ├── seed.js                 # Database seeding script
│   ├── dev.db                  # SQLite database (auto-generated)
│   └── migrations/             # Database migrations
│       ├── migration_lock.toml
│       └── 20251009000000_init/
│           └── migration.sql
│
├── .env                         # Environment variables (not in git)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
│
├── package.json                # Node.js dependencies & scripts
├── package-lock.json           # Dependency lock file
│
├── setup.sh                    # Automated setup script
│
├── README.md                   # Project documentation
├── API_DOCS.md                 # API endpoints documentation
├── DEPLOYMENT.md               # Deployment guide
├── TESTING.md                  # Testing guide
└── STRUCTURE.md                # This file

```

## 📂 Directory Details

### `/src`
Main application source code.

#### `/src/routes`
API route handlers for different features:
- **auth.js**: Login, logout, user info
- **notes.js**: Notes CRUD with filtering
- **members.js**: Members management (admin/core)
- **finops.js**: Financial transactions & summaries
- **events.js**: Events management
- **sponsors.js**: Sponsorships with follow-ups
- **admin.js**: Admin updates & statistics
- **followups.js**: Upcoming reminders aggregator

#### `/src/middleware`
Express middleware functions:
- **auth.js**: JWT verification, role-based authorization, year extraction
- **errorHandler.js**: Centralized error handling

#### `/src/utils`
Helper utilities:
- **response.js**: Standard API response formatters

### `/prisma`
Database configuration and management:
- **schema.prisma**: Database schema (models, relations)
- **seed.js**: Populates database with initial data
- **dev.db**: SQLite database file (auto-generated)
- **migrations/**: Version-controlled schema changes

## 🔄 Data Flow

```
Client Request
     ↓
Express Server (server.js)
     ↓
Middleware (auth, extractYear)
     ↓
Route Handler (routes/*.js)
     ↓
Prisma Client (database queries)
     ↓
SQLite Database (dev.db)
     ↓
Response Formatter (utils/response.js)
     ↓
JSON Response to Client
```

## 🗄️ Database Schema

### Users
- id, username, passwordHash, role, core, year
- Relations: notes, transactions

### Notes
- id, content, createdBy, role, visibility, relatedType, relatedId, status, followUpDate, year
- Relations: creator (User), member (Member)

### Members
- id, name, email, phone, program, branch, core, joinYear, gradYear, year, status
- Relations: notes

### Transactions
- id, type, amount, purpose, category, approver, status, notesId, receiptUrl, date, year
- Relations: approvedBy (User)

### Events
- id, name, description, core, date, venue, status, budget, notesId, year

### Sponsors
- id, name, contactPerson, email, phone, stage, amount, followUpDate, notesId, year

### AdminUpdates
- id, title, content, priority, year

## 🔐 Authentication Flow

1. User sends login credentials
2. Server validates against database
3. JWT token generated with user info
4. Token sent to client
5. Client includes token in subsequent requests
6. Middleware verifies token and extracts user info
7. Route handlers use user info for authorization

## 📊 API Response Format

All endpoints follow consistent response format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## 🚀 Startup Sequence

1. Load environment variables (.env)
2. Initialize Express app
3. Setup middleware (CORS, JSON parsing, Morgan)
4. Register routes
5. Setup error handlers
6. Start HTTP server
7. Listen on configured port

## 📦 Key Dependencies

- **express**: Web framework
- **@prisma/client**: Database ORM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment configuration
- **morgan**: HTTP request logger

## 🎯 Design Principles

1. **Modularity**: Separate concerns (routes, middleware, utils)
2. **Security**: JWT auth, bcrypt hashing, role-based access
3. **Consistency**: Standard response format
4. **Year-based**: Multi-year data support
5. **Scalability**: Easy to extend with new features
6. **Local-first**: SQLite for easy deployment
7. **Documentation**: Comprehensive docs for all features

## 🔧 Configuration

### Environment Variables (.env)
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: SQLite connection string
- `JWT_SECRET`: Secret for JWT signing
- `DEFAULT_YEAR`: Default operational year
- `CORS_ORIGIN`: Allowed frontend origin

### npm Scripts
- `npm start`: Production server
- `npm run dev`: Development with auto-reload
- `npm run db:setup`: Complete database setup
- `npm run db:reset`: Reset database with fresh seed
- `npm run prisma:*`: Prisma commands

## 📝 Notes

- Database is stored as a single file (dev.db) for easy backup
- All dates stored in UTC
- Year filtering applied automatically via middleware
- Role-based permissions enforced at route level
- Timestamps auto-generated for all entities
- Soft delete not implemented (use status fields instead)

---

**For detailed API documentation, see API_DOCS.md**
**For deployment instructions, see DEPLOYMENT.md**
**For testing guide, see TESTING.md**
