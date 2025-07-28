/**
 * Server-side seeding of real JPEG product images into Firebase Storage and Firestore
 * Replaces Amazon/Unsplash URLs with actual images stored in your storage bucket
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nutriwiseai-f8bd1',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'nutriwiseai-f8bd1.appspot.com'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function seedRealImages() {
  console.log('🔧 Starting real image seeding...');
  const productRef = db.collection('productCatalog');
  const snapshot = await productRef.get();
  console.log(`📦 Found ${snapshot.size} products in catalog`);

  for (const doc of snapshot.docs) {
    const id = doc.id;
    const data = doc.data();
    const localImage = path.join(__dirname, '..', 'public', 'product-images', `${id}.jpg`);

    if (!fs.existsSync(localImage)) {
      console.log(`⚠️  No local image file for product ${id} (${data.name || ''})`);
      continue;
    }

    try {
      const destination = `product-images/${id}.jpg`;
      console.log(`⬆️  Uploading ${localImage} to ${destination}`);
      await bucket.upload(localImage, { destination, metadata: { contentType: 'image/jpeg' } });

      const file = bucket.file(destination);
      // Generate a public URL (make sure your bucket is public or adjust ACL accordingly)
      await file.makePublic();
      const publicUrl = file.publicUrl();

      console.log(`🔗 Updating Firestore for ${id} with URL: ${publicUrl}`);
      await productRef.doc(id).update({
        imageUrl: publicUrl,
        imageSeeded: true,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error(`❌ Error seeding image for ${id}:`, error);
    }
  }

  console.log('🎉 Real image seeding complete! All available local images uploaded.');
}

seedRealImages().catch(console.error);
