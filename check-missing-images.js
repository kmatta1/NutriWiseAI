/**
 * Check which images are missing from Firebase Storage
 * Compare database imageUrl fields with actual storage availability
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAsyevl6HgySKFJT_pXdZlKFqSe7L1lG_E",
  authDomain: "nutriwiseai-f8bd1.firebaseapp.com",
  projectId: "nutriwiseai-f8bd1",
  storageBucket: "nutriwiseai-f8bd1.firebasestorage.app",
  messagingSenderId: "1062331421451",
  appId: "1:1062331421451:web:42c89c2a8d3af9e67b9ac5",
  measurementId: "G-P1NTKME6LR"
};

async function checkMissingImages() {
  try {
    console.log('🔍 CHECKING MISSING IMAGES FROM FIREBASE STORAGE');
    console.log('='.repeat(70));
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`📦 Found ${snapshot.docs.length} products in database`);
    
    let totalProducts = 0;
    let productsWithImageUrls = 0;
    let productsWithWorkingImages = 0;
    let productsWithMissingImages = 0;
    
    const missingImages = [];
    const workingImages = [];
    const noImageUrlProducts = [];
    
    console.log('\\n🔍 Testing each product image URL...');
    console.log('-'.repeat(80));
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const product = {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        brand: data.brand || 'Unknown Brand',
        imageUrl: data.imageUrl || null,
        isActive: data.isActive !== false
      };
      
      totalProducts++;
      
      if (!product.imageUrl) {
        noImageUrlProducts.push(product);
        console.log(`❌ No imageUrl: ${product.name} (${product.brand})`);
        continue;
      }
      
      productsWithImageUrls++;
      
      // Test if the image URL works
      try {
        const response = await fetch(product.imageUrl, { method: 'HEAD' });
        
        if (response.status === 200) {
          productsWithWorkingImages++;
          workingImages.push(product);
          console.log(`✅ Working: ${product.name}`);
        } else {
          productsWithMissingImages++;
          missingImages.push({
            ...product,
            httpStatus: response.status,
            error: `HTTP ${response.status}`
          });
          console.log(`❌ ${response.status}: ${product.name} - ${product.imageUrl}`);
        }
      } catch (error) {
        productsWithMissingImages++;
        missingImages.push({
          ...product,
          error: error.message
        });
        console.log(`❌ ERROR: ${product.name} - ${error.message}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\\n📊 MISSING IMAGES SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with imageUrl field: ${productsWithImageUrls}`);
    console.log(`Products with working images: ${productsWithWorkingImages}`);
    console.log(`Products with missing images: ${productsWithMissingImages}`);
    console.log(`Products without imageUrl: ${noImageUrlProducts.length}`);
    
    if (missingImages.length > 0) {
      console.log('\\n❌ MISSING IMAGES DETAILS:');
      console.log('-'.repeat(50));
      missingImages.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand})`);
        console.log(`   Error: ${product.error || product.httpStatus}`);
        console.log(`   URL: ${product.imageUrl}`);
        console.log('');
      });
    }
    
    if (noImageUrlProducts.length > 0) {
      console.log('\\n⚠️  PRODUCTS WITHOUT IMAGE URLs:');
      console.log('-'.repeat(50));
      noImageUrlProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand})`);
      });
    }
    
    if (workingImages.length > 0) {
      console.log('\\n✅ WORKING IMAGES (Sample):');
      console.log('-'.repeat(50));
      workingImages.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.imageUrl}`);
      });
    }
    
    console.log('\\n🎯 NEXT STEPS:');
    console.log('-'.repeat(30));
    
    if (productsWithMissingImages > 0) {
      console.log(`1. Upload ${productsWithMissingImages} missing images to Firebase Storage`);
      console.log('2. Use image URLs that match the paths in /images/supplements/');
      console.log('3. Or update database with working image URLs');
    }
    
    if (noImageUrlProducts.length > 0) {
      console.log(`4. Add imageUrl field to ${noImageUrlProducts.length} products without images`);
    }
    
    if (productsWithWorkingImages > 0) {
      console.log(`✅ ${productsWithWorkingImages} products already have working images!`);
    }
    
  } catch (error) {
    console.error('❌ Error checking missing images:', error);
  }
}

checkMissingImages();
