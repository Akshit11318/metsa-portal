const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { authenticate, authorize, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/events - Get all events
router.get('/', async (req, res, next) => {
    try {
        const { core, status, startDate, endDate } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };

        if (core) where.core = core;
        if (status) where.status = status;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: { date: 'desc' },
        });

        return sendSuccess(res, events, `Found ${events.length} events`);
    } catch (error) {
        next(error);
    }
});

// POST /api/events - Create new event
router.post('/', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { name, description, core, date, venue, status, budget, notesId } = req.body;

        if (!name || !core || !date) {
            return sendError(res, 'Name, core, and date are required', 400);
        }

        // Core users can only create events for their core
        if (req.user.role === 'core' && req.user.core !== core) {
            return sendError(res, 'You can only create events for your core', 403);
        }

        const eventData = {
            name,
            core,
            date: new Date(date),
            year: req.year,
            status: status || 'planned',
        };

        if (description) eventData.description = description;
        if (venue) eventData.venue = venue;
        if (budget) eventData.budget = parseFloat(budget);
        if (notesId) eventData.notesId = parseInt(notesId);

        const event = await prisma.event.create({
            data: eventData,
        });

        return sendCreated(res, event, 'Event created successfully');
    } catch (error) {
        next(error);
    }
});

// PATCH /api/events/:id - Update event
router.patch('/:id', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, core, date, venue, status, budget } = req.body;

        const existingEvent = await prisma.event.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingEvent) {
            return sendError(res, 'Event not found', 404);
        }

        // Core users can only update events for their core
        if (req.user.role === 'core' && req.user.core !== existingEvent.core) {
            return sendError(res, 'You can only update events for your core', 403);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (core !== undefined) updateData.core = core;
        if (date !== undefined) updateData.date = new Date(date);
        if (venue !== undefined) updateData.venue = venue;
        if (status !== undefined) updateData.status = status;
        if (budget !== undefined) updateData.budget = parseFloat(budget);

        const event = await prisma.event.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return sendSuccess(res, event, 'Event updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingEvent = await prisma.event.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingEvent) {
            return sendError(res, 'Event not found', 404);
        }

        // Core users can only delete events for their core
        if (req.user.role === 'core' && req.user.core !== existingEvent.core) {
            return sendError(res, 'You can only delete events for your core', 403);
        }

        await prisma.event.delete({
            where: { id: parseInt(id) },
        });

        return sendSuccess(res, null, 'Event deleted successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;