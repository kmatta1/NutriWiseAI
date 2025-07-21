import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Test Firestore connection and examine database structure
export async function testFirestoreConnection() {
  console.log('🔍 Testing Firestore connection...');
  
  try {
    // Check if we can access collections
    const collections = ['supplements', 'cachedStacks', 'users'];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📁 Checking collection: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        console.log(`   Found ${snapshot.size} documents`);
        
        // Show first few documents
        let count = 0;
        snapshot.forEach((doc) => {
          if (count < 3) {
            console.log(`   Document ${doc.id}:`, Object.keys(doc.data()));
            if (collectionName === 'supplements') {
              const data = doc.data();
              console.log(`     Name: ${data.name}`);
              console.log(`     Category: ${data.category}`);
              console.log(`     Image ID: ${data.id || 'No ID field'}`);
              if (data.imageUrl) {
                console.log(`     Image URL: ${data.imageUrl}`);
              }
            }
            count++;
          }
        });
        
      } catch (error) {
        console.log(`   ❌ Error accessing ${collectionName}:`, error);
      }
    }
    
    // Try to get the specific supplement we saw in the screenshot
    try {
      console.log('\n🎯 Looking for specific supplement from screenshot...');
      const turmericRef = doc(db, 'supplements', 'supplement_22');
      const turmericDoc = await getDoc(turmericRef);
      
      if (turmericDoc.exists()) {
        console.log('✅ Found supplement_22:', turmericDoc.data());
      } else {
        console.log('❌ supplement_22 not found');
      }
    } catch (error) {
      console.log('❌ Error getting specific supplement:', error);
    }
    
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
  }
}

// Function to be called from the browser console or a test page
if (typeof window !== 'undefined') {
  (window as any).testFirestore = testFirestoreConnection;
}
