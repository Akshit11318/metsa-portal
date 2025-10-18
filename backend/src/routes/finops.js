const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { authenticate, authorize, extractYear } = require('../middleware/auth');

const prisma = new PrismaClient();

// Configure multer for receipt uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/receipts/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
        }
    }
});

// Apply authentication and year extraction to all routes
router.use(authenticate);
router.use(extractYear);

// GET /api/transactions - Get all transactions
router.get('/', async (req, res, next) => {
    try {
        const { type, status, category, startDate, endDate } = req.query;
        const year = req.year;

        // Build filter
        const where = { year };

        if (type) where.type = type;
        if (status) where.status = status;
        if (category) where.category = category;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                approvedBy: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        // Calculate summary
        const summary = transactions.reduce(
            (acc, txn) => {
                if (txn.status === 'approved') {
                    if (txn.type === 'inflow') {
                        acc.totalInflow += txn.amount;
                    } else if (txn.type === 'outflow') {
                        acc.totalOutflow += txn.amount;
                    }
                }
                return acc;
            }, { totalInflow: 0, totalOutflow: 0 }
        );

        summary.balance = summary.totalInflow - summary.totalOutflow;

        return sendSuccess(res, { transactions, summary }, `Found ${transactions.length} transactions`);
    } catch (error) {
        next(error);
    }
});

// POST /api/transactions/upload-receipt - Upload receipt file
router.post('/upload-receipt', authorize('admin', 'core'), upload.single('receipt'), async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const receiptUrl = `/uploads/receipts/${req.file.filename}`;
        return sendCreated(res, { receiptUrl }, 'Receipt uploaded successfully');
    } catch (error) {
        next(error);
    }
});

// POST /api/transactions - Create new transaction
router.post('/', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { type, amount, purpose, category, status, notesId, receiptUrl, date } = req.body;

        if (!type || !amount || !purpose || !date) {
            return sendError(res, 'Type, amount, purpose, and date are required', 400);
        }

        if (!['inflow', 'outflow'].includes(type)) {
            return sendError(res, 'Type must be either "inflow" or "outflow"', 400);
        }

        const transactionData = {
            type,
            amount: parseFloat(amount),
            purpose,
            date: new Date(date),
            year: req.year,
            status: status || 'pending',
        };

        if (category) transactionData.category = category;
        if (notesId) transactionData.notesId = parseInt(notesId);
        if (receiptUrl) transactionData.receiptUrl = receiptUrl;

        // Auto-approve if admin
        if (req.user.role === 'admin') {
            transactionData.status = 'approved';
            transactionData.approver = req.user.id;
        }

        const transaction = await prisma.transaction.create({
            data: transactionData,
            include: {
                approvedBy: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    },
                },
            },
        });

        return sendCreated(res, transaction, 'Transaction created successfully');
    } catch (error) {
        next(error);
    }
});

// PATCH /api/transactions/:id - Update transaction
router.patch('/:id', authorize('admin', 'core'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, amount, purpose, category, status, receiptUrl, date } = req.body;

        const existingTransaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingTransaction) {
            return sendError(res, 'Transaction not found', 404);
        }

        const updateData = {};
        if (type !== undefined) {
            if (!['inflow', 'outflow'].includes(type)) {
                return sendError(res, 'Type must be either "inflow" or "outflow"', 400);
            }
            updateData.type = type;
        }
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (purpose !== undefined) updateData.purpose = purpose;
        if (category !== undefined) updateData.category = category;
        if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
        if (date !== undefined) updateData.date = new Date(date);

        // Only admin can approve/reject
        if (status !== undefined && req.user.role === 'admin') {
            updateData.status = status;
            if (status === 'approved') {
                updateData.approver = req.user.id;
            }
        }

        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                approvedBy: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                    },
                },
            },
        });

        return sendSuccess(res, transaction, 'Transaction updated successfully');
    } catch (error) {
        next(error);
    }
});

module.exports = router;