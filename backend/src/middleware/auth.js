const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'No token provided', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return sendError(res, 'Invalid or expired token', 401);
            }

            req.user = decoded; // { id, username, role, core, year }
            next();
        });
    } catch (error) {
        return sendError(res, 'Authentication failed', 401);
    }
};

// Middleware to check user role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'Unauthorized', 401);
        }

        if (!roles.includes(req.user.role)) {
            return sendError(res, 'Insufficient permissions', 403);
        }

        next();
    };
}; // Middleware to extract and validate year from request
const extractYear = (req, res, next) => {
    // Get year from header, query, or use default
    const year = req.headers['x-year'] || req.query.year || (req.user && req.user.year) || process.env.DEFAULT_YEAR || '2025';
    req.year = year;
    next();
};

module.exports = {
    authenticate,
    authorize,
    extractYear,
};