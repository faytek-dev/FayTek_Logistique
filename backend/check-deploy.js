const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification pré-déploiement Render...\n');

let errors = [];
let warnings = [];

// 1. Vérifier package.json
console.log('📦 Vérification du package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

    if (!packageJson.scripts || !packageJson.scripts.start) {
        errors.push('❌ Script "start" manquant dans package.json');
    } else if (packageJson.scripts.start !== 'node src/server.js') {
        warnings.push('⚠️  Script "start" devrait être "node src/server.js"');
    } else {
        console.log('✅ Script start OK');
    }

    if (!packageJson.engines || !packageJson.engines.node) {
        warnings.push('⚠️  Version Node non spécifiée dans "engines"');
    } else {
        console.log(`✅ Node version: ${packageJson.engines.node}`);
    }

    // Vérifier les dépendances critiques
    const requiredDeps = ['express', 'mongoose', 'dotenv', 'cors', 'jsonwebtoken', 'socket.io'];
    const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    if (missing.length > 0) {
        errors.push(`❌ Dépendances manquantes: ${missing.join(', ')}`);
    } else {
        console.log('✅ Dépendances critiques OK');
    }

} catch (err) {
    errors.push(`❌ Impossible de lire package.json: ${err.message}`);
}

// 2. Vérifier la structure des fichiers
console.log('\n📁 Vérification de la structure...');
const requiredFiles = [
    'src/server.js',
    'src/config/database.js',
    'src/routes/auth.js',
    'src/routes/tasks.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        errors.push(`❌ Fichier manquant: ${file}`);
    }
});

// 3. Vérifier .env.example
console.log('\n🔐 Vérification des variables d\'environnement...');
try {
    if (fs.existsSync(path.join(__dirname, '.env.example'))) {
        const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
        const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV', 'CORS_ORIGIN'];

        requiredVars.forEach(varName => {
            if (envExample.includes(varName)) {
                console.log(`✅ ${varName}`);
            } else {
                warnings.push(`⚠️  Variable manquante dans .env.example: ${varName}`);
            }
        });
    } else {
        warnings.push('⚠️  Fichier .env.example manquant');
    }
} catch (err) {
    warnings.push(`⚠️  Erreur lors de la lecture de .env.example: ${err.message}`);
}

// 4. Vérifier server.js utilise process.env.PORT
console.log('\n🌐 Vérification du port...');
try {
    const serverJs = fs.readFileSync(path.join(__dirname, 'src/server.js'), 'utf8');
    if (serverJs.includes('process.env.PORT')) {
        console.log('✅ process.env.PORT utilisé');
    } else {
        errors.push('❌ server.js n\'utilise pas process.env.PORT');
    }
} catch (err) {
    errors.push(`❌ Impossible de lire src/server.js: ${err.message}`);
}

// 5. Vérifier CORS configuration
console.log('\n🔒 Vérification CORS...');
try {
    const serverJs = fs.readFileSync(path.join(__dirname, 'src/server.js'), 'utf8');
    if (serverJs.includes('cors(')) {
        console.log('✅ CORS configuré');
    } else {
        warnings.push('⚠️  Configuration CORS non trouvée');
    }
} catch (err) {
    // Déjà géré ci-dessus
}

// Afficher le résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('='.repeat(50) + '\n');

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ ✅ ✅  TOUT EST PARFAIT ! ✅ ✅ ✅');
    console.log('\n🚀 Vous êtes prêt pour le déploiement Render!\n');
    process.exit(0);
} else {
    if (errors.length > 0) {
        console.log('❌ ERREURS CRITIQUES (à corriger) :\n');
        errors.forEach(err => console.log(`   ${err}`));
        console.log('');
    }

    if (warnings.length > 0) {
        console.log('⚠️  AVERTISSEMENTS (recommandé de corriger) :\n');
        warnings.forEach(warn => console.log(`   ${warn}`));
        console.log('');
    }

    if (errors.length > 0) {
        console.log('❌ Veuillez corriger les erreurs avant de déployer.\n');
        process.exit(1);
    } else {
        console.log('⚠️  Des avertissements ont été détectés, mais vous pouvez déployer.\n');
        process.exit(0);
    }
}
