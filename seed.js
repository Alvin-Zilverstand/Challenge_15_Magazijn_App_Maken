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
            role: 'student'
        });

        // Create some test items
        const items = [
            {
                name: 'Laptop',
                location: 'Heerlen',
                quantity: 5
            },
            {
                name: 'Projector',
                location: 'Maastricht',
                quantity: 3
            },
            {
                name: 'Microscope',
                location: 'Sittard',
                quantity: 4
            },
            {
                name: 'Tablet',
                location: 'Heerlen',
                quantity: 10
            },
            {
                name: 'Camera',
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