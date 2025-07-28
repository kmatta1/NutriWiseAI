// subscribe-products.js
// Real-time listener for Firestore productCatalog collection

const admin = require('firebase-admin');
const path = require('path');

// Load service account key
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('📡 Listening for real-time product updates...');

// Subscribe to real-time updates
const unsubscribe = db.collection('productCatalog').onSnapshot(
  snapshot => {
    console.clear();
    console.log(`🏷️  ${snapshot.size} products:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name} (${data.imageUrl || 'no image'})`);
    });
  },
  error => {
    console.error('🔴 Listen error:', error);
  }
);

// Handle process exit to unsubscribe
process.on('SIGINT', () => {
  unsubscribe();
  console.log('\n🛑 Listener stopped.');
  process.exit();
});
