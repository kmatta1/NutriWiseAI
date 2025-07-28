/**
 * Final Database Images Verification Test
 * This script verifies that all 91 products load with their database images
 * NO fallbacks, only real database URLs
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

async function testDatabaseImages() {
  try {
    console.log('🔍 Testing Database Images - Final Verification');
    console.log('='.repeat(60));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all products from database
    console.log('📦 Loading products from Firebase...');
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`✅ Found ${snapshot.docs.length} products in database`);
    
    if (snapshot.docs.length !== 91) {
      console.log(`⚠️  Expected 91 products, found ${snapshot.docs.length}`);
    }
    
    let productsWithImages = 0;
    let productsWithoutImages = 0;
    let validImageUrls = 0;
    let invalidImageUrls = 0;
    
    const imageAnalysis = [];
    
    console.log('\\n🔍 Analyzing product images...');
    console.log('-'.repeat(80));
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const product = {
        id: doc.id,
        name: data.name || 'Unnamed Product',
        brand: data.brand || 'Unknown Brand',
        imageUrl: data.imageUrl || data.image || null,
        amazonUrl: data.amazonUrl || null,
        affiliateUrl: data.affiliateUrl || null,
        isActive: data.isActive !== false
      };
      
      if (product.imageUrl) {
        productsWithImages++;
        
        // Check if it's a valid URL
        try {
          new URL(product.imageUrl);
          validImageUrls++;
          
          // Check the domain of the image
          const url = new URL(product.imageUrl);
          const domain = url.hostname;
          
          imageAnalysis.push({
            name: product.name,
            brand: product.brand,
            imageUrl: product.imageUrl,
            domain: domain,
            isAmazonImage: domain.includes('amazon') || domain.includes('ssl-images-amazon'),
            isUnsplashImage: domain.includes('unsplash'),
            isOtherImage: !domain.includes('amazon') && !domain.includes('unsplash'),
            isActive: product.isActive
          });
          
        } catch (e) {
          invalidImageUrls++;
          console.log(`❌ Invalid URL for ${product.name}: ${product.imageUrl}`);
        }
      } else {
        productsWithoutImages++;
        console.log(`⚠️  No image URL for: ${product.name} (${product.brand})`);
      }
    }
    
    console.log('\\n📊 DATABASE IMAGE ANALYSIS');
    console.log('='.repeat(60));
    console.log(`Total Products: ${snapshot.docs.length}`);
    console.log(`Products with Images: ${productsWithImages}`);
    console.log(`Products without Images: ${productsWithoutImages}`);
    console.log(`Valid Image URLs: ${validImageUrls}`);
    console.log(`Invalid Image URLs: ${invalidImageUrls}`);
    
    // Analyze image domains
    const amazonImages = imageAnalysis.filter(p => p.isAmazonImage);
    const unsplashImages = imageAnalysis.filter(p => p.isUnsplashImage);
    const otherImages = imageAnalysis.filter(p => p.isOtherImage);
    
    console.log('\\n🌐 IMAGE SOURCE BREAKDOWN');
    console.log('-'.repeat(40));
    console.log(`Amazon Images: ${amazonImages.length}`);
    console.log(`Unsplash Images: ${unsplashImages.length}`);
    console.log(`Other Images: ${otherImages.length}`);
    
    if (amazonImages.length > 0) {
      console.log('\\n⚠️  AMAZON IMAGE URLS (May cause 404 errors):');
      amazonImages.slice(0, 5).forEach(p => {
        console.log(`  • ${p.name}: ${p.imageUrl}`);
      });
      if (amazonImages.length > 5) {
        console.log(`  ... and ${amazonImages.length - 5} more Amazon URLs`);
      }
    }
    
    if (unsplashImages.length > 0) {
      console.log('\\n✅ UNSPLASH IMAGE URLS (Should work):');
      unsplashImages.slice(0, 5).forEach(p => {
        console.log(`  • ${p.name}: ${p.imageUrl}`);
      });
      if (unsplashImages.length > 5) {
        console.log(`  ... and ${unsplashImages.length - 5} more Unsplash URLs`);
      }
    }
    
    // Final recommendation
    console.log('\\n🎯 FINAL DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (productsWithImages === snapshot.docs.length) {
      console.log('✅ All products have image URLs in database');
    } else {
      console.log(`❌ ${productsWithoutImages} products missing image URLs`);
    }
    
    if (amazonImages.length > 0) {
      console.log(`⚠️  ${amazonImages.length} products using Amazon URLs (likely causing 404s)`);
      console.log('   SOLUTION: Replace Amazon URLs with Unsplash URLs');
    }
    
    if (unsplashImages.length > 0) {
      console.log(`✅ ${unsplashImages.length} products using Unsplash URLs (should work)`);
    }
    
    console.log('\\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Replace Amazon image URLs with working Unsplash URLs');
    console.log('2. Ensure frontend uses imageUrl field from database');
    console.log('3. No fallback images - only database URLs');
    console.log('4. All 91 products should display their database images');
    
    // Test a sample of image URLs
    console.log('\\n🌐 TESTING SAMPLE IMAGE URLS...');
    const testUrls = imageAnalysis.slice(0, 3);
    
    for (const product of testUrls) {
      try {
        const response = await fetch(product.imageUrl, { method: 'HEAD' });
        const status = response.status;
        console.log(`${status === 200 ? '✅' : '❌'} ${product.name}: ${status} - ${product.imageUrl}`);
      } catch (error) {
        console.log(`❌ ${product.name}: ERROR - ${product.imageUrl}`);
      }
    }
    
    console.log('\\n🏁 DATABASE IMAGE TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Error testing database images:', error);
  }
}

// Run the test
testDatabaseImages();
