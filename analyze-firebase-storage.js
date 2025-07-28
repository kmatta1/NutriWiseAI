// analyze-firebase-storage.js
// Check Firebase Storage for existing supplement images

const admin = require('firebase-admin');
const path = require('path');

// Use existing Firebase Admin instance or create new one
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const bucket = admin.storage().bucket();

async function analyzeStorage() {
  console.log('🗄️  Analyzing Firebase Storage...\n');

  try {
    // List all files in /images/supplements/
    const [files] = await bucket.getFiles({
      prefix: 'images/supplements/'
    });

    console.log(`📁 Found ${files.length} files in /images/supplements/\n`);

    const imageFiles = files.filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.jpg') || name.endsWith('.jpeg') || 
             name.endsWith('.png') || name.endsWith('.webp');
    });

    console.log(`🖼️  Image files: ${imageFiles.length}`);
    
    if (imageFiles.length > 0) {
      console.log('\n📋 Available images:');
      imageFiles.forEach((file, index) => {
        if (index < 10) { // Show first 10
          const fileName = file.name.replace('images/supplements/', '');
          console.log(`  ${index + 1}. ${fileName}`);
        }
      });
      
      if (imageFiles.length > 10) {
        console.log(`  ... and ${imageFiles.length - 10} more`);
      }
    }

    // Get download URLs for sample files
    console.log('\n🔗 Sample Firebase Storage URLs:');
    for (let i = 0; i < Math.min(3, imageFiles.length); i++) {
      try {
        const [url] = await imageFiles[i].getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // Far future date
        });
        const fileName = imageFiles[i].name.replace('images/supplements/', '');
        console.log(`  ${fileName}: ${url.substring(0, 100)}...`);
      } catch (error) {
        console.log(`  Error getting URL for ${imageFiles[i].name}`);
      }
    }

    return {
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      fileNames: imageFiles.map(f => f.name.replace('images/supplements/', ''))
    };

  } catch (error) {
    console.error('❌ Error accessing Firebase Storage:', error.message);
    return null;
  }
}

// Run storage analysis
analyzeStorage().then(result => {
  if (result) {
    console.log('\n✅ Storage analysis complete');
    
    // Save file list
    const fs = require('fs');
    fs.writeFileSync('storage-files.json', JSON.stringify(result, null, 2));
    console.log('📁 File list saved to storage-files.json');
  }
}).catch(console.error);
