# PRISMA + ALPINE LINUX FIX - ACTION PLAN

## Problem:
Prisma Query Engine needs OpenSSL but Alpine Linux compatibility was misconfigured.

## What Was Fixed:

### 1. ✅ Prisma Schema (`backend/prisma/schema.prisma`)
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```
- Removed `"linux-musl"` (needs OpenSSL 1.1, which Alpine doesn't have)
- Kept only `"linux-musl-openssl-3.0.x"` (compatible with Alpine's OpenSSL 3)

### 2. ✅ Dockerfile (`backend/Dockerfile`)
- Added `openssl` package to BOTH builder and production stages
- This ensures Prisma Query Engine can find the required OpenSSL libraries

---

## ON YOUR LOCAL MACHINE:

```bash
cd /home/akshit/Desktop/metsa/portal

# 1. Regenerate Prisma Client with correct binary target
cd backend
npx prisma generate
cd ..

# 2. Commit all changes
git add backend/prisma/schema.prisma backend/Dockerfile
git commit -m "Fix: Prisma compatibility with Alpine Linux OpenSSL 3.0"
git push origin master
```

---

## ON THE SERVER:

```bash
# 1. Navigate to project
cd /server/metsa-portal

# 2. Pull latest changes
git pull origin master

# 3. Clean old Docker containers and images
./run.sh clean

# 4. Rebuild Docker images (this will run prisma generate with correct binary)
./run.sh build

# 5. Start the application
./run.sh start

# 6. Check if backend is running
./run.sh logs
```

---

## Verify It's Working:

```bash
# On server, check backend status
docker ps | grep metsa-backend

# Should see "Up" status, not "Restarting"

# Check logs - should NOT see Prisma errors
./run.sh logs | grep -i prisma

# Test backend health
curl http://localhost:5000/

# Test full stack through nginx
curl http://localhost:4556/
```

---

## Why This Works:

1. **Binary Target Match**: `linux-musl-openssl-3.0.x` matches Alpine Linux with OpenSSL 3
2. **OpenSSL Installed**: Both builder and runtime images have OpenSSL 3 installed
3. **No Version Mismatch**: Removed `linux-musl` which expects OpenSSL 1.1

---

## Summary of Changes:

| File | Change | Reason |
|------|--------|--------|
| `backend/prisma/schema.prisma` | Keep only `linux-musl-openssl-3.0.x` | Match Alpine's OpenSSL 3 |
| `backend/Dockerfile` | Add `openssl` to production stage | Prisma needs OpenSSL at runtime |

---

**This is the correct, simple fix. No complications!** 🚀
