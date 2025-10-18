const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { authenticate, authorize, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/admin/updates - Get all admin updates
router.get('/updates', async (req, res, next) => {
    try {
        const { priority } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };
        if (priority) where.priority = priority;

        const updates = await prisma.adminUpdate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(res, updates, `Found ${updates.length} updates`);
    } catch (error) {
        next(error);
    }
});

// POST /api/admin/updates - Create admin update (admin only)
router.post('/updates', authorize('admin'), async (req, res, next) => {
    try {
        const { title, content, priority } = req.body;

        if (!title || !content) {
            return sendError(res, 'Title and content are required', 400);
        }

        const updateData = {
            title,
            content,
            year: req.year,
            priority: priority || 'normal',
        };

        const update = await prisma.adminUpdate.create({
            data: updateData,
        });

        return sendCreated(res, update, 'Admin update created successfully');
    } catch (error) {
        next(error);
    }
});

// PATCH /api/admin/updates/:id - Update admin update (admin only)
router.patch('/updates/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, priority } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (priority !== undefined) updateData.priority = priority;

        const update = await prisma.adminUpdate.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return sendSuccess(res, update, 'Admin update updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/updates/:id - Delete admin update (admin only)
router.delete('/updates/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.adminUpdate.delete({
            where: { id: parseInt(id) },
        });

        return sendSuccess(res, null, 'Admin update deleted successfully');
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authorize('admin'), async (req, res, next) => {
    try {
        const { role, core, year } = req.query;

        const where = {};
        if (role) where.role = role;
        if (core) where.core = core;
        if (year) where.year = year;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                role: true,
                core: true,
                year: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(res, users, `Found ${users.length} users`);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/admin/users/:id - Update user role/core (admin only)
router.patch('/users/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, core, year } = req.body;

        const updateData = {};
        if (role !== undefined) updateData.role = role;
        if (core !== undefined) updateData.core = core;
        if (year !== undefined) updateData.year = year;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                core: true,
                year: true,
            },
        });

        return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return sendError(res, 'Cannot delete your own account', 400);
        }

        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        return sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/stats - Get system statistics (admin only)
router.get('/stats', authorize('admin'), async (req, res, next) => {
    try {
        const year = req.year;

        // Gather statistics
        const [
            totalUsers,
            totalMembers,
            totalNotes,
            totalTransactions,
            totalEvents,
            totalSponsors,
            pendingTransactions,
            upcomingEvents,
        ] = await Promise.all([
            prisma.user.count({ where: { year } }),
            prisma.member.count({ where: { year } }),
            prisma.note.count({ where: { year } }),
            prisma.transaction.count({ where: { year } }),
            prisma.event.count({ where: { year } }),
            prisma.sponsor.count({ where: { year } }),
            prisma.transaction.count({ where: { year, status: 'pending' } }),
            prisma.event.count({
                where: {
                    year,
                    date: { gte: new Date() },
                    status: 'planned',
                },
            }),
        ]);

        // Financial summary
        const transactions = await prisma.transaction.findMany({
            where: { year, status: 'approved' },
            select: { type: true, amount: true },
        });

        const financialSummary = transactions.reduce(
            (acc, txn) => {
                if (txn.type === 'inflow') acc.totalInflow += txn.amount;
                else if (txn.type === 'outflow') acc.totalOutflow += txn.amount;
                return acc;
            }, { totalInflow: 0, totalOutflow: 0 }
        );

        financialSummary.balance = financialSummary.totalInflow - financialSummary.totalOutflow;

        const stats = {
            totalUsers,
            totalMembers,
            totalNotes,
            totalTransactions,
            totalEvents,
            totalSponsors,
            pendingTransactions,
            upcomingEvents,
            financial: financialSummary,
        };

        return sendSuccess(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;