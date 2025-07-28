// check-all-storage.js
// Check all Firebase Storage paths for images

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

async function checkAllPaths() {
  console.log('🔍 Checking all Firebase Storage paths...\n');

  try {
    // List ALL files in storage
    const [allFiles] = await bucket.getFiles();
    
    console.log(`📁 Total files in storage: ${allFiles.length}\n`);

    if (allFiles.length === 0) {
      console.log('❌ No files found in storage. Storage is empty.\n');
      return;
    }

    // Group files by directory
    const directories = {};
    const imageFiles = [];

    allFiles.forEach(file => {
      const fileName = file.name;
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
      
      if (isImage) {
        imageFiles.push(fileName);
      }

      // Get directory path
      const pathParts = fileName.split('/');
      if (pathParts.length > 1) {
        const dir = pathParts.slice(0, -1).join('/');
        if (!directories[dir]) directories[dir] = [];
        directories[dir].push(fileName);
      } else {
        if (!directories['root']) directories['root'] = [];
        directories['root'].push(fileName);
      }
    });

    console.log('📂 Directory structure:');
    Object.keys(directories).forEach(dir => {
      console.log(`  ${dir}/ (${directories[dir].length} files)`);
      
      // Show sample files
      directories[dir].slice(0, 3).forEach(file => {
        console.log(`    - ${file.split('/').pop()}`);
      });
      if (directories[dir].length > 3) {
        console.log(`    ... and ${directories[dir].length - 3} more`);
      }
    });

    console.log(`\n🖼️  Total image files: ${imageFiles.length}`);
    if (imageFiles.length > 0) {
      console.log('\n📷 Image files found:');
      imageFiles.slice(0, 10).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
      if (imageFiles.length > 10) {
        console.log(`  ... and ${imageFiles.length - 10} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllPaths().catch(console.error);
