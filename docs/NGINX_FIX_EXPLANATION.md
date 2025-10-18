# Nginx Configuration Explanation

## The Problem

The original nginx config had:
```nginx
location /api/ {
    proxy_pass http://backend/;  # ← Trailing slash is the problem!
}
```

### What Was Happening:

1. **Request:** `https://metsa.kryptolo121.xyz/api/login`
2. **Nginx receives:** `/api/login`
3. **With trailing slash in proxy_pass:** Nginx STRIPS `/api/` and sends only `/login` to backend
4. **Backend receives:** `/login` (not `/api/login`)
5. **Backend:** 404 - Route not found! ❌

## The Fix

Changed to:
```nginx
location /api {
    proxy_pass http://backend:5000;  # ← NO trailing slash!
}
```

### What Happens Now:

1. **Request:** `https://metsa.kryptolo121.xyz/api/login`
2. **Nginx receives:** `/api/login`
3. **Without trailing slash:** Nginx passes THE COMPLETE PATH to backend
4. **Backend receives:** `/api/login` ✅
5. **Backend:** Route found! Returns response ✅

## Key Changes in nginx.conf

### 1. API Routing (Critical Fix)
```nginx
# OLD (WRONG)
location /api/ {
    proxy_pass http://backend/;  # Strips /api/ prefix
}

# NEW (CORRECT)
location /api {
    proxy_pass http://backend:5000;  # Preserves full path
}
```

### 2. Direct Upstream Reference
Instead of using `upstream backend` block, directly reference the backend:
- `http://backend:5000` - Uses Docker network DNS

### 3. Added Uploads Handling
```nginx
location /uploads {
    proxy_pass http://backend:5000;
    # Cache settings for file uploads
}
```

### 4. Better Headers
```nginx
proxy_set_header X-Forwarded-Host $host;
proxy_buffering off;  # Better real-time response
```

## Nginx Proxy Pass Rules

### With Trailing Slash (Path Rewriting)
```nginx
location /api/ {
    proxy_pass http://backend/;
}
# Request: /api/login → Proxied as: /login
# Request: /api/users → Proxied as: /users
```

### Without Trailing Slash (Path Preservation)
```nginx
location /api {
    proxy_pass http://backend:5000;
}
# Request: /api/login → Proxied as: /api/login
# Request: /api/users → Proxied as: /api/users
```

## Testing After Fix

### On Server:
```bash
cd /server/metsa-portal
git pull
./run.sh stop
./run.sh start

# Wait for containers
sleep 10

# Test API directly through nginx
curl -X POST http://localhost:4556/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'

# Should return JWT token, not 404!
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "token": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

## Request Flow (After Fix)

```
Browser
  │
  ├─ https://metsa.kryptolo121.xyz/api/login
  │
  ▼
Cloudflare Tunnel
  │
  ├─ localhost:4556/api/login
  │
  ▼
Nginx Container (port 4556)
  │
  ├─ Matches: location /api
  ├─ proxy_pass http://backend:5000
  ├─ Forwards: /api/login (FULL PATH)
  │
  ▼
Backend Container (port 5000)
  │
  ├─ Express receives: POST /api/login
  ├─ Routes to: authRoutes
  ├─ Executes: router.post('/login', ...)
  │
  ▼
Response (JWT token)
```

## Common Nginx Proxy Pass Mistakes

### ❌ Mistake 1: Trailing Slash Mismatch
```nginx
location /api/ {
    proxy_pass http://backend;  # Missing trailing slash
}
# Proxies as: http://backend/api/login (wrong!)
```

### ❌ Mistake 2: URI After Hostname
```nginx
location /api {
    proxy_pass http://backend/v1;  # URI path after hostname
}
# Proxies as: http://backend/v1/login (adds /v1!)
```

### ✅ Correct: Simple Pass-Through
```nginx
location /api {
    proxy_pass http://backend:5000;  # Just scheme://host:port
}
# Proxies as: http://backend:5000/api/login (perfect!)
```

## Debugging Nginx Routing

### 1. Check nginx logs
```bash
docker logs metsa-nginx --tail 50
```

### 2. Test from inside nginx container
```bash
docker exec -it metsa-nginx sh

# Test if backend is reachable
wget -O- http://backend:5000/

# Test login through direct backend connection
wget -O- --post-data='{"username":"admin","password":"test"}' \
  --header='Content-Type:application/json' \
  http://backend:5000/api/login

exit
```

### 3. Check what nginx is forwarding
Add this to nginx config temporarily:
```nginx
location /api {
    # Log what we're sending
    access_log /var/log/nginx/api-debug.log main;
    
    proxy_pass http://backend:5000;
    # ... other settings
}
```

## Port Summary

| Service  | Internal Port | External Port | Access                      |
|----------|---------------|---------------|-----------------------------|
| Backend  | 5000          | -             | Via nginx only              |
| Frontend | 80            | -             | Via nginx only              |
| Nginx    | 4556          | 4556          | Cloudflare → localhost:4556 |

## Files Changed

- `nginx/nginx.conf` - Rewrote API routing without trailing slashes
- `backend/src/server.js` - Apply CSRF per-route, not globally

## Commit These Changes

```bash
cd /home/akshit/Desktop/metsa/portal
git add nginx/nginx.conf
git commit -m "Fix: Nginx proxy_pass to preserve full API path (remove trailing slash)"
git push
```

Then on server:
```bash
cd /server/metsa-portal
git pull
./run.sh stop
./run.sh start
```

## Verification Checklist

- [ ] `curl http://localhost:4556/health` → Returns "nginx OK"
- [ ] `curl http://localhost:4556/api/login` → Not 404 anymore
- [ ] Backend logs show: `POST /api/login` (not just `/login`)
- [ ] Login from browser works
- [ ] Dashboard loads after login
- [ ] All API calls work (members, events, etc.)
