const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/login - User authentication
router.post('/login', async (req, res, next) => {
    try {
        const { username, password, year } = req.body;

        // Validation
        if (!username || !password) {
            return sendError(res, 'Username and password are required', 400);
        }

        const operationalYear = year || process.env.DEFAULT_YEAR || '2025';

        // Find user
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                passwordHash: true,
                role: true,
                core: true,
                year: true,
            },
        });

        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Generate JWT token
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            core: user.core,
            year: operationalYear,
        },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        // Send response
        return sendSuccess(res, {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                core: user.core,
                year: operationalYear,
            },
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
});

// POST /api/logout - User logout (client-side token removal)
router.post('/logout', authenticate, async (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for consistency and can be extended for token blacklisting
    return sendSuccess(res, null, 'Logout successful');
});

// GET /api/user - Get current user info
router.get('/user', authenticate, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                role: true,
                core: true,
                year: true,
                createdAt: true,
            },
        });

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;