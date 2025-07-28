/**
 * Firebase-Authenticated Product Catalog Seeder
 * 
 * Uses Firebase CLI authentication for admin access
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin with project ID only (uses Firebase CLI auth)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nutriwise-ai-3fmvs'
  });
  console.log('✅ Firebase Admin SDK initialized with CLI authentication');
}

const db = admin.firestore();

// Sample product data for testing
const SAMPLE_PRODUCTS = [
  {
    name: "Optimum Nutrition Gold Standard 100% Whey Protein Powder - Vanilla",
    brand: "Optimum Nutrition", 
    category: "protein",
    subcategory: "whey-protein",
    description: "24g of high-quality whey protein isolates and concentrates per serving",
    currentPrice: 54.99,
    rating: 4.5,
    reviewCount: 89432,
    isAvailable: true,
    isActive: true
  },
  {
    name: "Creatine Monohydrate Powder Micronized by BulkSupplements",
    brand: "BulkSupplements",
    category: "performance", 
    subcategory: "creatine",
    description: "Pure micronized creatine monohydrate powder for enhanced athletic performance",
    currentPrice: 24.96,
    rating: 4.4,
    reviewCount: 15267,
    isAvailable: true,
    isActive: true
  }
];

async function testFirebaseConnection() {
  console.log('🔧 Testing Firebase connection...');
  
  try {
    // Test Firestore connection
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: new Date(),
      status: 'connected'
    });
    
    console.log('✅ Firestore connection successful');
    
    // Clean up test document
    await db.collection('test').doc('connection').delete();
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

async function seedSampleProducts() {
  console.log('🌱 Starting sample product seeding...');
  
  const isConnected = await testFirebaseConnection();
  if (!isConnected) {
    throw new Error('Firebase connection failed');
  }
  
  try {
    const collection = db.collection('productCatalog');
    const now = new Date();
    
    for (const product of SAMPLE_PRODUCTS) {
      const docRef = collection.doc();
      
      const productData = {
        id: docRef.id,
        ...product,
        createdAt: now,
        lastUpdated: now,
        lastPriceUpdate: now,
        lastVerified: now
      };

      await docRef.set(productData);
      console.log(`✅ Added product: ${product.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${SAMPLE_PRODUCTS.length} sample products!`);
    
    // Verify the products were added
    const snapshot = await collection.get();
    console.log(`📊 Total products in catalog: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleProducts()
    .then(() => {
      console.log('✅ Sample product seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sample product seeding failed:', error);
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Make sure you ran: firebase login');
      console.log('2. Make sure you ran: firebase use nutriwise-ai-3fmvs');
      console.log('3. Check that your Firebase project exists and Firestore is enabled');
      console.log('4. Verify your Firebase project ID in the console');
      process.exit(1);
    });
}

module.exports = { seedSampleProducts, testFirebaseConnection };
