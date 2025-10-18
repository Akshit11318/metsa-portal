require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { csrfProtection, setCsrfToken, getCsrfToken } = require('./middleware/csrf');

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const membersRoutes = require('./routes/members');
const finopsRoutes = require('./routes/finops');
const eventsRoutes = require('./routes/events');
const sponsorsRoutes = require('./routes/sponsors');
const adminRoutes = require('./routes/admin');
const followupsRoutes = require('./routes/followups');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow multiple origins for development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// CSRF Protection
app.use(setCsrfToken);
app.get('/api/csrf-token', getCsrfToken);
app.use(csrfProtection);

// Serve static files (for uploaded receipts and other files)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MetSA Portal API is running',
        version: '1.0.0',
        year: process.env.DEFAULT_YEAR || '2025',
    });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/transactions', finopsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/followups', followupsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   MetSA Portal Backend Server Started     ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📅 Default year: ${process.env.DEFAULT_YEAR || '2025'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    console.log(`🛡️  CSRF Protection: ${process.env.CSRF_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);

    console.log('\n📡 Available endpoints:');
    console.log('   GET  / - Health check');
    console.log('   POST /api/login - User login');
    console.log('   POST /api/logout - User logout');
    console.log('   GET  /api/user - Get current user');
    console.log('   *    /api/notes - Notes CRUD');
    console.log('   *    /api/members - Members CRUD');
    console.log('   *    /api/transactions - Transactions CRUD');
    console.log('   *    /api/events - Events CRUD');
    console.log('   *    /api/sponsors - Sponsors CRUD');
    console.log('   *    /api/admin - Admin operations');
    console.log('   GET  /api/followups - Get upcoming reminders');
    console.log('\n📝 Ready to accept requests!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});