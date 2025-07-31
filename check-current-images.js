import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC_4AwC83p4J9Wf5aocGqt5iTuQZsGBEV4",
  authDomain: "nutriwise-ai.firebaseapp.com",
  projectId: "nutriwise-ai",
  storageBucket: "nutriwise-ai.appspot.com",
  messagingSenderId: "1073348724828",
  appId: "1:1073348724828:web:4e36e3e29bd2e38a98d8f2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCurrentImages() {
  console.log('🔍 Checking current image URLs in the database...\n');
  
  try {
    // Check the three products from our generated stack
    const products = [
      'Optimum Nutrition Gold Standard 100% Whey Protein Powder - Vanilla',
      'Pure Micronized Creatine Monohydrate Powder',
      'Vitamin D3 5000 IU by NOW Foods'
    ];
    
    for (const productName of products) {
      console.log(`\n📦 Checking: ${productName}`);
      console.log('='.repeat(60));
      
      // Search in productCatalog
      const catalogQuery = query(
        collection(db, 'productCatalog'),
        where('name', '==', productName)
      );
      
      const catalogSnapshot = await getDocs(catalogQuery);
      
      if (!catalogSnapshot.empty) {
        catalogSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`📋 Found in productCatalog (ID: ${doc.id})`);
          console.log(`   Name: ${data.name}`);
          console.log(`   Brand: ${data.brand || 'N/A'}`);
          console.log(`   Price: ${data.price || 'N/A'}`);
          console.log(`   Image URL: ${data.imageUrl || 'NO IMAGE URL'}`);
          console.log(`   Firebase Image: ${data.firebaseImageUrl || 'NO FIREBASE IMAGE'}`);
          console.log(`   Amazon URL: ${data.amazonUrl || 'NO AMAZON URL'}`);
          
          if (data.imageUrl) {
            console.log(`   🔗 Image Type: ${data.imageUrl.includes('firebasestorage') ? 'Firebase Storage' : 'External URL'}`);
          }
        });
      } else {
        console.log(`❌ NOT FOUND in productCatalog`);
      }
    }
    
    // Also check a sample of other products
    console.log('\n\n📊 Sample check of other products...');
    console.log('='.repeat(60));
    
    const allProductsQuery = collection(db, 'productCatalog');
    const allProductsSnapshot = await getDocs(allProductsQuery);
    
    let imageStats = {
      withImages: 0,
      withoutImages: 0,
      firebaseImages: 0,
      externalImages: 0,
      total: 0
    };
    
    allProductsSnapshot.forEach((doc) => {
      const data = doc.data();
      imageStats.total++;
      
      if (data.imageUrl) {
        imageStats.withImages++;
        if (data.imageUrl.includes('firebasestorage')) {
          imageStats.firebaseImages++;
        } else {
          imageStats.externalImages++;
        }
      } else {
        imageStats.withoutImages++;
      }
    });
    
    console.log(`\n📈 Image Statistics:`);
    console.log(`   Total Products: ${imageStats.total}`);
    console.log(`   With Images: ${imageStats.withImages}`);
    console.log(`   Without Images: ${imageStats.withoutImages}`);
    console.log(`   Firebase Storage Images: ${imageStats.firebaseImages}`);
    console.log(`   External Images: ${imageStats.externalImages}`);
    
    // Show a few sample image URLs
    console.log('\n🔍 Sample Image URLs:');
    let sampleCount = 0;
    allProductsSnapshot.forEach((doc) => {
      if (sampleCount < 5) {
        const data = doc.data();
        if (data.imageUrl) {
          console.log(`   ${data.name}: ${data.imageUrl}`);
          sampleCount++;
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking images:', error);
  }
}

checkCurrentImages();
