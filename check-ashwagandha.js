const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDc-SLCcNPfCMUcVbXJHYj0LqCiZCKtLSI",
  authDomain: "nutriwise-ai-3fmvs.firebaseapp.com",
  projectId: "nutriwise-ai-3fmvs",
  storageBucket: "nutriwise-ai-3fmvs.firebasestorage.app",
  messagingSenderId: "346549892135",
  appId: "1:346549892135:web:e96e8b4985569c69a7f5d4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAshwagandha() {
  try {
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    const ashwagandhaProducts = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase().includes('ashwagandha')) {
        ashwagandhaProducts.push({
          name: data.name,
          brand: data.brand,
          amazonUrl: data.amazonUrl,
          affiliateUrl: data.affiliateUrl,
          imageUrl: data.imageUrl
        });
      }
    });
    
    console.log('Ashwagandha products found:', ashwagandhaProducts.length);
    ashwagandhaProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} by ${product.brand}`);
      console.log(`   Amazon URL: ${product.amazonUrl || 'none'}`);
      console.log(`   Affiliate URL: ${product.affiliateUrl || 'none'}`);
      console.log(`   Image URL: ${product.imageUrl ? 'yes' : 'none'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAshwagandha();
