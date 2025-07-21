// Bulk upload supplements to Firestore using Firebase Admin SDK
// Run: node scripts/upload-supplements-to-firestore-admin.cjs

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to your service account key JSON file
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json. Download it from Firebase Console > Project Settings > Service Accounts.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

async function main() {
  const supplementsPath = path.resolve(__dirname, '../updated-supplements.json');
  const supplementsRaw = fs.readFileSync(supplementsPath, 'utf-8');
  const supplements = JSON.parse(supplementsRaw);

  const batch = db.batch();
  for (const supplement of supplements) {
    const docRef = db.collection('supplements').doc(supplement.id);
    batch.set(docRef, supplement);
  }
  await batch.commit();
  console.log(`Uploaded ${supplements.length} supplements to Firestore.`);
}

main().catch(console.error);
