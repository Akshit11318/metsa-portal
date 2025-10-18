# MetSA Portal - Frontend & Backend Integration Guide

## 🔗 Backend Integration Setup

### 1. Environment Configuration

The frontend is configured to connect to the backend via environment variables.

**File: `frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_DEFAULT_YEAR=2025-26
```

### 2. API Configuration

**File: `frontend/src/lib/api.ts`**
- Exports `API_CONFIG` with base URL and endpoints
- Helper function `getApiUrl()` to construct full URLs

### 3. API Client

**File: `frontend/src/lib/apiClient.ts`**
- Enhanced fetch wrapper with:
  - Automatic JWT token injection
  - Error handling
  - Authentication error handling (401)
  - Helper functions: `apiGet`, `apiPost`, `apiPatch`, `apiDelete`

### 4. Authentication Store

**File: `frontend/src/store/authStore.ts`**
- Updated to use real backend API
- Stores JWT token and user info
- Persists auth state in localStorage
- Auto-logout on token expiry

---

## 📝 Default Credentials

| Username | Password | Role | Core |
|----------|----------|------|------|
| **admin** | **admin123** | Admin | - |
| events_lead | events123 | Core | Events |
| finops_lead | finops123 | Core | FinOps |
| sponsor_lead | sponsor123 | Core | Sponsorship |
| media_lead | media123 | Core | Media |

---

## 🔌 Usage Examples

### Example 1: Login (Already Integrated)

The login is already integrated in `authStore.ts`:

```typescript
import { useAuthStore } from '@/store/authStore';

// In your component
const { login, isAuthenticated, user } = useAuthStore();

const handleLogin = async () => {
  const success = await login('admin', 'admin123', '2025-26');
  if (success) {
    console.log('Logged in as:', user);
  }
};
```

### Example 2: Fetching Notes

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
import { apiGet } from '@/lib/apiClient';

// Get all notes
const fetchNotes = async () => {
  try {
    const response = await apiGet(getApiUrl(API_ENDPOINTS.NOTES));
    console.log('Notes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
  }
};
```

### Example 3: Creating a Member

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
import { apiPost } from '@/lib/apiClient';

const createMember = async (memberData) => {
  try {
    const response = await apiPost(
      getApiUrl(API_ENDPOINTS.MEMBERS),
      {
        name: 'John Doe',
        email: 'john@example.com',
        program: 'B.Tech',
        branch: 'CSE',
        joinYear: '2024-25',
        gradYear: '2028',
      }
    );
    console.log('Member created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
  }
};
```

### Example 4: Updating an Event

```typescript
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
import { apiPatch } from '@/lib/apiClient';

const updateEvent = async (eventId: number) => {
  try {
    const response = await apiPatch(
      `${getApiUrl(API_ENDPOINTS.EVENTS)}/${eventId}`,
      {
        status: 'completed',
      }
    );
    console.log('Event updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update event:', error);
  }
};
```

### Example 5: Using React Query (Recommended)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
import { apiGet, apiPost } from '@/lib/apiClient';

// Fetch notes
const useNotes = () => {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await apiGet(getApiUrl(API_ENDPOINTS.NOTES));
      return response.data;
    },
  });
};

// Create note mutation
const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noteData) => {
      const response = await apiPost(getApiUrl(API_ENDPOINTS.NOTES), noteData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};

// Usage in component
function NotesPage() {
  const { data: notes, isLoading, error } = useNotes();
  const createNote = useCreateNote();

  const handleCreateNote = () => {
    createNote.mutate({
      content: 'New note',
      visibility: 'all',
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreateNote}>Create Note</button>
      {notes?.map(note => <div key={note.id}>{note.content}</div>)}
    </div>
  );
}
```

---

## 🚀 Quick Start Steps

### Step 1: Start Both Servers

```bash
# From project root
chmod +x run.sh
./run.sh
```

This will start:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### Step 2: Open Frontend

```bash
# Open in browser
http://localhost:5173
```

### Step 3: Login

Use default credentials:
- Username: `admin`
- Password: `admin123`
- Year: `2025-26`

### Step 4: Test API Connection

Open browser console and check:
```javascript
// Should see successful login response
// JWT token stored in localStorage
localStorage.getItem('metsa-auth-storage')
```

---

## 🔍 Debugging

### Check Backend Connection

```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "MetSA Portal API is running",
  "version": "1.0.0",
  "year": "2025-26"
}
```

### Check Frontend .env

```bash
cat frontend/.env
```

Should show:
```
VITE_API_URL=http://localhost:5000/api
```

### Monitor Network Requests

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Check for:
   - Request to `http://localhost:5000/api/login`
   - Response with token
   - Status 200 OK

### Common Issues

**CORS Error:**
- Backend CORS is configured for `http://localhost:5173`
- Check backend `.env`: `CORS_ORIGIN=http://localhost:5173`

**401 Unauthorized:**
- Token expired or invalid
- Try logging in again

**Connection Refused:**
- Backend not running
- Check: `curl http://localhost:5000`

---

## 📚 Next Steps

1. **Update Login Page**
   - Import and use `useAuthStore`
   - Handle async login
   - Show error messages

2. **Create API Hooks**
   - Custom hooks for each resource (notes, members, events, etc.)
   - Use React Query for caching

3. **Implement Protected Routes**
   - Already have `ProtectedRoute` component
   - Ensure it checks `isAuthenticated`

4. **Add Loading States**
   - Show loaders during API calls
   - Handle errors gracefully

5. **Implement CRUD Operations**
   - Use `apiClient` helpers
   - Add forms for create/update
   - Confirm before delete

---

## 📖 API Documentation

For complete API documentation, see:
- `backend/API_DOCS.md` - Full API reference
- `backend/TESTING.md` - API testing guide

---

**Integration Status:** ✅ Ready to use!

The frontend is now configured to communicate with the backend. You can start building features that consume the API.
