const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.adminUpdate.deleteMany();
    await prisma.sponsor.deleteMany();
    await prisma.event.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.note.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();

    console.log('✨ Cleared existing data');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const corePassword = await bcrypt.hash('core123', 10);

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            passwordHash: adminPassword,
            role: 'admin',
            year: '2025',
        },
    });

    const eventsLead = await prisma.user.create({
        data: {
            username: 'events_lead',
            passwordHash: await bcrypt.hash('events123', 10),
            role: 'core',
            core: 'Events',
            year: '2025',
        },
    });

    const finopsLead = await prisma.user.create({
        data: {
            username: 'finops_lead',
            passwordHash: await bcrypt.hash('finops123', 10),
            role: 'core',
            core: 'FinOps',
            year: '2025',
        },
    });

    const sponsorLead = await prisma.user.create({
        data: {
            username: 'sponsor_lead',
            passwordHash: await bcrypt.hash('sponsor123', 10),
            role: 'core',
            core: 'Sponsorship',
            year: '2025',
        },
    });

    const mediaLead = await prisma.user.create({
        data: {
            username: 'media_lead',
            passwordHash: await bcrypt.hash('media123', 10),
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
    console.log('\n📌 Default Login Credentials:');
    console.log('┌─────────────────┬──────────────┬──────────────┐');
    console.log('│ Username        │ Password     │ Role         │');
    console.log('├─────────────────┼──────────────┼──────────────┤');
    console.log('│ admin           │ admin123     │ Admin        │');
    console.log('│ events_lead     │ events123    │ Core - Events│');
    console.log('│ finops_lead     │ finops123    │ Core - FinOps│');
    console.log('│ sponsor_lead    │ sponsor123   │ Core - Sponsor│');
    console.log('│ media_lead      │ media123     │ Core - Media │');
    console.log('└─────────────────┴──────────────┴──────────────┘');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });