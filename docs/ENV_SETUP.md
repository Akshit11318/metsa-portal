# Environment Variables Configuration

## Backend Environment Variables

Create `/server/metsa-portal/backend/.env` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
DEFAULT_YEAR=2025

# Database
DATABASE_URL="file:./dev.db"

# CORS Configuration
CORS_ORIGIN=https://metsa.kryptolo121.xyz

# Security - CSRF Protection
CSRF_ENABLED=true
CSRF_SECRET=your-csrf-secret-here-generate-with-openssl

# Security - JWT Authentication
JWT_SECRET=your-jwt-secret-here-generate-with-openssl
JWT_EXPIRES_IN=7d

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Secure Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 64

# Generate CSRF_SECRET
openssl rand -base64 64
```

## Frontend Environment Variables

Create `/server/metsa-portal/frontend/.env.production` file:

```bash
# API Configuration
VITE_API_URL=https://metsa.kryptolo121.xyz/api

# Optional: Analytics
# VITE_GA_ID=your-google-analytics-id
```

## Docker Compose Environment Variables

The `docker-compose.yml` already has these set:

```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=file:./dev.db
      - CORS_ORIGIN=https://metsa.kryptolo121.xyz
      - CSRF_ENABLED=true
```

## Quick Setup Script

Run this on your server to create .env files:

```bash
cd /server/metsa-portal

# Generate secrets
JWT_SECRET=$(openssl rand -base64 64)
CSRF_SECRET=$(openssl rand -base64 64)

# Create backend .env
cat > backend/.env << EOF
NODE_ENV=production
PORT=5000
DEFAULT_YEAR=2025
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=https://metsa.kryptolo121.xyz
CSRF_ENABLED=true
CSRF_SECRET=${CSRF_SECRET}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Create frontend .env.production
cat > frontend/.env.production << EOF
VITE_API_URL=https://metsa.kryptolo121.xyz/api
EOF

echo "✅ Environment files created!"
echo ""
echo "📝 JWT_SECRET: ${JWT_SECRET}"
echo "📝 CSRF_SECRET: ${CSRF_SECRET}"
echo ""
echo "⚠️  Save these secrets securely!"
```

## Verify Environment Variables

```bash
# Check backend environment
docker exec metsa-backend env | grep -E 'NODE_ENV|PORT|CORS|CSRF|JWT'

# Check if .env file is loaded
docker exec metsa-backend cat /app/.env
```

## Important Notes

### 1. **JWT_SECRET**
- Used to sign authentication tokens
- Must be kept secret
- Changing it will invalidate all existing user sessions

### 2. **CSRF_SECRET**
- Used for CSRF token generation (if implemented with secrets)
- Keep it secure

### 3. **CORS_ORIGIN**
- Must match your frontend URL exactly
- For Cloudflare tunnel: `https://metsa.kryptolo121.xyz`
- For local dev: `http://localhost:5173`
- Multiple origins not currently supported (would need code changes)

### 4. **DATABASE_URL**
- Currently uses SQLite: `file:./dev.db`
- For production, consider PostgreSQL or MySQL
- Path is relative to backend directory

### 5. **CSRF_ENABLED**
- Set to `true` in production
- Can be `false` for local development
- Protects against Cross-Site Request Forgery attacks

## Environment Variable Priority

1. Docker Compose `environment` section (highest priority)
2. `.env` file in backend directory
3. System environment variables
4. Default values in code (lowest priority)

## After Creating .env Files

```bash
# Rebuild containers to use new environment
./run.sh stop
./run.sh build
./run.sh start

# Verify
docker logs metsa-backend --tail 50
```

## Troubleshooting

### Problem: Variables not loading
```bash
# Check if .env file exists
ls -la backend/.env

# Check file permissions
chmod 644 backend/.env

# Verify content
cat backend/.env
```

### Problem: CORS errors
```bash
# Verify CORS_ORIGIN matches your domain
docker exec metsa-backend env | grep CORS_ORIGIN

# Should output: CORS_ORIGIN=https://metsa.kryptolo121.xyz
```

### Problem: JWT token invalid
```bash
# Check if JWT_SECRET is set
docker exec metsa-backend env | grep JWT_SECRET

# If missing, recreate .env file
```

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters (preferably 64+)
- [ ] CSRF_SECRET is at least 32 characters
- [ ] .env files are not committed to git (in .gitignore)
- [ ] CORS_ORIGIN is set to your actual domain
- [ ] NODE_ENV=production on server
- [ ] CSRF_ENABLED=true on server
- [ ] Secrets are stored securely (password manager)
- [ ] .env files have correct permissions (644 or 600)

## Default Admin Credentials

After running `./setup.sh`, check:
```bash
cat credentials.txt
```

These are generated with strong random passwords and should be changed after first login.
