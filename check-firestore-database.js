const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
    });
}

async function checkFirestoreDatabase() {
    try {
        console.log('🔍 Checking Firestore Database Connection...');
        console.log('===============================================');
        
        const db = admin.firestore();
        
        // List all collections
        console.log('📋 Listing all collections in Firestore...');
        const collections = await db.listCollections();
        
        if (collections.length === 0) {
            console.log('❌ No collections found in Firestore database!');
            console.log('');
            console.log('💡 This could mean:');
            console.log('   1. Database is empty');
            console.log('   2. Wrong database is being accessed');
            console.log('   3. Service account lacks database permissions');
            return;
        }
        
        console.log(`📁 Found ${collections.length} collections:`);
        for (const collection of collections) {
            console.log(`   - ${collection.id}`);
        }
        console.log('');
        
        // Check each collection
        for (const collection of collections) {
            try {
                const snapshot = await collection.limit(3).get();
                console.log(`📊 Collection "${collection.id}": ${snapshot.size} documents (showing first 3)`);
                
                snapshot.forEach((doc, index) => {
                    const data = doc.data();
                    console.log(`   ${index + 1}. Document ID: ${doc.id}`);
                    
                    // Show key fields
                    if (data.name) console.log(`      Name: ${data.name}`);
                    if (data.brand) console.log(`      Brand: ${data.brand}`);
                    if (data.imageUrl) console.log(`      Image URL: ${data.imageUrl.substring(0, 60)}...`);
                    if (data.storageImagePath) console.log(`      Storage Path: ${data.storageImagePath}`);
                    
                    console.log(`      Total fields: ${Object.keys(data).length}`);
                    console.log('');
                });
                
                // Get total count (more expensive but accurate)
                const allDocs = await collection.get();
                console.log(`   📊 Total documents in "${collection.id}": ${allDocs.size}`);
                console.log('');
                
            } catch (error) {
                console.log(`   ❌ Error reading collection "${collection.id}": ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking Firestore:', error);
        
        if (error.code === 'permission-denied') {
            console.log('');
            console.log('💡 Permission denied. Check:');
            console.log('   1. Service account has Firestore Database User role');
            console.log('   2. Firestore security rules allow admin access');
            console.log('   3. Database exists and is in the correct project');
        }
    }
}

async function checkFirestoreRules() {
    try {
        console.log('🔍 Testing Firestore Rules...');
        console.log('===============================================');
        
        const db = admin.firestore();
        
        // Try to read from products collection specifically
        console.log('🧪 Testing read access to "products" collection...');
        const productsRef = db.collection('products');
        const snapshot = await productsRef.limit(1).get();
        
        if (snapshot.empty) {
            console.log('⚠️  Products collection is empty or inaccessible');
        } else {
            console.log('✅ Products collection is accessible');
            const doc = snapshot.docs[0];
            console.log(`   Sample document ID: ${doc.id}`);
            console.log(`   Sample data keys: ${Object.keys(doc.data()).join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing Firestore rules:', error);
    }
}

async function main() {
    await checkFirestoreDatabase();
    await checkFirestoreRules();
    process.exit(0);
}

main();
