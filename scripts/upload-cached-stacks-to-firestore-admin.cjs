// Bulk upload cached stacks to Firestore using Firebase Admin SDK
// Run: node scripts/upload-cached-stacks-to-firestore-admin.cjs

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
  const stacksPath = path.resolve(__dirname, '../cached-stacks.json');
  const stacksRaw = fs.readFileSync(stacksPath, 'utf-8');
  const stacks = JSON.parse(stacksRaw);

  const batch = db.batch();
  for (const stack of stacks) {
    // Use archetype as document ID
    const docRef = db.collection('cachedStacks').doc(stack.archetype);
    batch.set(docRef, stack);
  }
  await batch.commit();
  console.log(`Uploaded ${stacks.length} cached stacks to Firestore.`);
}

main().catch(console.error);
