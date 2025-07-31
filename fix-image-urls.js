import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD7Z1SD_6yhEueIUE_NRAh-9kJHjzcwYaE",
  authDomain: "nutriwise-ai-3fmvs.firebaseapp.com",
  projectId: "nutriwise-ai-3fmvs",
  storageBucket: "nutriwise-ai-3fmvs.firebasestorage.app",
  messagingSenderId: "336578713643",
  appId: "1:336578713643:web:704650262eaac23288726e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function sanitizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fixImageUrls() {
  console.log('🔧 Starting image URL fix...\n');
  
  try {
    const productsRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(productsRef);
    
    let updateCount = 0;
    let skipCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const productName = data.name;
      
      if (!productName) {
        console.log(`⚠️ Skipping product ${docSnapshot.id} - no name`);
        skipCount++;
        continue;
      }
      
      // Generate the correct Firebase Storage URL
      const sanitizedName = sanitizeProductName(productName);
      const correctImageUrl = `https://storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/products/${sanitizedName}.jpg`;
      
      // Check if we need to update
      const currentImageUrl = data.imageUrl;
      const needsUpdate = !currentImageUrl || 
                          currentImageUrl.includes('amazon.com') || 
                          currentImageUrl.includes('nutriwise-ai-2fb23') ||
                          currentImageUrl.includes('firebasestorage.googleapis.com/v0/b/') ||
                          !currentImageUrl.includes('storage.googleapis.com/nutriwise-ai-3fmvs');
      
      if (needsUpdate) {
        console.log(`🔄 Updating ${productName}`);
        console.log(`   Old URL: ${currentImageUrl || 'None'}`);
        console.log(`   New URL: ${correctImageUrl}\n`);
        
        // Update the document
        await updateDoc(doc(db, 'productCatalog', docSnapshot.id), {
          imageUrl: correctImageUrl
        });
        
        updateCount++;
      } else {
        console.log(`✅ ${productName} already has correct URL`);
        skipCount++;
      }
    }
    
    console.log('\n📊 Fix Complete!');
    console.log(`✅ Updated: ${updateCount} products`);
    console.log(`⏭️ Skipped: ${skipCount} products`);
    console.log(`📦 Total: ${updateCount + skipCount} products processed`);
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  }
}

fixImageUrls();
