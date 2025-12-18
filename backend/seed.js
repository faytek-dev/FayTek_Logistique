require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logistics');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const seedUsers = async () => {
    try {
        // Supprimer les utilisateurs existants
        await User.deleteMany({});
        console.log('🗑️  Existing users deleted');

        // Créer les utilisateurs par défaut
        const users = [
            {
                name: 'Admin User',
                email: 'superadmin@logistics.com',
                password: 'FayTek@2025',
                role: 'admin',
                phone: '+33 1 23 45 67 89',
                isActive: true
            },
            {
                name: 'Dispatcher User',
                email: 'dispatcher@logistics.com',
                password: 'dispatch123',
                role: 'dispatcher',
                phone: '+33 1 23 45 67 90',
                isActive: true
            },
            {
                name: 'Courier User 1',
                email: 'courier@logistics.com',
                password: 'courier123',
                role: 'courier',
                phone: '+33 6 12 34 56 78',
                isActive: true,
                availability: 'available',
                currentLocation: {
                    type: 'Point',
                    coordinates: [2.3522, 48.8566] // Paris
                }
            },
            {
                name: 'Courier User 2',
                email: 'courier2@logistics.com',
                password: 'courier123',
                role: 'courier',
                phone: '+33 6 98 76 54 32',
                isActive: true,
                availability: 'available',
                currentLocation: {
                    type: 'Point',
                    coordinates: [2.3488, 48.8534] // Paris - Louvre
                }
            }
        ];

        const createdUsers = await User.create(users);
        console.log(`✅ ${createdUsers.length} users created successfully`);

        console.log('\n📋 Default Users:');
        console.log('=====================================');
        createdUsers.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.role}123`);
            console.log(`  Name: ${user.name}`);
        });
        console.log('\n=====================================\n');

    } catch (error) {
        console.error('❌ Error seeding users:', error);
    }
};

module.exports = seedUsers;

if (require.main === module) {
    const run = async () => {
        await connectDB();
        await seedUsers();
        mongoose.connection.close();
        console.log('✅ Database seeding completed');
        process.exit(0);
    };

    run();
}
