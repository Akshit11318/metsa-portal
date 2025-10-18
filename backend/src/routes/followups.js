const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess } = require('../utils/response');
const { authenticate, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/followups - Get all upcoming follow-ups and reminders
router.get('/', async (req, res, next) => {
    try {
        const { days } = req.query;
        const year = req.year;

        // Default to next 7 days
        const daysAhead = parseInt(days) || 7;
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);

        // Get notes with follow-up dates
        const notesWithFollowUps = await prisma.note.findMany({
            where: {
                year,
                followUpDate: {
                    gte: today,
                    lte: futureDate,
                },
                status: { not: 'complete' },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        core: true,
                    },
                },
            },
            orderBy: { followUpDate: 'asc' },
        });

        // Get sponsors with follow-up dates
        const sponsorsWithFollowUps = await prisma.sponsor.findMany({
            where: {
                year,
                followUpDate: {
                    gte: today,
                    lte: futureDate,
                },
                stage: { notIn: ['confirmed', 'rejected'] },
            },
            orderBy: { followUpDate: 'asc' },
        });

        // Get upcoming events
        const upcomingEvents = await prisma.event.findMany({
            where: {
                year,
                date: {
                    gte: today,
                    lte: futureDate,
                },
                status: { in: ['planned', 'ongoing'] },
            },
            orderBy: { date: 'asc' },
        });

        // Combine and categorize
        const followups = {
            notes: notesWithFollowUps,
            sponsors: sponsorsWithFollowUps,
            events: upcomingEvents,
            summary: {
                totalNotes: notesWithFollowUps.length,
                totalSponsors: sponsorsWithFollowUps.length,
                totalEvents: upcomingEvents.length,
                total: notesWithFollowUps.length + sponsorsWithFollowUps.length + upcomingEvents.length,
            },
        };

        return sendSuccess(res, followups, `Found ${followups.summary.total} follow-ups in the next ${daysAhead} days`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;