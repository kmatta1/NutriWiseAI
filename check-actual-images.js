// check-actual-images.js
// Check actual Firebase Storage images and create renaming strategy

const admin = require('firebase-admin');
const path = require('path');

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

async function checkActualImages() {
  console.log('🔍 Checking actual images in Firebase Storage vs productCatalog...\n');

  try {
    // 1. Get all products from productCatalog
    const productsSnapshot = await db.collection('productCatalog').get();
    console.log(`📦 Found ${productsSnapshot.size} products in productCatalog`);

    const products = [];
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        brand: data.brand,
        currentImageUrl: data.imageUrl,
        category: data.category
      });
    });

    // 2. Get all images from Firebase Storage
    const [files] = await bucket.getFiles({ prefix: 'supplement-images/' });
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file.name)
    );

    console.log(`🖼️  Found ${imageFiles.length} images in Firebase Storage`);
    
    // 3. Show current images
    console.log('\n📋 Current images in storage:');
    imageFiles.forEach((file, index) => {
      const fileName = file.name.replace('supplement-images/', '');
      console.log(`  ${index + 1}. ${fileName}`);
    });

    // 4. Show first few products that need images
    console.log('\n📦 Products in database:');
    products.slice(0, 10).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
    });

    // 5. Create manual mapping strategy
    console.log('\n🎯 MAPPING STRATEGY:');
    console.log('We have 24 generic images (supplement_1.jpg to supplement_24.jpg)');
    console.log(`We have ${products.length} products in the database`);
    console.log('\nOption 1: Map first 24 products to the 24 images');
    console.log('Option 2: Download more images for remaining products');

    // 6. Generate rename mapping for first 24 products
    const renameMap = [];
    const maxToMap = Math.min(products.length, imageFiles.length);
    
    console.log(`\n📝 Proposed mapping for first ${maxToMap} products:`);
    console.log('Current Image → New Name (Product)');
    console.log('='.repeat(80));

    for (let i = 0; i < maxToMap; i++) {
      const product = products[i];
      const imageFile = imageFiles[i];
      const currentName = imageFile.name.replace('supplement-images/', '');
      
      // Generate clean product name for image
      const cleanProductName = generateImageFileName(product.name, product.brand);
      const proposedName = `${cleanProductName}.jpg`;
      
      renameMap.push({
        currentPath: imageFile.name,
        newPath: `images/supplements/${proposedName}`,
        productId: product.id,
        productName: product.name,
        brand: product.brand || '',
        currentImageName: currentName
      });

      console.log(`${currentName} → ${proposedName}`);
      console.log(`  Product: ${product.name} (${product.brand || 'No Brand'})`);
      console.log('');
    }

    // 7. Save the mapping
    const fs = require('fs');
    const mapping = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      totalImages: imageFiles.length,
      mappedCount: maxToMap,
      renameMap: renameMap,
      remainingProducts: products.slice(maxToMap).map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        needsImage: true
      }))
    };

    fs.writeFileSync('image-rename-mapping.json', JSON.stringify(mapping, null, 2));
    console.log('📁 Mapping saved to image-rename-mapping.json');

    // 8. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Products in database: ${products.length}`);
    console.log(`✅ Images available: ${imageFiles.length}`);
    console.log(`✅ Can be mapped immediately: ${maxToMap}`);
    
    if (products.length > imageFiles.length) {
      console.log(`⚠️  Need ${products.length - imageFiles.length} more images`);
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Review the mapping in image-rename-mapping.json');
    console.log('2. Run the rename script to move images to proper names');
    console.log('3. Update productCatalog with new Firebase Storage URLs');

    return mapping;

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Helper function to generate clean image file names
function generateImageFileName(productName, brand) {
  const clean = (str) => (str || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40);
  
  const cleanName = clean(productName);
  const cleanBrand = clean(brand);
  
  // Prioritize product name, add brand if space allows
  if (cleanName && cleanBrand && (cleanName.length + cleanBrand.length + 1) <= 40) {
    return `${cleanBrand}_${cleanName}`;
  } else if (cleanName) {
    return cleanName;
  } else if (cleanBrand) {
    return cleanBrand;
  } else {
    return 'unnamed_supplement';
  }
}

// Run the check
checkActualImages().catch(console.error);
