// rename-and-update-images.js
// Rename Firebase Storage images to match products and update database

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function renameAndUpdateImages() {
  console.log('🔄 Starting image rename and database update process...\n');

  try {
    // Load the mapping file
    if (!fs.existsSync('image-rename-mapping.json')) {
      console.error('❌ image-rename-mapping.json not found. Run check-actual-images.js first.');
      return;
    }

    const mapping = JSON.parse(fs.readFileSync('image-rename-mapping.json', 'utf8'));
    console.log(`📋 Loaded mapping for ${mapping.renameMap.length} images`);

    const results = {
      renamed: 0,
      updated: 0,
      errors: [],
      skipped: 0
    };

    // Step 1: Rename images in Firebase Storage
    console.log('\n🏷️  Step 1: Renaming images in Firebase Storage...');
    for (const item of mapping.renameMap) {
      try {
        const sourceFile = bucket.file(item.currentPath);
        const destFile = bucket.file(item.newPath);
        
        // Check if source exists
        const [sourceExists] = await sourceFile.exists();
        if (!sourceExists) {
          console.log(`⚠️  Skipped: ${item.currentPath} (doesn't exist)`);
          results.skipped++;
          continue;
        }

        // Check if destination already exists
        const [destExists] = await destFile.exists();
        if (destExists) {
          console.log(`⚠️  Skipped: ${item.newPath} (already exists)`);
          results.skipped++;
          continue;
        }

        // Copy to new location
        await sourceFile.copy(destFile);
        console.log(`✅ Renamed: ${item.currentImageName} → ${path.basename(item.newPath)}`);
        results.renamed++;

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error renaming ${item.currentPath}:`, error.message);
        results.errors.push(`Rename ${item.currentPath}: ${error.message}`);
      }
    }

    // Step 2: Generate Firebase Storage URLs and update database
    console.log('\n🔗 Step 2: Generating Firebase Storage URLs and updating database...');
    
    const batch = db.batch();
    
    for (const item of mapping.renameMap) {
      try {
        const file = bucket.file(item.newPath);
        const [exists] = await file.exists();
        
        if (!exists) {
          console.log(`⚠️  Skipped database update for ${item.productName} (image not found)`);
          continue;
        }

        // Get public URL
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // Far future date for permanent access
        });

        // Update the product in database
        const docRef = db.collection('productCatalog').doc(item.productId);
        batch.update(docRef, {
          imageUrl: url,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          imageSource: 'firebase-storage'
        });

        console.log(`✅ Updated: ${item.productName}`);
        results.updated++;

      } catch (error) {
        console.error(`❌ Error updating ${item.productName}:`, error.message);
        results.errors.push(`Update ${item.productName}: ${error.message}`);
      }
    }

    // Commit all database updates
    if (results.updated > 0) {
      await batch.commit();
      console.log(`\n💾 Committed ${results.updated} database updates`);
    }

    // Step 3: Clean up old images (optional)
    console.log('\n🧹 Step 3: Cleaning up original images...');
    let cleanedUp = 0;
    
    for (const item of mapping.renameMap) {
      try {
        const sourceFile = bucket.file(item.currentPath);
        const [exists] = await sourceFile.exists();
        
        if (exists) {
          await sourceFile.delete();
          console.log(`🗑️  Deleted: ${item.currentImageName}`);
          cleanedUp++;
        }
      } catch (error) {
        console.error(`❌ Error deleting ${item.currentPath}:`, error.message);
      }
    }

    // Step 4: Handle remaining products without images
    console.log('\n📋 Step 4: Products still needing images...');
    if (mapping.remainingProducts && mapping.remainingProducts.length > 0) {
      console.log(`⚠️  ${mapping.remainingProducts.length} products still need images:`);
      mapping.remainingProducts.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name} (${product.brand || 'No Brand'})`);
      });
      if (mapping.remainingProducts.length > 5) {
        console.log(`  ... and ${mapping.remainingProducts.length - 5} more`);
      }
    }

    // Final summary
    console.log('\n📊 FINAL RESULTS:');
    console.log('==================');
    console.log(`✅ Images renamed: ${results.renamed}`);
    console.log(`✅ Database records updated: ${results.updated}`);
    console.log(`🧹 Original images cleaned up: ${cleanedUp}`);
    console.log(`⚠️  Skipped: ${results.skipped}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Save results
    const finalResults = {
      timestamp: new Date().toISOString(),
      ...results,
      cleanedUp,
      remainingProducts: mapping.remainingProducts?.length || 0
    };

    fs.writeFileSync('image-migration-results.json', JSON.stringify(finalResults, null, 2));
    console.log('\n📁 Results saved to image-migration-results.json');

    if (results.updated > 0) {
      console.log('\n🎉 SUCCESS! Images have been renamed and database updated.');
      console.log('🚀 Next step: Restart your dev server to see the changes.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
renameAndUpdateImages().catch(console.error);
