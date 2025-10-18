# Backend Debugging Commands

## On Server - Check Container Status
```bash
# Check all containers
docker ps -a

# Check backend logs
docker logs metsa-backend --tail 100

# Check frontend logs
docker logs metsa-frontend --tail 50

# Check nginx logs
docker logs metsa-nginx --tail 50
```

## Test Backend Endpoints Directly

### 1. Test from INSIDE backend container
```bash
# Enter backend container
docker exec -it metsa-backend sh

# Test root endpoint
wget -O- http://localhost:5000/

# Test health endpoint
wget -O- http://localhost:5000/health

# Test login endpoint (should work)
wget -O- --post-data='{"username":"admin","password":"test123"}' \
  --header='Content-Type:application/json' \
  http://localhost:5000/api/login

# Exit container
exit
```

### 2. Test from nginx container
```bash
# Enter nginx container
docker exec -it metsa-nginx sh

# Test if backend is reachable
wget -O- http://metsa-backend:5000/

# Test login through backend
wget -O- --post-data='{"username":"admin","password":"test123"}' \
  --header='Content-Type:application/json' \
  http://metsa-backend:5000/api/login

# Exit
exit
```

### 3. Test from host machine (server)
```bash
# Test through nginx (port 4556)
curl http://localhost:4556/health

# Test backend health through nginx
curl http://localhost:4556/api/health

# Test login
curl -X POST http://localhost:4556/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'
```

## Check Environment Variables
```bash
# Check backend environment
docker exec metsa-backend env | grep -E 'NODE_ENV|PORT|CORS|CSRF|JWT'

# Check if .env file exists
docker exec metsa-backend ls -la /app/.env

# Read .env file (if exists)
docker exec metsa-backend cat /app/.env
```

## Check Backend Routes
```bash
# Add temporary route listing to server.js
docker exec metsa-backend node -e "
const app = require('./src/server.js');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
})
"
```

## Real-time Backend Logs
```bash
# Follow backend logs in real-time
docker logs -f metsa-backend

# In another terminal, make a request
curl -X POST http://localhost:4556/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'
```

## Network Debugging
```bash
# Check if containers can communicate
docker exec metsa-nginx ping -c 3 metsa-backend
docker exec metsa-nginx ping -c 3 metsa-frontend

# Check network configuration
docker network inspect metsa-portal_metsa-network
```

## Restart Specific Container
```bash
# Restart just backend
docker restart metsa-backend

# Wait and check logs
sleep 5
docker logs metsa-backend --tail 50
```

## Common Issues & Fixes

### Issue: 404 on /api/login
**Check:**
```bash
# Verify route is registered
docker exec metsa-backend grep -n "router.post('/login'" src/routes/auth.js
docker exec metsa-backend grep -n "app.use('/api', authRoutes)" src/server.js
```

### Issue: CORS errors
**Check:**
```bash
# Verify CORS_ORIGIN
docker exec metsa-backend env | grep CORS_ORIGIN

# Should be: CORS_ORIGIN=https://metsa.kryptolo121.xyz
```

### Issue: Backend not starting
**Check:**
```bash
# Check for syntax errors
docker exec metsa-backend node --check src/server.js

# Check dependencies
docker exec metsa-backend npm list --depth=0
```

## Full Reset (Nuclear Option)
```bash
cd /server/metsa-portal

# Stop everything
./run.sh stop

# Remove all containers and volumes
docker-compose down -v

# Clean docker system
docker system prune -f

# Pull latest code
git pull

# Rebuild and start
./run.sh build
./run.sh start

# Check logs
docker logs metsa-backend --tail 100
```

## Check Available Routes (Add to server.js temporarily)
Add this before `app.listen()`:
```javascript
// Debug: List all registered routes
console.log('\n=== Registered Routes ===');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(sub){
      if (sub.route && sub.route.path){
        const basePath = r.regexp.toString().match(/\/api/)?.[0] || '';
        console.log(`${Object.keys(sub.route.methods).join(',').toUpperCase()} ${basePath}${sub.route.path}`);
      }
    });
  }
});
console.log('========================\n');
```
