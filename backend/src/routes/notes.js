const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated, sendNoContent } = require('../utils/response');
const { authenticate, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/notes - Get all notes with filters
router.get('/', async (req, res, next) => {
    try {
        const { core, status, relatedType, visibility, startDate, endDate } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };

        if (core) where.creator = { core };
        if (status) where.status = status;
        if (relatedType) where.relatedType = relatedType;
        if (visibility) where.visibility = visibility;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Role-based filtering
        if (req.user.role === 'core') {
            where.OR = [
                { visibility: 'all' },
                { visibility: 'core' },
                { visibility: 'admin' },
                { createdBy: req.user.id },
            ];
        } else if (req.user.role === 'member') {
            where.OR = [
                { visibility: 'all' },
                { createdBy: req.user.id },
            ];
        }

        const notes = await prisma.note.findMany({
            where,
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
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(res, notes, `Found ${notes.length} notes`);
    } catch (error) {
        next(error);
    }
});

// POST /api/notes - Create new note
router.post('/', async (req, res, next) => {
    try {
        const { content, visibility, relatedType, relatedId, status, followUpDate } = req.body;

        if (!content) {
            return sendError(res, 'Content is required', 400);
        }

        const noteData = {
            content,
            createdBy: req.user.id,
            role: req.user.role,
            visibility: visibility || 'all',
            year: req.year,
        };

        if (relatedType) noteData.relatedType = relatedType;
        if (relatedId) noteData.relatedId = parseInt(relatedId);
        if (status) noteData.status = status;
        if (followUpDate) noteData.followUpDate = new Date(followUpDate);

        const note = await prisma.note.create({
            data: noteData,
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
        });

        return sendCreated(res, note, 'Note created successfully');
    } catch (error) {
        next(error);
    }
});

// PATCH /api/notes/:id - Update note
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, visibility, status, followUpDate } = req.body;

        // Check if note exists and user has permission
        const existingNote = await prisma.note.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingNote) {
            return sendError(res, 'Note not found', 404);
        }

        // Only creator or admin can edit
        if (existingNote.createdBy !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 'Insufficient permissions to edit this note', 403);
        }

        const updateData = {};
        if (content !== undefined) updateData.content = content;
        if (visibility !== undefined) updateData.visibility = visibility;
        if (status !== undefined) updateData.status = status;
        if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;

        const note = await prisma.note.update({
            where: { id: parseInt(id) },
            data: updateData,
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
        });

        return sendSuccess(res, note, 'Note updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if note exists and user has permission
        const existingNote = await prisma.note.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingNote) {
            return sendError(res, 'Note not found', 404);
        }

        // Only creator or admin can delete
        if (existingNote.createdBy !== req.user.id && req.user.role !== 'admin') {
            return sendError(res, 'Insufficient permissions to delete this note', 403);
        }

        await prisma.note.delete({
            where: { id: parseInt(id) },
        });

        return sendNoContent(res, 'Note deleted successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;