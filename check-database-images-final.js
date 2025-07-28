// check-database-images.js
// Check the actual products in the database and their current image URLs

require('dotenv').config();
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

async function checkDatabaseImages() {
  console.log('🔍 CHECKING ACTUAL DATABASE PRODUCTS AND IMAGES');
  console.log('==============================================\n');

  try {
    // Get all products from productCatalog
    const snapshot = await db.collection('productCatalog').get();
    const products = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        brand: data.brand,
        imageUrl: data.imageUrl,
        imageSource: data.imageSource,
        matchedKeyword: data.matchedKeyword,
        price: data.price,
        category: data.category,
        lastUpdated: data.lastUpdated
      });
    });

    console.log(`📦 Total products in database: ${products.length}\n`);

    // Check Firebase Storage
    console.log('🔍 Checking Firebase Storage...');
    try {
      const [files] = await bucket.getFiles({ prefix: 'images/supplements/' });
      console.log(`📁 Files in Firebase Storage (images/supplements/): ${files.length}\n`);
      
      if (files.length > 0) {
        console.log('📋 Files in storage:');
        files.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name}`);
        });
        console.log('');
      }
    } catch (storageError) {
      console.log(`❌ Storage check failed: ${storageError.message}\n`);
    }

    // Analyze current image status
    console.log('📊 IMAGE STATUS ANALYSIS:');
    console.log('=========================');
    
    const imageStats = {
      withFirebaseImages: 0,
      withAmazonUrls: 0,
      withoutImages: 0,
      withOtherUrls: 0
    };

    const detailedProducts = [];

    products.forEach(product => {
      const imageUrl = product.imageUrl || '';
      
      if (!imageUrl) {
        imageStats.withoutImages++;
      } else if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('firebasestorage.app')) {
        imageStats.withFirebaseImages++;
      } else if (imageUrl.includes('amazon.com')) {
        imageStats.withAmazonUrls++;
      } else {
        imageStats.withOtherUrls++;
      }

      detailedProducts.push({
        ...product,
        imageStatus: !imageUrl ? 'NO_IMAGE' :
                    imageUrl.includes('firebasestorage') ? 'FIREBASE' :
                    imageUrl.includes('amazon.com') ? 'AMAZON' :
                    'OTHER'
      });
    });

    console.log(`✅ With Firebase Storage images: ${imageStats.withFirebaseImages}`);
    console.log(`⚠️  With Amazon URLs: ${imageStats.withAmazonUrls}`);
    console.log(`🔗 With other URLs: ${imageStats.withOtherUrls}`);
    console.log(`❌ Without images: ${imageStats.withoutImages}\n`);

    // Show all products with details
    console.log('📋 DETAILED PRODUCT LIST:');
    console.log('==========================');
    
    detailedProducts.sort((a, b) => a.name.localeCompare(b.name));
    
    detailedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand || 'No Brand'}`);
      console.log(`   Status: ${product.imageStatus}`);
      
      if (product.imageUrl) {
        console.log(`   URL: ${product.imageUrl.substring(0, 100)}${product.imageUrl.length > 100 ? '...' : ''}`);
      }
      
      if (product.imageSource) {
        console.log(`   Source: ${product.imageSource}`);
      }
      
      if (product.matchedKeyword) {
        console.log(`   Keyword: ${product.matchedKeyword}`);
      }
      
      console.log('');
    });

    // Products that need proper images
    const needsImages = detailedProducts.filter(p => 
      p.imageStatus === 'NO_IMAGE' || p.imageStatus === 'AMAZON'
    );

    if (needsImages.length > 0) {
      console.log('🚨 PRODUCTS NEEDING PROPER IMAGES:');
      console.log('==================================');
      needsImages.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
        console.log(`   Current: ${product.imageStatus}`);
      });
      console.log('');
    }

    // Check if images actually exist and are accessible
    if (imageStats.withFirebaseImages > 0) {
      console.log('🔍 VERIFYING FIREBASE IMAGE ACCESSIBILITY:');
      console.log('==========================================');
      
      const firebaseProducts = detailedProducts.filter(p => p.imageStatus === 'FIREBASE');
      
      for (let i = 0; i < Math.min(5, firebaseProducts.length); i++) {
        const product = firebaseProducts[i];
        console.log(`Testing: ${product.name}`);
        console.log(`URL: ${product.imageUrl}`);
        
        // Try to get file info
        try {
          const url = new URL(product.imageUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            console.log(`File exists: ${exists ? '✅' : '❌'}`);
          }
        } catch (error) {
          console.log(`❌ Error checking file: ${error.message}`);
        }
        console.log('');
      }
    }

    console.log('📊 FINAL SUMMARY:');
    console.log('==================');
    console.log(`Total products: ${products.length}`);
    console.log(`Ready to use: ${imageStats.withFirebaseImages} (${Math.round(imageStats.withFirebaseImages/products.length*100)}%)`);
    console.log(`Need fixing: ${needsImages.length} (${Math.round(needsImages.length/products.length*100)}%)`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabaseImages();
