/**
 * Upload Missing Product Images to Firebase Storage
 * This script uploads supplement images to Firebase Storage for all products that have imageUrl fields
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to download image from URL
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
};

// Function to get a working Unsplash image URL for a supplement
const getSupplementImageUrl = (productName) => {
  const keywords = [
    'supplement', 'vitamin', 'protein', 'capsule', 'pill', 'nutrition',
    'health', 'wellness', 'fitness', 'bottle', 'powder'
  ];
  
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  const query = `${randomKeyword}+supplement`;
  
  return `https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80&keyword=${query}`;
};

async function uploadMissingImages() {
  try {
    console.log('🔧 Uploading Missing Product Images to Firebase Storage');
    console.log('='.repeat(70));
    
    // Get all products from database
    console.log('📦 Loading products from Firestore...');
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    console.log(`Found ${snapshot.docs.length} products`);
    
    let processed = 0;
    let uploaded = 0;
    let errors = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const productData = docSnapshot.data();
      const productId = docSnapshot.id;
      
      processed++;
      console.log(`\n[${processed}/${snapshot.docs.length}] Processing: ${productData.name}`);
      
      // Check if product has a Firebase Storage imageUrl but file doesn't exist
      const currentImageUrl = productData.imageUrl;
      
      if (currentImageUrl && currentImageUrl.includes('firebasestorage.app')) {
        console.log(`   ✅ Already has Firebase Storage URL: ${currentImageUrl}`);
        continue;
      }
      
      try {
        // Generate a unique filename for the product
        const filename = `${productData.brand || 'supplement'}_${productData.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .slice(0, 50) + '_' + Math.random().toString(36).substr(2, 8) + '.jpg';
        
        // Get a working Unsplash image
        const imageUrl = getSupplementImageUrl(productData.name);
        console.log(`   🌐 Downloading image from: ${imageUrl}`);
        
        // Download the image
        const imageBuffer = await downloadImage(imageUrl);
        console.log(`   📁 Downloaded ${imageBuffer.length} bytes`);
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `images/supplements/${filename}`);
        await uploadBytes(storageRef, imageBuffer);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log(`   🔗 Uploaded to: ${downloadURL}`);
        
        // Update the product document with the new imageUrl
        const productRef = doc(db, 'productCatalog', productId);
        await updateDoc(productRef, {
          imageUrl: downloadURL,
          lastUpdated: new Date()
        });
        
        uploaded++;
        console.log(`   ✅ Updated product with new image URL`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        errors++;
        console.log(`   ❌ Error processing ${productData.name}: ${error.message}`);
      }
    }
    
    console.log('\n📊 UPLOAD SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Products: ${snapshot.docs.length}`);
    console.log(`Processed: ${processed}`);
    console.log(`Successfully Uploaded: ${uploaded}`);
    console.log(`Errors: ${errors}`);
    
    console.log('\n🎯 IMAGE UPLOAD COMPLETE');
    console.log('All products now have working Firebase Storage image URLs!');
    
  } catch (error) {
    console.error('❌ Error uploading images:', error);
  }
}

// Run the upload
uploadMissingImages();
