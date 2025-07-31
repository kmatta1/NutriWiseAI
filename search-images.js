const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function searchPatterns() {
    const [files] = await bucket.getFiles({ prefix: 'images/supplements/' });
    
    console.log('🔍 Searching for key supplement brands...\n');
    
    // Search patterns
    const patterns = ['optimum', 'bulk', 'now_foods', 'vitamin', 'creatine', 'whey'];
    
    for (const pattern of patterns) {
        const matches = files.filter(f => f.name.toLowerCase().includes(pattern));
        console.log(`📦 Files containing "${pattern}" (${matches.length} found):`);
        matches.slice(0, 3).forEach(f => console.log(`   - ${f.name}`));
        if (matches.length > 3) console.log(`   ... and ${matches.length - 3} more`);
        console.log('');
    }
    
    // Also look for specific product matches
    console.log('🎯 Looking for specific products...\n');
    
    // Whey protein
    const wheyFiles = files.filter(f => 
        f.name.toLowerCase().includes('whey') || 
        f.name.toLowerCase().includes('protein')
    );
    console.log(`🥛 Whey/Protein files (${wheyFiles.length} found):`);
    wheyFiles.slice(0, 5).forEach(f => console.log(`   - ${f.name}`));
    
    // Creatine
    const creatineFiles = files.filter(f => 
        f.name.toLowerCase().includes('creatine')
    );
    console.log(`\n💪 Creatine files (${creatineFiles.length} found):`);
    creatineFiles.slice(0, 5).forEach(f => console.log(`   - ${f.name}`));
    
    // Vitamin D3
    const vitaminFiles = files.filter(f => 
        f.name.toLowerCase().includes('vitamin') &&
        f.name.toLowerCase().includes('d')
    );
    console.log(`\n☀️ Vitamin D files (${vitaminFiles.length} found):`);
    vitaminFiles.slice(0, 5).forEach(f => console.log(`   - ${f.name}`));
}

searchPatterns().then(() => process.exit(0)).catch(console.error);
