// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    BACKEND_URL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
    TIMEOUT: 30000,
    DEFAULT_YEAR: '2025',
};

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER: '/user',

    // Notes
    NOTES: '/notes',

    // Members
    MEMBERS: '/members',

    // Transactions (FinOps)
    TRANSACTIONS: '/transactions',
    FINOPS: '/transactions',

    // Events
    EVENTS: '/events',

    // Sponsors
    SPONSORS: '/sponsors',

    // Admin
    ADMIN_UPDATES: '/admin/updates',
    ADMIN_STATS: '/admin/stats',
    ADMIN_USERS: '/admin/users',

    // Follow-ups
    FOLLOWUPS: '/followups',
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get backend file URL (for static files like uploads)
export const getBackendFileUrl = (path: string) => {
    // If path already starts with http, return as is
    if (path.startsWith('http')) {
        return path;
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_CONFIG.BACKEND_URL}/${cleanPath}`;
};
