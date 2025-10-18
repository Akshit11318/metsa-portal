const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { authenticate, authorize, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/sponsors - Get all sponsors
router.get('/', async (req, res, next) => {
    try {
        const { stage, search } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };

        if (stage) where.stage = stage;

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { contactPerson: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const sponsors = await prisma.sponsor.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Calculate summary
        const summary = {
            total: sponsors.length,
            confirmed: sponsors.filter(s => s.stage === 'confirmed').length,
            totalAmount: sponsors
                .filter(s => s.stage === 'confirmed' && s.amount)
                .reduce((sum, s) => sum + s.amount, 0),
        };

        return sendSuccess(res, { sponsors, summary }, `Found ${sponsors.length} sponsors`);
    } catch (error) {
        next(error);
    }
});

// POST /api/sponsors - Create new sponsor
router.post('/', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { name, contactPerson, email, phone, stage, amount, followUpDate, notesId } = req.body;

        if (!name) {
            return sendError(res, 'Name is required', 400);
        }

        const sponsorData = {
            name,
            year: req.year,
            stage: stage || 'prospective',
        };

        if (contactPerson) sponsorData.contactPerson = contactPerson;
        if (email) sponsorData.email = email;
        if (phone) sponsorData.phone = phone;
        if (amount) sponsorData.amount = parseFloat(amount);
        if (followUpDate) sponsorData.followUpDate = new Date(followUpDate);
        if (notesId) sponsorData.notesId = parseInt(notesId);

        const sponsor = await prisma.sponsor.create({
            data: sponsorData,
        });

        return sendCreated(res, sponsor, 'Sponsor created successfully');
    } catch (error) {
        next(error);
    }
});

// PATCH /api/sponsors/:id - Update sponsor
router.patch('/:id', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, email, phone, stage, amount, followUpDate } = req.body;

        const existingSponsor = await prisma.sponsor.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingSponsor) {
            return sendError(res, 'Sponsor not found', 404);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (stage !== undefined) updateData.stage = stage;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;

        const sponsor = await prisma.sponsor.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return sendSuccess(res, sponsor, 'Sponsor updated successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;