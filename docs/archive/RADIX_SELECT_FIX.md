# Radix UI Select Component Fix

## Issue
Radix UI Select components throw an error when SelectItem has an empty string as value:
```
Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string
```

## Root Cause
In `Notes.tsx`, filter dropdown SelectItems were using `value=""` for the "All" option:
- Status filter: `<SelectItem value="">All statuses</SelectItem>`
- Related Type filter: `<SelectItem value="">All types</SelectItem>`
- Visibility filter: `<SelectItem value="">All</SelectItem>`

Radix UI's Select component requires non-empty string values for all SelectItem components.

## Solution Applied

### 1. Updated Filter State Initialization
**File**: `frontend/src/pages/Notes.tsx`

Changed default filter values from empty strings to specific 'all' values:
```typescript
// Before
const [filters, setFilters] = useState({
  status: '',
  relatedType: '',
  visibility: '',
  search: '',
});

// After
const [filters, setFilters] = useState({
  status: 'all',
  relatedType: 'all',
  visibility: 'all_visibility',
  search: '',
});
```

**Note**: Used `'all_visibility'` instead of `'all'` to avoid collision with the actual visibility value `'all'` (which means "Everyone can see").

### 2. Updated SelectItem Values

#### Status Filter
```tsx
<SelectContent>
  <SelectItem value="all">All statuses</SelectItem>
  <SelectItem value="pending">Pending</SelectItem>
  <SelectItem value="complete">Complete</SelectItem>
  <SelectItem value="archived">Archived</SelectItem>
</SelectContent>
```

#### Related Type Filter
```tsx
<SelectContent>
  <SelectItem value="all">All types</SelectItem>
  <SelectItem value="member">Member</SelectItem>
  <SelectItem value="event">Event</SelectItem>
  <SelectItem value="sponsor">Sponsor</SelectItem>
  <SelectItem value="transaction">Transaction</SelectItem>
</SelectContent>
```

#### Visibility Filter
```tsx
<SelectContent>
  <SelectItem value="all_visibility">All Visibility</SelectItem>
  <SelectItem value="all">Everyone</SelectItem>
  <SelectItem value="core">Core Only</SelectItem>
  <SelectItem value="admin">Admin Only</SelectItem>
</SelectContent>
```

### 3. Updated Filter Logic
Modified the filter useEffect to check for 'all' values:

```typescript
// Before
if (filters.status) {
  filtered = filtered.filter((note) => note.status === filters.status);
}

// After
if (filters.status && filters.status !== 'all') {
  filtered = filtered.filter((note) => note.status === filters.status);
}
```

Applied same pattern to all three filters (status, relatedType, visibility).

### 4. Updated Clear Filters Button
```typescript
// Before
onClick={() =>
  setFilters({ status: '', relatedType: '', visibility: '', search: '' })
}

// After
onClick={() =>
  setFilters({ status: 'all', relatedType: 'all', visibility: 'all_visibility', search: '' })
}
```

### 5. Updated Filter Active State Check
```typescript
// Before
{(filters.search || filters.status || filters.relatedType || filters.visibility) && (

// After
{(filters.search || filters.status !== 'all' || filters.relatedType !== 'all' || filters.visibility !== 'all_visibility') && (
```

## Backend Compatibility

The backend filter logic in `backend/src/routes/notes.js` only applies filters when the query parameter is truthy:

```javascript
if (status) where.status = status;
if (relatedType) where.relatedType = relatedType;
if (visibility) where.visibility = visibility;
```

Since we check `!== 'all'` in the frontend before applying filters, the 'all' values never get sent to the backend, maintaining compatibility.

## Valid Values Reference

### Status Values
- `'pending'` - Note is pending action
- `'complete'` - Note is completed
- `'archived'` - Note is archived

### Visibility Values
- `'all'` - Everyone can see (default)
- `'core'` - Only core members can see
- `'admin'` - Only admins can see

### Related Type Values
- `'member'` - Related to a member
- `'event'` - Related to an event
- `'sponsor'` - Related to a sponsor
- `'transaction'` - Related to a financial transaction

## Testing Checklist
- [x] Status filter dropdown works without errors
- [x] Related Type filter dropdown works without errors
- [x] Visibility filter dropdown works without errors
- [x] Clear filters button resets all dropdowns to "All" option
- [x] Filter logic correctly shows all items when "All" is selected
- [x] Filter logic correctly filters items when specific value is selected
- [x] No console errors from Radix UI Select component

## Best Practice for Radix UI Select
When implementing Radix UI Select components:
1. Never use empty string `""` as a SelectItem value
2. Use meaningful string values like `'all'`, `'none'`, `'default'`
3. Handle the special value in your filter/logic code
4. Avoid value collisions (e.g., use `'all_visibility'` when `'all'` is a valid data value)
