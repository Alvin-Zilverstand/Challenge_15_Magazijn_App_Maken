const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Item.deleteMany({});

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            password: adminPassword,
            role: 'admin'
        });

        // Create test student
        const studentPassword = await bcrypt.hash('student123', 10);
        await User.create({
            username: 'student',
            password: studentPassword,
            email: '123456@vistacollege.nl',
            role: 'student'
        });

        // Create some test items with multilingual support
        const items = [
            {
                name: {
                    en: 'Laptop',
                    nl: 'Laptop'
                },
                description: {
                    en: 'High-performance laptop for programming and design work',
                    nl: 'Krachtige laptop voor programmeren en ontwerpwerk'
                },
                location: 'Heerlen',
                quantity: 5
            },
            {
                name: {
                    en: 'Projector',
                    nl: 'Beamer'
                },
                description: {
                    en: 'HD projector for presentations and lectures',
                    nl: 'HD-beamer voor presentaties en lezingen'
                },
                location: 'Maastricht',
                quantity: 3
            },
            {
                name: {
                    en: 'Microscope',
                    nl: 'Microscoop'
                },
                description: {
                    en: 'Digital microscope for laboratory work',
                    nl: 'Digitale microscoop voor laboratoriumwerk'
                },
                location: 'Sittard',
                quantity: 4
            },
            {
                name: {
                    en: 'Tablet',
                    nl: 'Tablet'
                },
                description: {
                    en: 'Portable tablet for mobile learning and presentations',
                    nl: 'Draagbare tablet voor mobiel leren en presentaties'
                },
                location: 'Heerlen',
                quantity: 10
            },
            {
                name: {
                    en: 'Camera',
                    nl: 'Camera'
                },
                description: {
                    en: 'Professional DSLR camera for photography courses',
                    nl: 'Professionele spiegelreflexcamera voor fotografiecursussen'
                },
                location: 'Maastricht',
                quantity: 2
            }
        ];

        await Item.insertMany(items);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();