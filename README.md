# MetSA Portal 🎓

**MetSA Portal** is a comprehensive club management system built for the Metallurgical Students' Association. It provides tools for managing members, events, finances, sponsorships, and administrative tasks.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **Docker** & **Docker Compose** (for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/Akshit11318/metsa-portal.git
cd metsa-portal

# Run setup script (installs dependencies, sets up database, creates admin accounts)
chmod +x setup.sh
./setup.sh

# Start the application
chmod +x run.sh
./run.sh start
```

The application will be available at:
- **Local**: http://localhost:4556
- **Production**: https://metsa.yourdomain.com

## 📚 Documentation

- **[Server Setup Guide](docs/SERVER_SETUP.md)** - Complete server deployment guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Docker and PM2 deployment options
- **[Environment Variables](docs/ENVIRONMENT_VARIABLES.md)** - All environment configuration
- **[Backend API Documentation](backend/README.md)** - API endpoints and usage
- **[Backend Structure](backend/STRUCTURE.md)** - Code organization

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM for database management
- **SQLite** - Database (production-ready, easily replaceable with PostgreSQL/MySQL)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads

#### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Zustand** - State management

#### Deployment
- **Docker** - Containerization
- **Nginx** - Reverse proxy & static file serving
- **PM2** - Process manager (alternative to Docker)

### Project Structure

```
metsa-portal/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, CSRF, error handling
│   │   └── utils/          # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.js         # Database seeding
│   │   └── migrations/     # Database migrations
│   ├── uploads/            # File uploads (receipts, etc.)
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API client, utilities
│   │   └── store/          # State management
│   ├── .env.example        # Environment template
│   └── package.json
│
├── nginx/                  # Nginx configuration
│   ├── nginx.conf
│   └── security-headers.conf
│
├── docs/                   # Documentation
│   ├── SERVER_SETUP.md
│   ├── DEPLOYMENT.md
│   └── ENVIRONMENT_VARIABLES.md
│
├── docker-compose.yml      # Docker orchestration
├── setup.sh                # Initial setup script
└── run.sh                  # Application management script
```

## 🔐 Default Accounts

After running `./setup.sh`, the following accounts are created with **strong random passwords**:

| Username       | Role            | Core Area    |
|----------------|-----------------|--------------|
| admin          | Admin           | -            |
| events_lead    | Core Lead       | Events       |
| finops_lead    | Core Lead       | FinOps       |
| sponsor_lead   | Core Lead       | Sponsorship  |
| media_lead     | Core Lead       | Media        |

**⚠️ IMPORTANT:**
1. Passwords are saved in `credentials.txt` after setup
2. **Copy these passwords to a secure location**
3. **Delete `credentials.txt` immediately** after copying
4. **Change all passwords** after first login

## 🎯 Features

### Member Management
- ✅ Add, edit, and manage member profiles
- ✅ Track member status (active/inactive/alumni)
- ✅ Branch, program, and core assignment
- ✅ Graduation year tracking
- ✅ Import/export member data

### Financial Operations (FinOps)
- ✅ Transaction management (inflow/outflow)
- ✅ Receipt uploads
- ✅ Budget tracking
- ✅ Category-based reporting
- ✅ Approval workflows

### Event Management
- ✅ Create and manage events
- ✅ Budget allocation
- ✅ Venue booking
- ✅ Status tracking (planned/ongoing/completed)
- ✅ Core-wise event assignment

### Sponsorship Management
- ✅ Sponsor contact management
- ✅ Deal stages (contacted/negotiating/confirmed)
- ✅ Amount tracking
- ✅ Follow-up reminders

### Notes & Follow-ups
- ✅ Create notes with follow-up dates
- ✅ Related entity linking (members, events, sponsors)
- ✅ Priority levels
- ✅ Status tracking
- ✅ Visibility controls (personal/core/all)

### Admin Features
- ✅ User management
- ✅ Role-based access control
- ✅ System announcements
- ✅ Statistics dashboard
- ✅ Year-wise data filtering

### Security
- ✅ JWT authentication
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure password hashing
- ✅ Role-based permissions

## 🛠️ Scripts

### Setup Script (`./setup.sh`)
Initializes the application:
- Installs dependencies
- Sets up database with migrations
- Creates default admin accounts with strong passwords
- Generates secure JWT and CSRF secrets
- Creates credentials file

### Run Script (`./run.sh`)
Manages the application:
```bash
./run.sh start    # Build and start all services
./run.sh stop     # Stop all services
./run.sh restart  # Restart all services
./run.sh logs     # View live logs
./run.sh status   # Check service status
./run.sh build    # Rebuild Docker images
./run.sh clean    # Remove all containers and volumes
./run.sh help     # Show help message
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="file:./dev.db"

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your_secure_64_char_secret

# CORS (your frontend domain)
CORS_ORIGIN=https://metsa.yourdomain.com

# CSRF
CSRF_ENABLED=true
CSRF_SECRET=your_secure_32_char_secret

# Default Year
DEFAULT_YEAR=2025
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```bash
# API URL (your backend domain)
VITE_API_URL=https://metsa.yourdomain.com/api
```

See [ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for complete details.

## 🚢 Deployment

### Docker Deployment (Recommended)

```bash
# 1. Run setup
./setup.sh

# 2. Update environment variables
nano backend/.env
nano frontend/.env.production

# 3. Start services
./run.sh start

# 4. Check status
./run.sh status
```

### Manual Deployment (PM2)

See [SERVER_SETUP.md](docs/SERVER_SETUP.md) for detailed PM2 deployment instructions.

## 📊 Database Management

### Prisma Studio (Database GUI)
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### Migrations
```bash
cd backend

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

### Backup Database
```bash
# Backup SQLite database
cp backend/prisma/dev.db backup/dev.db.$(date +%Y%m%d_%H%M%S)

# Backup uploads
tar -czf backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

## 🧪 Development

### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Generate Prisma client
npm run prisma:generate
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔒 Security Checklist

- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Generate strong `CSRF_SECRET` (32+ characters)
- [ ] Update `CORS_ORIGIN` to your domain
- [ ] Enable HTTPS/SSL in production
- [ ] Change all default passwords
- [ ] Delete `credentials.txt` after copying passwords
- [ ] Setup automated backups
- [ ] Configure firewall (UFW)
- [ ] Regular security updates
- [ ] Monitor logs regularly

## 🐛 Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :5000  # Check what's using port 5000
sudo kill -9 <PID>  # Kill the process
```

### Docker Issues
```bash
./run.sh clean      # Clean up Docker
./run.sh start      # Rebuild and start
```

### Database Issues
```bash
cd backend
npm run db:reset    # Reset database (WARNING: Deletes data)
```

### CORS Errors
1. Check `CORS_ORIGIN` in `backend/.env`
2. Ensure it matches frontend URL exactly
3. Include protocol (`https://` or `http://`)
4. Restart backend

See [SERVER_SETUP.md](docs/SERVER_SETUP.md) for more troubleshooting tips.

## 📦 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `PATCH /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Transactions (FinOps)
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Sponsors
- `GET /api/sponsors` - List all sponsors
- `POST /api/sponsors` - Create sponsor
- `PATCH /api/sponsors/:id` - Update sponsor
- `DELETE /api/sponsors/:id` - Delete sponsor

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user

See [backend/API_DOCS.md](backend/API_DOCS.md) for complete API documentation.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed and maintained by the MetSA Technical Team.

## 📞 Support

For issues, questions, or support:
- **GitHub Issues**: [Create an issue](https://github.com/Akshit11318/metsa-portal/issues)
- **Email**: support@metsa.edu
- **Documentation**: Check the `docs/` folder

## 📝 Changelog

### Version 1.0.0 (October 2024)
- ✨ Initial release
- ✅ Complete member management system
- ✅ Financial operations tracking
- ✅ Event management
- ✅ Sponsorship management
- ✅ Notes and follow-ups
- ✅ Admin dashboard
- ✅ Docker deployment support
- ✅ Comprehensive documentation

---

**Made with ❤️ by MetSA Technical Team**

**Last Updated**: October 2024
