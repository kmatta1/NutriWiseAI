// Upload supplement images to Firebase Storage and update Firestore with their URLs
// Run: node scripts/upload-supplement-images-to-storage-and-firestore.cjs

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Missing serviceAccountKey.json.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: "nutriwise-ai-3fmvs.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

function getLocalImagePath(imageUrl) {
  // Remove leading slash and prepend 'public/'
  if (!imageUrl) return null;
  return path.resolve(__dirname, '../public' + imageUrl);
}

async function uploadImageAndUpdateFirestore(supplement) {
  const localImagePath = getLocalImagePath(supplement.imageUrl);
  if (!localImagePath || !fs.existsSync(localImagePath)) {
    console.warn(`Image not found for ${supplement.id}: ${localImagePath}`);
    return;
  }
  const destFileName = `supplement-images/${supplement.id}${path.extname(localImagePath)}`;
  await bucket.upload(localImagePath, {
    destination: destFileName,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  const file = bucket.file(destFileName);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2030',
  });
  await db.collection('supplements').doc(supplement.id).update({
    imageUrl: url,
  });
  console.log(`Uploaded and updated Firestore for ${supplement.id}`);
}

async function main() {
  const supplementsPath = path.resolve(__dirname, '../updated-supplements.json');
  const supplementsRaw = fs.readFileSync(supplementsPath, 'utf-8');
  const supplements = JSON.parse(supplementsRaw);
  for (const supplement of supplements) {
    await uploadImageAndUpdateFirestore(supplement);
  }
  console.log('All images processed.');
}

main().catch(console.error);
