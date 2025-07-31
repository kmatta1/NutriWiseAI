/**
 * Debug Database Images - Check what the frontend is actually getting
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

async function debugImages() {
  try {
    console.log('🔍 DEBUG: Checking what frontend receives from database');
    console.log('='.repeat(70));
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`📦 Found ${snapshot.docs.length} products in productCatalog`);
    
    let validImages = 0;
    let invalidImages = 0;
    
    console.log('\n🔍 Sample of products with imageUrl field:');
    console.log('-'.repeat(80));
    
    for (let i = 0; i < Math.min(10, snapshot.docs.length); i++) {
      const doc = snapshot.docs[i];
      const data = doc.data();
      
      console.log(`\nProduct ${i + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Name: ${data.name || 'No name'}`);
      console.log(`  Brand: ${data.brand || 'No brand'}`);
      console.log(`  imageUrl: ${data.imageUrl || 'NO IMAGE URL'}`);
      console.log(`  image: ${data.image || 'NO IMAGE FIELD'}`);
      console.log(`  isActive: ${data.isActive}`);
      
      if (data.imageUrl) {
        validImages++;
        // Test if the URL works
        try {
          const response = await fetch(data.imageUrl, { method: 'HEAD' });
          console.log(`  🌐 Image Status: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`  🌐 Image Status: ERROR - ${error.message}`);
        }
      } else {
        invalidImages++;
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Products with imageUrl: ${validImages}`);
    console.log(`❌ Products without imageUrl: ${invalidImages}`);
    
    // Now check what the ProductCatalogService would return
    console.log('\n🔧 TESTING ProductCatalogService simulation...');
    
    const testProduct = snapshot.docs[0]?.data();
    if (testProduct) {
      console.log('Raw database product:');
      console.log(JSON.stringify({
        id: snapshot.docs[0].id,
        name: testProduct.name,
        brand: testProduct.brand,
        imageUrl: testProduct.imageUrl,
        currentPrice: testProduct.currentPrice,
        isActive: testProduct.isActive
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugImages();
