# MetSA Portal API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/login`) require JWT authentication.

**Include token in requests:**
```
Authorization: Bearer <your-jwt-token>
```

**Include year in requests (optional):**
```
X-Year: 2025-26
```

---

## 🔐 Authentication Endpoints

### Login
**POST** `/login`

Request body:
```json
{
  "username": "admin",
  "password": "admin123",
  "year": "2025-26"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "core": null,
      "year": "2025-26"
    }
  }
}
```

### Logout
**POST** `/logout`

### Get Current User
**GET** `/user`

---

## 📝 Notes Endpoints

### Get All Notes
**GET** `/notes`

Query parameters:
- `core` - Filter by core
- `status` - Filter by status (pending/complete/archived)
- `relatedType` - Filter by related type
- `visibility` - Filter by visibility
- `startDate` - Filter by start date
- `endDate` - Filter by end date

### Create Note
**POST** `/notes`

Request body:
```json
{
  "content": "Follow up with venue",
  "visibility": "all",
  "relatedType": "event",
  "relatedId": 1,
  "status": "pending",
  "followUpDate": "2025-10-15T00:00:00Z"
}
```

### Update Note
**PATCH** `/notes/:id`

### Delete Note
**DELETE** `/notes/:id`

---

## 👥 Members Endpoints

### Get All Members
**GET** `/members`

Query parameters:
- `core` - Filter by core
- `status` - Filter by status
- `program` - Filter by program
- `search` - Search by name/email/phone

### Create Member
**POST** `/members` _(admin/core only)_

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "program": "B.Tech",
  "branch": "CSE",
  "core": "Events",
  "joinYear": "2024-25",
  "gradYear": "2028",
  "status": "active"
}
```

### Update Member
**PATCH** `/members/:id` _(admin/core only)_

### Delete Member
**DELETE** `/members/:id` _(admin only)_

---

## 💰 FinOps (Transactions) Endpoints

### Get All Transactions
**GET** `/transactions`

Query parameters:
- `type` - Filter by type (inflow/outflow)
- `status` - Filter by status
- `category` - Filter by category
- `startDate` - Filter by start date
- `endDate` - Filter by end date

Response includes financial summary:
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "summary": {
      "totalInflow": 50000,
      "totalOutflow": 20000,
      "balance": 30000
    }
  }
}
```

### Create Transaction
**POST** `/transactions` _(admin/core only)_

Request body:
```json
{
  "type": "inflow",
  "amount": 25000,
  "purpose": "Sponsorship payment",
  "category": "sponsorship",
  "date": "2025-10-09T00:00:00Z",
  "receiptUrl": "https://example.com/receipt.pdf"
}
```

### Update Transaction
**PATCH** `/transactions/:id` _(admin/core only)_

---

## 📅 Events Endpoints

### Get All Events
**GET** `/events`

Query parameters:
- `core` - Filter by organizing core
- `status` - Filter by status
- `startDate` - Filter by start date
- `endDate` - Filter by end date

### Create Event
**POST** `/events` _(admin/core only)_

Request body:
```json
{
  "name": "Tech Symposium",
  "description": "Annual tech event",
  "core": "Events",
  "date": "2025-11-15T00:00:00Z",
  "venue": "Main Auditorium",
  "budget": 50000,
  "status": "planned"
}
```

### Update Event
**PATCH** `/events/:id` _(admin/core only)_

---

## 🤝 Sponsorships Endpoints

### Get All Sponsors
**GET** `/sponsors`

Query parameters:
- `stage` - Filter by stage
- `search` - Search by name/contact/email

Response includes summary:
```json
{
  "success": true,
  "data": {
    "sponsors": [...],
    "summary": {
      "total": 10,
      "confirmed": 3,
      "totalAmount": 100000
    }
  }
}
```

### Create Sponsor
**POST** `/sponsors` _(admin/core only)_

Request body:
```json
{
  "name": "TechCorp",
  "contactPerson": "Mr. Smith",
  "email": "contact@techcorp.com",
  "phone": "9876543210",
  "stage": "contacted",
  "amount": 50000,
  "followUpDate": "2025-10-20T00:00:00Z"
}
```

### Update Sponsor
**PATCH** `/sponsors/:id` _(admin/core only)_

---

## 🔧 Admin Endpoints

### Get Admin Updates
**GET** `/admin/updates`

Query parameters:
- `priority` - Filter by priority (low/normal/high/urgent)

### Create Admin Update
**POST** `/admin/updates` _(admin only)_

Request body:
```json
{
  "title": "Budget Meeting",
  "content": "All core leads must attend",
  "priority": "high"
}
```

### Get System Statistics
**GET** `/admin/stats` _(admin only)_

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 5,
    "totalMembers": 50,
    "totalNotes": 100,
    "totalTransactions": 30,
    "totalEvents": 10,
    "totalSponsors": 8,
    "pendingTransactions": 5,
    "upcomingEvents": 3,
    "financial": {
      "totalInflow": 100000,
      "totalOutflow": 40000,
      "balance": 60000
    }
  }
}
```

---

## 🔔 Follow-ups Endpoint

### Get Upcoming Follow-ups
**GET** `/followups`

Query parameters:
- `days` - Number of days ahead (default: 7)

Response:
```json
{
  "success": true,
  "data": {
    "notes": [...],
    "sponsors": [...],
    "events": [...],
    "summary": {
      "totalNotes": 5,
      "totalSponsors": 3,
      "totalEvents": 2,
      "total": 10
    }
  }
}
```

---

## 📊 Response Format

All responses follow this format:

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
  "message": "Error message",
  "errors": { ... }
}
```

---

## 🔒 Role-Based Access

- **Admin**: Full access to all endpoints
- **Core**: Access to their core's data + create/update operations
- **Member**: Read-only access to public data

---

## 💡 Tips

1. Always include the JWT token in the Authorization header
2. Use the X-Year header to filter data by year
3. Date fields should be in ISO 8601 format
4. All timestamps are in UTC
5. Use query parameters for filtering and pagination
