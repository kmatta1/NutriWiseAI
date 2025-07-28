const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'firebaseConfig.json'), 'utf8'));

console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugFirestore() {
  try {
    console.log('🧪 Testing basic Firestore write...');
    
    // Test 1: Very basic document
    const basicDoc = {
      id: 'test-product-1',
      name: 'Test Product',
      category: 'test',
      currentPrice: 29.99,
      rating: 4.5,
      reviewCount: 100,
      createdAt: new Date()
    };
    
    console.log('📝 Writing basic document...');
    console.log('Data:', JSON.stringify(basicDoc, null, 2));
    
    const docRef = doc(collection(db, 'productCatalog'), basicDoc.id);
    await setDoc(docRef, basicDoc);
    
    console.log('✅ Basic document written successfully!');
    
    // Test 2: Load actual product data
    console.log('\n📄 Loading actual product data...');
    const productFile = 'product-data-Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla.json';
    const productPath = path.join(__dirname, '..', productFile);
    
    if (fs.existsSync(productPath)) {
      const rawData = fs.readFileSync(productPath, 'utf8');
      const jsonData = JSON.parse(rawData);
      
      console.log('Raw JSON data:', JSON.stringify(jsonData, null, 2));
      
      // Try to write the raw data as-is
      const rawDocRef = doc(collection(db, 'productCatalog'), 'test-raw-product');
      await setDoc(rawDocRef, {
        ...jsonData,
        id: 'test-raw-product',
        createdAt: new Date()
      });
      
      console.log('✅ Raw product data written successfully!');
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  }
}

// Run the debug test
debugFirestore()
  .then(() => {
    console.log('Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Debug failed:', error);
    process.exit(1);
  });
