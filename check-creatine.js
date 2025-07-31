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

async function checkCreatineProducts() {
  try {
    console.log('Searching for creatine products...');
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    let creatineProducts = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const name = data.name || data.productName || '';
      const category = data.category || '';
      if (name.toLowerCase().includes('creatine') || category.toLowerCase().includes('creatine')) {
        creatineProducts.push({
          id: doc.id,
          name: name,
          category: category,
          imageUrl: data.imageUrl || data.image,
          brand: data.brand || data.manufacturer
        });
      }
    });
    
    console.log(`Found ${creatineProducts.length} creatine products:`);
    creatineProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Brand: ${product.brand || 'Unknown'}`);
      console.log(`   Category: ${product.category || 'Unknown'}`);
      console.log(`   Image: ${product.imageUrl || 'No image'}`);
      if (product.imageUrl) {
        const isProductImage = !product.imageUrl.includes('woman') && !product.imageUrl.includes('workout') && !product.imageUrl.includes('exercise');
        console.log(`   Looks like product image: ${isProductImage ? 'Yes' : 'No'}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCreatineProducts();
