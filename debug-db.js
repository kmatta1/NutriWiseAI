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

async function checkDatabase() {
  try {
    console.log('Checking productCatalog collection...');
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    console.log('Products found:', snapshot.docs.length);
    
    let count = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || data.image;
      if (imageUrl && count < 5) {
        console.log(`\nProduct: ${data.name || data.productName}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Type: ${imageUrl.includes('storage.googleapis.com') ? 'Firebase Storage' : imageUrl.includes('amazon.com') ? 'Amazon' : 'Other'}`);
        count++;
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
