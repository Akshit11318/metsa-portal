# MetSA Portal - Environment Variables Guide

This document explains all environment variables used in the MetSA Portal application.

## Backend Environment Variables

Location: `backend/.env`

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | Yes |

**Values for NODE_ENV:**
- `development` - For local development
- `production` - For production deployment

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Prisma database connection string | `file:./dev.db` | Yes |

**Examples:**
```bash
# SQLite (default)
DATABASE_URL="file:./dev.db"

# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/metsa"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/metsa"
```

### JWT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | No |

**Generate JWT Secret:**
```bash
# Using OpenSSL (64 characters recommended)
openssl rand -base64 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**JWT Expiration Format:**
- `60s` - 60 seconds
- `5m` - 5 minutes
- `2h` - 2 hours
- `7d` - 7 days
- `30d` - 30 days

### CORS Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGIN` | Allowed origin for CORS | `*` | Yes (Prod) |

**Examples:**
```bash
# Single origin
CORS_ORIGIN=https://metsa.yourdomain.com

# Multiple origins (comma-separated)
CORS_ORIGIN=https://metsa.yourdomain.com,https://www.metsa.yourdomain.com

# Allow all (development only)
CORS_ORIGIN=*
```

### CSRF Protection

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CSRF_ENABLED` | Enable CSRF protection | `false` | No |
| `CSRF_SECRET` | Secret for CSRF token generation | - | If enabled |

**Generate CSRF Secret:**
```bash
openssl rand -base64 32
```

### Upload Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` | No |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` | No |

**File Size Examples:**
- `1048576` - 1 MB
- `5242880` - 5 MB
- `10485760` - 10 MB (default)
- `52428800` - 50 MB

### Rate Limiting

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

### Logging

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level | `info` | No |

**Log Levels:**
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors
- `debug` - All logs including debug
- `verbose` - Very detailed logs

### Default Year

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEFAULT_YEAR` | Default academic year | `2025` | No |

---

## Frontend Environment Variables

Location: `frontend/.env.production` or `frontend/.env`

### API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` | Yes |

**Examples:**
```bash
# Production
VITE_API_URL=https://metsa.yourdomain.com/api

# Development
VITE_API_URL=http://localhost:5000/api

# Docker
VITE_API_URL=http://backend:5000/api
```

### Application Information

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_APP_NAME` | Application name | `MetSA Portal` | No |
| `VITE_APP_DOMAIN` | Application domain | - | No |

---

## Docker Compose Environment Variables

Location: `docker-compose.yml`

### Backend Service

```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - DATABASE_URL=file:./dev.db
  - CORS_ORIGIN=https://metsa.yourdomain.com
  - CSRF_ENABLED=true
```

### Frontend Build Args

```yaml
args:
  - VITE_API_URL=https://metsa.yourdomain.com/api
```

---

## Environment Setup by Deployment Type

### Development (Local)

**Backend (`backend/.env`):**
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev_secret_change_in_production
CORS_ORIGIN=http://localhost:5173
CSRF_ENABLED=false
```

**Frontend (`frontend/.env`):**
```bash
VITE_API_URL=http://localhost:5000/api
```

### Production (Docker)

**Backend (in `docker-compose.yml`):**
```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - DATABASE_URL=file:./dev.db
  - JWT_SECRET=${JWT_SECRET}  # From .env file
  - CORS_ORIGIN=https://metsa.yourdomain.com
  - CSRF_ENABLED=true
```

**Frontend (`frontend/.env.production`):**
```bash
VITE_API_URL=https://metsa.yourdomain.com/api
```

### Production (PM2)

**Backend (`backend/.env`):**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_generated_64_char_secret
CORS_ORIGIN=https://metsa.yourdomain.com
CSRF_ENABLED=true
CSRF_SECRET=your_generated_32_char_secret
```

**Frontend (`frontend/.env.production`):**
```bash
VITE_API_URL=https://metsa.yourdomain.com/api
```

---

## Security Best Practices

### ✅ DO

1. **Generate strong secrets:**
   ```bash
   openssl rand -base64 64  # For JWT_SECRET
   openssl rand -base64 32  # For CSRF_SECRET
   ```

2. **Use HTTPS in production:**
   ```bash
   CORS_ORIGIN=https://metsa.yourdomain.com
   ```

3. **Enable CSRF in production:**
   ```bash
   CSRF_ENABLED=true
   ```

4. **Restrict CORS to your domain:**
   ```bash
   CORS_ORIGIN=https://metsa.yourdomain.com
   ```

5. **Use environment-specific .env files:**
   - Development: `.env` or `.env.development`
   - Production: `.env.production`

### ❌ DON'T

1. **Don't commit .env files:**
   - Add to `.gitignore`
   - Use `.env.example` as template

2. **Don't use weak secrets:**
   ```bash
   # Bad
   JWT_SECRET=secret123
   
   # Good
   JWT_SECRET=$(openssl rand -base64 64)
   ```

3. **Don't use `CORS_ORIGIN=*` in production:**
   ```bash
   # Development only
   CORS_ORIGIN=*
   
   # Production
   CORS_ORIGIN=https://yourdomain.com
   ```

4. **Don't expose secrets in logs:**
   ```bash
   LOG_LEVEL=info  # Not 'debug' in production
   ```

---

## Troubleshooting

### CORS Errors

**Problem:** Browser shows CORS policy errors

**Solution:**
1. Check `CORS_ORIGIN` in backend `.env`
2. Ensure it matches your frontend URL exactly
3. Include protocol (`https://` or `http://`)
4. Restart backend after changes

### JWT Token Invalid

**Problem:** Authentication fails with "invalid token"

**Solution:**
1. Verify `JWT_SECRET` is set in backend `.env`
2. Ensure secret hasn't changed (invalidates all tokens)
3. Check token expiration (`JWT_EXPIRES_IN`)

### File Upload Fails

**Problem:** File uploads return errors

**Solution:**
1. Check `MAX_FILE_SIZE` in backend `.env`
2. Ensure `UPLOAD_DIR` exists and is writable
3. Verify file size is within limit

### Database Connection Error

**Problem:** Cannot connect to database

**Solution:**
1. Verify `DATABASE_URL` in backend `.env`
2. Check database file exists (SQLite)
3. Run migrations: `npx prisma migrate dev`

---

## Quick Reference

### Generate All Secrets

```bash
# JWT Secret (64 chars)
echo "JWT_SECRET=$(openssl rand -base64 64)"

# CSRF Secret (32 chars)
echo "CSRF_SECRET=$(openssl rand -base64 32)"
```

### Validate Environment

```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET ? '✓ JWT_SECRET set' : '✗ JWT_SECRET missing')"

# Frontend (build time)
cd frontend
grep VITE_API_URL .env.production
```

### Reset Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and set all values

# Frontend
cd frontend
cp .env.example .env.production
# Edit .env.production and set VITE_API_URL
```

---

**Last Updated:** October 2024
