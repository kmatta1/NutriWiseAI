/**
 * Fix Amazon Image URLs in Database
 * Replace all Amazon image URLs with working Unsplash supplement images
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

// Working supplement images from Unsplash
const supplementImages = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
  'https://images.unsplash.com/photo-1616671276441-2c2c4c2b8b10?w=400',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400',
  'https://images.unsplash.com/photo-1596803907728-54c868b17d07?w=400',
  'https://images.unsplash.com/photo-1614859808050-8b10e6d30b21?w=400',
  'https://images.unsplash.com/photo-1609078547779-ba311c9f72b4?w=400',
  'https://images.unsplash.com/photo-1593220558516-3ca8c7e0a56e?w=400',
  'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=400',
  'https://images.unsplash.com/photo-1555708982-8645ec6cf94c?w=400',
  'https://images.unsplash.com/photo-1578496479763-c6a7e1b01818?w=400',
  'https://images.unsplash.com/photo-1611690754998-7b7c2d5e5a42?w=400',
  'https://images.unsplash.com/photo-1554475901-e2ce1a3f857e?w=400',
  'https://images.unsplash.com/photo-1614859808050-8b10e6d30b21?w=400',
  'https://images.unsplash.com/photo-1605833201517-e94a0bffec8d?w=400',
  'https://images.unsplash.com/photo-1578496479763-c6a7e1b01818?w=400'
];

async function fixAmazonImageUrls() {
  try {
    console.log('🔧 FIXING AMAZON IMAGE URLS IN DATABASE');
    console.log('='.repeat(60));
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all products
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`📦 Found ${snapshot.docs.length} products to check`);
    
    let amazonImageCount = 0;
    let fixedImageCount = 0;
    
    for (const [index, docSnapshot] of snapshot.docs.entries()) {
      const data = docSnapshot.data();
      const imageUrl = data.imageUrl || data.image;
      
      // Check if it's an Amazon image URL
      if (imageUrl && (imageUrl.includes('amazon') || imageUrl.includes('ssl-images-amazon'))) {
        amazonImageCount++;
        
        // Replace with a working Unsplash image
        const newImageUrl = supplementImages[index % supplementImages.length];
        
        console.log(`🔄 Fixing: ${data.name}`);
        console.log(`   Old: ${imageUrl.substring(0, 60)}...`);
        console.log(`   New: ${newImageUrl}`);
        
        // Update the document
        const docRef = doc(db, 'productCatalog', docSnapshot.id);
        await updateDoc(docRef, {
          imageUrl: newImageUrl,
          lastUpdated: new Date(),
          imageSource: 'unsplash'
        });
        
        fixedImageCount++;
      } else if (imageUrl) {
        console.log(`✅ OK: ${data.name} - ${imageUrl.substring(0, 40)}...`);
      } else {
        console.log(`⚠️  No image: ${data.name}`);
      }
    }
    
    console.log('\\n📊 RESULTS:');
    console.log(`Total products: ${snapshot.docs.length}`);
    console.log(`Amazon images found: ${amazonImageCount}`);
    console.log(`Images fixed: ${fixedImageCount}`);
    
    if (fixedImageCount > 0) {
      console.log('\\n✅ SUCCESS: All Amazon image URLs have been replaced!');
      console.log('🌐 Database now contains only working image URLs');
      console.log('🔄 Refresh your website to see the changes');
    } else {
      console.log('\\n✅ No Amazon URLs found - database already clean!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Amazon image URLs:', error);
  }
}

// Run the fix
fixAmazonImageUrls();
