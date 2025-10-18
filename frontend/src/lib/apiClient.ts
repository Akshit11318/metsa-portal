import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from './api';

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    return match ? match[1] : null;
}

/**
 * Fetch and store CSRF token
 */
async function ensureCsrfToken(): Promise<string | null> {
    const existingToken = getCsrfToken();
    if (existingToken) {
        return existingToken;
    }

    try {
        // Fetch CSRF token from server
        const response = await fetch(`${API_CONFIG.BASE_URL}/csrf-token`, {
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data.csrfToken || getCsrfToken();
        }
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }

    return null;
}

/**
 * Enhanced fetch wrapper with authentication and error handling
 */
export async function apiFetch<T = any>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const { requireAuth = true, headers = {}, ...restOptions } = options;
    const { token } = useAuthStore.getState();

    // Build headers
    const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Year': API_CONFIG.DEFAULT_YEAR,
        ...headers,
    };

    // Add auth token if required and available
    if (requireAuth && token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
        const csrfToken = await ensureCsrfToken();
        if (csrfToken) {
            requestHeaders['X-CSRF-Token'] = csrfToken;
        }
    }

    try {
        const response = await fetch(url, {
            ...restOptions,
            headers: requestHeaders,
            credentials: 'include', // Include cookies
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle CSRF errors
            if (response.status === 403 && data.error === 'Invalid CSRF token') {
                // Try to refresh CSRF token and retry once
                await ensureCsrfToken();
                throw new Error('Security token expired. Please try again.');
            }

            // Handle authentication errors
            if (response.status === 401) {
                // Token expired or invalid
                useAuthStore.getState().logout();
                throw new Error('Session expired. Please login again.');
            }

            // Handle other errors
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
    endpoint: string,
    options?: RequestOptions
): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'GET',
        ...options,
    });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
    endpoint: string,
    options?: RequestOptions
): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'DELETE',
        ...options,
    });
}
