const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Function to generate strong random password
function generateStrongPassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }

    return password;
}

async function main() {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUserCount = await prisma.user.count().catch(() => 0);
    if (existingUserCount > 0) {
        console.log(`⚠️  Database already has ${existingUserCount} users. Skipping seed to preserve existing data.`);
        console.log('💡 If you want to re-seed, manually delete the database and restart the container.');
        return;
    }

    // Clear existing data - wrapped in try-catch to handle missing tables
    console.log('🗑️  Clearing existing data...');

    try {
        await prisma.adminUpdate.deleteMany();
    } catch (e) {
        console.log('⚠️  AdminUpdate table not found, skipping...');
    }

    try {
        await prisma.sponsor.deleteMany();
    } catch (e) {
        console.log('⚠️  Sponsor table not found, skipping...');
    }

    try {
        await prisma.event.deleteMany();
    } catch (e) {
        console.log('⚠️  Event table not found, skipping...');
    }

    try {
        await prisma.transaction.deleteMany();
    } catch (e) {
        console.log('⚠️  Transaction table not found, skipping...');
    }

    try {
        await prisma.note.deleteMany();
    } catch (e) {
        console.log('⚠️  Note table not found, skipping...');
    }

    try {
        await prisma.member.deleteMany();
    } catch (e) {
        console.log('⚠️  Member table not found, skipping...');
    }

    try {
        await prisma.user.deleteMany();
    } catch (e) {
        console.log('⚠️  User table not found, skipping...');
    }

    console.log('✨ Cleared existing data');

    // Generate strong random passwords
    const passwords = {
        admin: generateStrongPassword(),
        events_lead: generateStrongPassword(),
        finops_lead: generateStrongPassword(),
        sponsor_lead: generateStrongPassword(),
        media_lead: generateStrongPassword(),
    };

    // Create users with strong passwords
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            passwordHash: await bcrypt.hash(passwords.admin, 10),
            role: 'admin',
            year: '2025',
        },
    });

    const eventsLead = await prisma.user.create({
        data: {
            username: 'events_lead',
            passwordHash: await bcrypt.hash(passwords.events_lead, 10),
            role: 'core',
            core: 'Events',
            year: '2025',
        },
    });

    const finopsLead = await prisma.user.create({
        data: {
            username: 'finops_lead',
            passwordHash: await bcrypt.hash(passwords.finops_lead, 10),
            role: 'core',
            core: 'FinOps',
            year: '2025',
        },
    });

    const sponsorLead = await prisma.user.create({
        data: {
            username: 'sponsor_lead',
            passwordHash: await bcrypt.hash(passwords.sponsor_lead, 10),
            role: 'core',
            core: 'Sponsorship',
            year: '2025',
        },
    });

    const mediaLead = await prisma.user.create({
        data: {
            username: 'media_lead',
            passwordHash: await bcrypt.hash(passwords.media_lead, 10),
            role: 'core',
            core: 'Media',
            year: '2025',
        },
    });

    console.log('👤 Created users:', {
        admin: admin.username,
        eventsLead: eventsLead.username,
        finopsLead: finopsLead.username,
        sponsorLead: sponsorLead.username,
        mediaLead: mediaLead.username,
    });

    // Store passwords for credentials file (will be handled by setup script)
    global.generatedPasswords = passwords;

    // Create sample members
    const members = await Promise.all([
        prisma.member.create({
            data: {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '9876543210',
                program: 'B.Tech',
                branch: 'CSE',
                core: 'Events',
                joinYear: '2024-25',
                gradYear: '2028',
                year: '2025',
                status: 'active',
            },
        }),
        prisma.member.create({
            data: {
                name: 'Priya Verma',
                email: 'priya@example.com',
                phone: '9876543211',
                program: 'B.Tech',
                branch: 'ECE',
                core: 'Media',
                joinYear: '2024-25',
                gradYear: '2028',
                year: '2025',
                status: 'active',
            },
        }),
        prisma.member.create({
            data: {
                name: 'Amit Patel',
                email: 'amit@example.com',
                phone: '9876543212',
                program: 'M.Tech',
                branch: 'CSE',
                core: 'FinOps',
                joinYear: '2023-24',
                gradYear: '2026',
                year: '2025',
                status: 'active',
            },
        }),
    ]);

    console.log('👥 Created members:', members.length);

    // Create sample notes
    const notes = await Promise.all([
        prisma.note.create({
            data: {
                content: 'Follow up with venue for annual fest',
                createdBy: eventsLead.id,
                role: 'core',
                visibility: 'all',
                relatedType: 'event',
                status: 'pending',
                followUpDate: new Date('2025-10-15'),
                year: '2025',
            },
        }),
        prisma.note.create({
            data: {
                content: 'Contact potential sponsors by Friday',
                createdBy: sponsorLead.id,
                role: 'core',
                visibility: 'all',
                relatedType: 'sponsor',
                status: 'pending',
                followUpDate: new Date('2025-10-12'),
                year: '2025',
            },
        }),
        prisma.note.create({
            data: {
                content: 'Submit expense report for March',
                createdBy: finopsLead.id,
                role: 'core',
                visibility: 'core',
                relatedType: 'transaction',
                status: 'pending',
                followUpDate: new Date('2025-10-10'),
                year: '2025',
            },
        }),
    ]);

    console.log('📝 Created notes:', notes.length);

    // Create sample transactions
    const transactions = await Promise.all([
        prisma.transaction.create({
            data: {
                type: 'inflow',
                amount: 25000,
                purpose: 'Sponsorship from TechCorp',
                category: 'sponsorship',
                approver: admin.id,
                status: 'approved',
                date: new Date('2025-09-15'),
                year: '2025',
            },
        }),
        prisma.transaction.create({
            data: {
                type: 'outflow',
                amount: 8000,
                purpose: 'Event venue booking',
                category: 'event',
                approver: admin.id,
                status: 'approved',
                date: new Date('2025-09-20'),
                year: '2025',
            },
        }),
        prisma.transaction.create({
            data: {
                type: 'outflow',
                amount: 3500,
                purpose: 'Marketing materials',
                category: 'operational',
                status: 'pending',
                date: new Date('2025-10-05'),
                year: '2025',
            },
        }),
    ]);

    console.log('💰 Created transactions:', transactions.length);

    // Create sample events
    const events = await Promise.all([
        prisma.event.create({
            data: {
                name: 'Tech Symposium 2025',
                description: 'Annual technical symposium',
                core: 'Events',
                date: new Date('2025-11-15'),
                venue: 'Main Auditorium',
                status: 'planned',
                budget: 50000,
                year: '2025',
            },
        }),
        prisma.event.create({
            data: {
                name: 'Workshop: AI & ML',
                description: 'Hands-on workshop on Machine Learning',
                core: 'Events',
                date: new Date('2025-10-20'),
                venue: 'Computer Lab',
                status: 'planned',
                budget: 15000,
                year: '2025',
            },
        }),
    ]);

    console.log('📅 Created events:', events.length);

    // Create sample sponsors
    const sponsors = await Promise.all([
        prisma.sponsor.create({
            data: {
                name: 'TechCorp Solutions',
                contactPerson: 'Mr. Agarwal',
                email: 'contact@techcorp.com',
                phone: '9876543213',
                stage: 'confirmed',
                amount: 50000,
                year: '2025',
            },
        }),
        prisma.sponsor.create({
            data: {
                name: 'StartupHub Inc',
                contactPerson: 'Ms. Reddy',
                email: 'info@startuphub.com',
                phone: '9876543214',
                stage: 'negotiating',
                amount: 30000,
                followUpDate: new Date('2025-10-18'),
                year: '2025',
            },
        }),
        prisma.sponsor.create({
            data: {
                name: 'Digital Innovations',
                contactPerson: 'Mr. Kumar',
                email: 'hello@digitalinnovations.com',
                stage: 'contacted',
                followUpDate: new Date('2025-10-14'),
                year: '2025',
            },
        }),
    ]);

    console.log('🤝 Created sponsors:', sponsors.length);

    // Create sample admin updates
    const updates = await Promise.all([
        prisma.adminUpdate.create({
            data: {
                title: 'Annual Fest Planning',
                content: 'All core leads must submit their event proposals by Oct 15th',
                priority: 'high',
                year: '2025',
            },
        }),
        prisma.adminUpdate.create({
            data: {
                title: 'Budget Meeting',
                content: 'Budget allocation meeting scheduled for Oct 12th at 4 PM',
                priority: 'urgent',
                year: '2025',
            },
        }),
    ]);

    console.log('📢 Created admin updates:', updates.length);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📌 Generated Login Credentials (SAVE THESE SECURELY!):');
    console.log('┌─────────────────┬────────────────────┬──────────────────┐');
    console.log('│ Username        │ Password           │ Role             │');
    console.log('├─────────────────┼────────────────────┼──────────────────┤');
    console.log(`│ admin           │ ${passwords.admin.padEnd(18)} │ Admin            │`);
    console.log(`│ events_lead     │ ${passwords.events_lead.padEnd(18)} │ Core - Events    │`);
    console.log(`│ finops_lead     │ ${passwords.finops_lead.padEnd(18)} │ Core - FinOps    │`);
    console.log(`│ sponsor_lead    │ ${passwords.sponsor_lead.padEnd(18)} │ Core - Sponsor   │`);
    console.log(`│ media_lead      │ ${passwords.media_lead.padEnd(18)} │ Core - Media     │`);
    console.log('└─────────────────┴────────────────────┴──────────────────┘');
    console.log('\n⚠️  IMPORTANT: Save these passwords securely and change them after first login!');

    // Return passwords so setup script can save them
    return passwords;
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });