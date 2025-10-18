/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */

const crypto = require('crypto');

// Generate a secure CSRF token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF in development if disabled
    if (process.env.NODE_ENV !== 'production' || process.env.CSRF_ENABLED !== 'true') {
        return next();
    }

    // Skip CSRF for health check and public endpoints
    const publicPaths = ['/health', '/api/health'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    // Get CSRF token from header
    const token = req.headers['x-csrf-token'];
    const cookieToken = req.cookies ? .['csrf-token'];

    // Validate token
    if (!token || !cookieToken || token !== cookieToken) {
        return res.status(403).json({
            success: false,
            error: 'Invalid CSRF token',
            message: 'CSRF validation failed. Please refresh the page and try again.'
        });
    }

    next();
};

// Middleware to set CSRF token cookie
const setCsrfToken = (req, res, next) => {
    // Skip in development if disabled
    if (process.env.NODE_ENV !== 'production' || process.env.CSRF_ENABLED !== 'true') {
        return next();
    }

    // Generate new token if not exists
    if (!req.cookies ? .['csrf-token']) {
        const token = generateToken();

        // Set cookie with secure options
        res.cookie('csrf-token', token, {
            httpOnly: false, // Need to be accessible by JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
    }

    next();
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
    const token = req.cookies ? .['csrf-token'] || generateToken();

    res.cookie('csrf-token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
        success: true,
        csrfToken: token
    });
};

module.exports = {
    csrfProtection,
    setCsrfToken,
    getCsrfToken,
    generateToken
};