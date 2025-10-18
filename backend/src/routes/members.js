const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated, sendNoContent } = require('../utils/response');
const { authenticate, authorize, extractYear } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configure multer for CSV uploads
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/members - Get all members
router.get('/', async (req, res, next) => {
    try {
        const { search } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { rollNo: { contains: search } },
                { program: { contains: search } },
            ];
        }

        const members = await prisma.member.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return sendSuccess(res, members, `Found ${members.length} members`);
    } catch (error) {
        next(error);
    }
});

// POST /api/members - Create new member (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
    try {
        const { name, rollNo, program, joinYear, gradYear } = req.body;

        if (!name || !program || !joinYear) {
            return sendError(res, 'Name, program, and join year are required', 400);
        }

        const memberData = {
            name,
            program,
            joinYear,
            gradYear: gradYear || '',
            year: req.year,
        };

        if (rollNo) memberData.rollNo = rollNo;

        const member = await prisma.member.create({
            data: memberData,
        });

        return sendCreated(res, member, 'Member created successfully');
    } catch (error) {
        next(error);
    }
});

// POST /api/members/upload-csv - Upload CSV file and create members (admin only)
router.post('/upload-csv', authorize('admin'), upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }
        const results = [];
        const errors = [];

        // Read and parse CSV
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const created = [];
                    const skipped = [];

                    for (let i = 0; i < results.length; i++) {
                        const row = results[i];

                        // Map CSV columns (case-insensitive)
                        const name = row.name || row.Name || row.NAME;
                        const rollNo = row.rollNo || row.rollno || row.RollNo || row.ROLLNO || row['Roll No'] || row['roll no'];
                        const program = row.program || row.Program || row.PROGRAM || 'B.Tech';
                        const joinYear = row.joinYear || row.joinyear || row.JoinYear || row['Join Year'] || row['join year'];
                        const gradYear = row.gradYear || row.gradyear || row.GradYear || row['Grad Year'] || row['grad year'] || '';

                        // Validate required fields
                        if (!name || !program || !joinYear) {
                            skipped.push({
                                row: i + 1,
                                reason: 'Missing required fields (name, program, joinYear)',
                                data: row
                            });
                            continue;
                        }

                        try {
                            const memberData = {
                                name: name.trim(),
                                program: program.trim(),
                                joinYear: joinYear.trim(),
                                gradYear: gradYear ? gradYear.trim() : '',
                                year: req.year,
                            };

                            if (rollNo) memberData.rollNo = rollNo.trim();

                            const member = await prisma.member.create({
                                data: memberData,
                            });

                            created.push(member);
                        } catch (error) {
                            skipped.push({
                                row: i + 1,
                                reason: error.message,
                                data: row
                            });
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    return sendSuccess(res, {
                        created: created.length,
                        skipped: skipped.length,
                        members: created,
                        errors: skipped
                    }, `Successfully imported ${created.length} members, ${skipped.length} skipped`);

                } catch (error) {
                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);
                    next(error);
                }
            })
            .on('error', (error) => {
                // Clean up uploaded file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                next(error);
            });

    } catch (error) {
        // Clean up uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});

// PATCH /api/members/:id - Update member (admin only)
router.patch('/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, rollNo, program, joinYear, gradYear } = req.body;

        const existingMember = await prisma.member.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingMember) {
            return sendError(res, 'Member not found', 404);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (rollNo !== undefined) updateData.rollNo = rollNo;
        if (program !== undefined) updateData.program = program;
        if (joinYear !== undefined) updateData.joinYear = joinYear;
        if (gradYear !== undefined) updateData.gradYear = gradYear;

        const member = await prisma.member.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return sendSuccess(res, member, 'Member updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE /api/members/:id - Delete member (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingMember = await prisma.member.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingMember) {
            return sendError(res, 'Member not found', 404);
        }

        // Delete associated notes first
        await prisma.note.deleteMany({
            where: {
                relatedType: 'member',
                relatedId: parseInt(id),
            },
        });

        await prisma.member.delete({
            where: { id: parseInt(id) },
        });

        return sendNoContent(res, 'Member deleted successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;