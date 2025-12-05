const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout rapide pour basculer sur la mémoire
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('⚠️  MongoDB local non trouvé, démarrage de la base en mémoire...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`✅ In-Memory MongoDB Connected: ${uri}`);

      // Seed automatique pour la base en mémoire
      console.log('🌱 Seeding in-memory database...');
      const seedUsers = require('../../seed');
      await seedUsers();
    } catch (memError) {
      console.error(`❌ MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
