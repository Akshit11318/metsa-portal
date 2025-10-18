# CSRF Login Fix - October 18, 2025

## Problem
Login was failing with **403 Forbidden** error:
```
POST https://metsa.kryptolo121.xyz/api/login 403 (Forbidden)
Login failed: CSRF validation failed. Please refresh the page and try again.
```

## Root Cause
The CSRF protection middleware was being applied **before** the login route, causing all login attempts to be blocked because:

1. Login is the **first** request - users don't have a CSRF token yet
2. CSRF middleware was checking for tokens on **ALL** POST requests
3. Login should be **exempt** from CSRF protection (it's a public endpoint)

## Solution
Reordered middleware in `backend/src/server.js`:

### Before (Wrong Order):
```javascript
// CSRF Protection middleware
app.use(setCsrfToken);
app.use(csrfProtection);

// API Routes
app.use('/api', authRoutes);  // Login route blocked by CSRF!
```

### After (Correct Order):
```javascript
// Login route (before CSRF protection)
app.use('/api', authRoutes);

// CSRF Protection middleware (after login)
app.use(setCsrfToken);
app.use(csrfProtection);

// Protected API Routes
```

## Additional Fixes
1. **Updated CSRF path checking** in `csrf.js`:
   - Now checks both `req.path` and `req.originalUrl`
   - Added `/login` to public paths (in addition to `/api/login`)

2. **Fixed cookie settings** for production:
   - `sameSite: 'none'` for cross-site requests (Cloudflare tunnel)
   - `secure: true` in production (HTTPS required)
   - `httpOnly: false` (JavaScript needs to read CSRF token)

3. **Frontend API client** updated:
   - Skip CSRF token for login requests
   - Fetch CSRF token after successful login

## Security Flow (Correct)
1. **User visits site** → Gets CSRF cookie automatically
2. **User submits login** → No CSRF check (public endpoint)
3. **Login successful** → Returns JWT token
4. **Subsequent requests** → Requires both JWT token AND CSRF token

## Testing on Server
```bash
cd /server/metsa-portal
git pull
./run.sh stop
./run.sh start

# Wait for containers to start
sleep 10

# Test login (should work now)
curl -X POST https://metsa.kryptolo121.xyz/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'
```

## Verification Checklist
- ✅ Login page loads at https://metsa.kryptolo121.xyz/login
- ✅ Login with correct credentials succeeds
- ✅ JWT token is returned and stored
- ✅ Protected routes require authentication
- ✅ CSRF protection works for state-changing operations (after login)

## Files Modified
1. `backend/src/middleware/csrf.js` - Path checking logic
2. `backend/src/server.js` - Middleware order (critical fix)
3. `frontend/src/lib/apiClient.ts` - Skip CSRF for login

## Commits
- `c7b7bb1` - Move login route before CSRF middleware
- `7905699` - Implement correct CSRF security flow
- `a8fb72e` - Frontend nginx config and backend health endpoint

## Notes
- This is a **standard security pattern** - login/signup are public endpoints
- CSRF protection applies to **authenticated** state-changing operations
- The middleware order in Express is **critical** - order matters!
