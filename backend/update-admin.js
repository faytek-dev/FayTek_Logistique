const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const updateAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI manquant dans le fichier .env');
            process.exit(1);
        }

        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Connecté');

        const email = 'superadmin@logistics.com';
        const newPassword = 'FayTek@2025';

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`⚠️ Utilisateur ${email} non trouvé. Création...`);
            await User.create({
                name: 'Super Admin',
                email: email,
                password: newPassword,
                role: 'admin',
                isActive: true
            });
            console.log('✅ Utilisateur Admin créé avec succès');
        } else {
            user.password = newPassword;
            await user.save();
            console.log(`✅ Mot de passe pour ${email} mis à jour avec succès`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

updateAdmin();
