/**
 * Check Database Images - Identify Missing/Broken Images
 * This script checks what image URLs are currently in the database
 * and identifies which ones need to be fixed
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsyevl6HgySKFJT_pXdZlKFqSe7L1lG_E",
  authDomain: "nutriwiseai-f8bd1.firebaseapp.com",
  projectId: "nutriwiseai-f8bd1",
  storageBucket: "nutriwiseai-f8bd1.firebasestorage.app",
  messagingSenderId: "1062331421451",
  appId: "1:1062331421451:web:42c89c2a8d3af9e67b9ac5",
  measurementId: "G-P1NTKME6LR"
};

async function checkDatabaseImages() {
  try {
    console.log('🔍 CHECKING DATABASE IMAGES');
    console.log('='.repeat(60));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all products from database
    console.log('📦 Loading products from Firebase...');
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`✅ Found ${snapshot.docs.length} products in database`);
    
    let amazonImages = 0;
    let unsplashImages = 0;
    let missingImages = 0;
    let otherImages = 0;
    
    const amazonProducts = [];
    const missingProducts = [];
    
    console.log('\n📊 ANALYZING IMAGE URLS...');
    console.log('-'.repeat(80));
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const product = {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        brand: data.brand || 'Unknown Brand',
        imageUrl: data.imageUrl || data.image || null
      };
      
      if (!product.imageUrl) {
        missingImages++;
        missingProducts.push(product);
        console.log(`❌ MISSING: ${product.name} (${product.brand})`);
      } else {
        try {
          const url = new URL(product.imageUrl);
          const domain = url.hostname;
          
          if (domain.includes('amazon') || domain.includes('ssl-images-amazon')) {
            amazonImages++;
            amazonProducts.push(product);
            console.log(`🔴 AMAZON: ${product.name} - ${product.imageUrl}`);
          } else if (domain.includes('unsplash')) {
            unsplashImages++;
            console.log(`✅ UNSPLASH: ${product.name} - ${product.imageUrl}`);
          } else {
            otherImages++;
            console.log(`⚠️  OTHER: ${product.name} - ${product.imageUrl}`);
          }
        } catch (e) {
          missingImages++;
          missingProducts.push(product);
          console.log(`❌ INVALID URL: ${product.name} - ${product.imageUrl}`);
        }
      }
    }
    
    console.log('\n📈 IMAGE URL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Products: ${snapshot.docs.length}`);
    console.log(`Amazon Images (BROKEN): ${amazonImages}`);
    console.log(`Unsplash Images (WORKING): ${unsplashImages}`);
    console.log(`Missing Images: ${missingImages}`);
    console.log(`Other Images: ${otherImages}`);
    
    const needsFixing = amazonImages + missingImages;
    console.log(`\\n🔧 PRODUCTS NEEDING FIXES: ${needsFixing}`);
    
    if (needsFixing > 0) {
      console.log('\\n⚠️  ACTION REQUIRED:');
      console.log('1. Run seeding script to replace Amazon URLs with working Unsplash URLs');
      console.log('2. Update database with proper image URLs');
      console.log('3. Verify all products have working images');
      
      console.log('\\n🚀 RECOMMENDED COMMAND:');
      console.log('node fix-database-images.js');
    } else {
      console.log('\\n✅ ALL IMAGES ARE WORKING!');
    }
    
    // Save products needing fixes for seeding script
    const needsFixingList = [...amazonProducts, ...missingProducts];
    console.log(`\\n💾 Saving ${needsFixingList.length} products that need image fixes...`);
    
    require('fs').writeFileSync('products-needing-image-fixes.json', JSON.stringify({
      total: needsFixingList.length,
      amazonImages: amazonProducts.length,
      missingImages: missingProducts.length,
      products: needsFixingList.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        currentImageUrl: p.imageUrl,
        needsReplacement: true
      }))
    }, null, 2));
    
    console.log('✅ Saved to products-needing-image-fixes.json');
    
  } catch (error) {
    console.error('❌ Error checking database images:', error);
  }
}

// Run the check
checkDatabaseImages();
