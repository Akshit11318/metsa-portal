# MetSA Portal Backend - Testing Guide

## 🧪 API Testing with cURL

### Authentication

#### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "year": "2025-26"
  }'
```

Save the token from response:
```bash
export TOKEN="your-jwt-token-here"
```

#### Get Current User
```bash
curl http://localhost:5000/api/user \
  -H "Authorization: Bearer $TOKEN"
```

---

### Notes

#### Get All Notes
```bash
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "content": "Test note from API",
    "visibility": "all",
    "status": "pending",
    "followUpDate": "2025-10-20T00:00:00Z"
  }'
```

#### Update Note
```bash
curl -X PATCH http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "complete"
  }'
```

#### Delete Note
```bash
curl -X DELETE http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### Members

#### Get All Members
```bash
curl http://localhost:5000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Member
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "program": "B.Tech",
    "branch": "CSE",
    "core": "Events",
    "joinYear": "2024-25",
    "gradYear": "2028"
  }'
```

---

### Transactions

#### Get All Transactions
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "type": "inflow",
    "amount": 10000,
    "purpose": "Test sponsorship",
    "category": "sponsorship",
    "date": "2025-10-09T00:00:00Z"
  }'
```

---

### Events

#### Get All Events
```bash
curl http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "name": "Test Event",
    "description": "Testing event creation",
    "core": "Events",
    "date": "2025-11-01T00:00:00Z",
    "venue": "Test Venue",
    "budget": 15000
  }'
```

---

### Sponsors

#### Get All Sponsors
```bash
curl http://localhost:5000/api/sponsors \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Sponsor
```bash
curl -X POST http://localhost:5000/api/sponsors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "name": "Test Sponsor Inc",
    "contactPerson": "John Doe",
    "email": "john@testsponsor.com",
    "phone": "9876543210",
    "stage": "contacted",
    "amount": 25000,
    "followUpDate": "2025-10-25T00:00:00Z"
  }'
```

---

### Admin

#### Get Admin Updates
```bash
curl http://localhost:5000/api/admin/updates \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

#### Create Admin Update
```bash
curl -X POST http://localhost:5000/api/admin/updates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Year: 2025-26" \
  -d '{
    "title": "Test Announcement",
    "content": "This is a test announcement",
    "priority": "normal"
  }'
```

#### Get System Stats
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

---

### Follow-ups

#### Get Upcoming Follow-ups
```bash
curl http://localhost:5000/api/followups?days=7 \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26"
```

---

## 🔍 Testing with Postman

1. **Import Collection:**
   - Create a new collection "MetSA Portal API"
   - Set base URL variable: `{{baseUrl}}` = `http://localhost:5000/api`
   - Set token variable: `{{token}}` (update after login)

2. **Setup Authorization:**
   - Go to Collection > Authorization
   - Type: Bearer Token
   - Token: `{{token}}`

3. **Setup Headers:**
   - Add header: `X-Year: 2025-26`

4. **Test Workflow:**
   - Login → Save token
   - Test all endpoints
   - Verify responses

---

## 🧩 Integration Testing

Create `test/integration.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/server');

let token;

describe('MetSA Portal API Integration Tests', () => {
  
  // Login
  test('POST /api/login - Success', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'admin',
        password: 'admin123',
        year: '2025-26'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    
    token = response.body.data.token;
  });

  // Get User
  test('GET /api/user - Success', async () => {
    const response = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Create Note
  test('POST /api/notes - Success', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Test note',
        visibility: 'all'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

Run tests:
```bash
npm test
```

---

## 🐛 Debugging Tips

1. **Check server logs:**
```bash
npm run dev
# Watch for errors in console
```

2. **Inspect database:**
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

3. **Test database queries:**
```bash
node
> const { PrismaClient } = require('@prisma/client');
> const prisma = new PrismaClient();
> await prisma.user.findMany();
```

4. **Check JWT token:**
```bash
# Decode JWT token
node -e "console.log(JSON.parse(Buffer.from('YOUR_TOKEN'.split('.')[1], 'base64').toString()))"
```

---

## ✅ Checklist

- [ ] Server starts without errors
- [ ] Can login with default credentials
- [ ] JWT token is generated
- [ ] Can access protected routes with token
- [ ] CRUD operations work for all entities
- [ ] Year filtering works correctly
- [ ] Role-based access control works
- [ ] Follow-ups endpoint returns correct data
- [ ] Admin stats are calculated correctly
- [ ] Database persists data correctly

---

## 📝 Quick Test Script

Save as `quick-test.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing MetSA Portal API..."
echo ""

# Health check
echo "1. Health Check:"
curl -s $BASE_URL/../ | jq
echo ""

# Login
echo "2. Login:"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","year":"2025-26"}')
echo $LOGIN_RESPONSE | jq
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo ""

# Get User
echo "3. Get Current User:"
curl -s $BASE_URL/user \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# Get Notes
echo "4. Get Notes:"
curl -s $BASE_URL/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Year: 2025-26" | jq '.data | length'
echo ""

echo "✅ Basic tests completed!"
```

Run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

**Happy Testing! 🎉**
