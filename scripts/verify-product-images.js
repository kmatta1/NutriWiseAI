/**
 * Database Image Verification Script
 * 
 * This script checks all products in the productCatalog collection
 * to ensure they have valid imageUrl fields
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-jP7SxMj8lKvaqgOBSuOJe6EK3IcVj5A",
  authDomain: "nutriwise-ai.firebaseapp.com",
  projectId: "nutriwise-ai",
  storageBucket: "nutriwise-ai.appspot.com",
  messagingSenderId: "374007162948",
  appId: "1:374007162948:web:59b1b8a8c8b8b8a8b8b8b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyProductImages() {
  try {
    console.log('🔍 Checking all products in productCatalog for images...');
    
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    let totalProducts = 0;
    let productsWithImages = 0;
    let productsWithoutImages = 0;
    const missingImages = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalProducts++;
      
      if (data.imageUrl && data.imageUrl.trim() !== '') {
        productsWithImages++;
        console.log(`✅ ${data.name}: ${data.imageUrl}`);
      } else {
        productsWithoutImages++;
        missingImages.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          category: data.category
        });
        console.log(`❌ ${data.name}: NO IMAGE`);
      }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${productsWithoutImages}`);
    
    if (missingImages.length > 0) {
      console.log('\n🚨 Products missing images:');
      missingImages.forEach(product => {
        console.log(`  - ${product.name} (${product.brand || 'No brand'}) [${product.category || 'No category'}]`);
      });
    }
    
    return {
      total: totalProducts,
      withImages: productsWithImages,
      withoutImages: productsWithoutImages,
      missingImagesList: missingImages
    };
    
  } catch (error) {
    console.error('❌ Error verifying product images:', error);
    throw error;
  }
}

// Run the verification
verifyProductImages()
  .then(results => {
    console.log('\n✅ Image verification complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
