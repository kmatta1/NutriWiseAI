/**
 * Product Catalog Seeder - Client SDK Version
 * 
 * Uses Firebase Client SDK for authentication instead of Admin SDK
 * This works with the existing Firebase configuration
 */

// Import Firebase v9 SDK
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD7Z1SD_6yhEueIUE_NRAh-9kJHjzcwYaE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nutriwise-ai-3fmvs.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nutriwise-ai-3fmvs",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nutriwise-ai-3fmvs.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "336578713643",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:336578713643:web:704650262eaac23288726e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase Client SDK initialized');

// Sample products for testing
const SAMPLE_PRODUCTS = [
  {
    name: "Optimum Nutrition Gold Standard 100% Whey Protein Powder - Vanilla",
    brand: "Optimum Nutrition",
    category: "protein",
    subcategory: "whey-protein", 
    description: "24g of high-quality whey protein isolates and concentrates per serving with 5.5g BCAAs and 4g glutamine",
    servingSize: "1 scoop (30g)",
    servingsPerContainer: 74,
    asin: "B000QSNYGI",
    amazonUrl: "https://www.amazon.com/dp/B000QSNYGI",
    affiliateUrl: "https://www.amazon.com/dp/B000QSNYGI?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71qVeA8rZ8L.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 54.99,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 89432,
    isAvailable: true,
    activeIngredients: [
      { name: "Whey Protein Isolate", amount: "24", unit: "g" },
      { name: "BCAAs", amount: "5.5", unit: "g" },
      { name: "Glutamine", amount: "4", unit: "g" }
    ],
    recommendedDosage: {
      amount: "1 scoop (30g)",
      frequency: "1-2 times daily",
      timing: "post-workout",
      instructions: "Mix with 6-8 oz of cold water or milk. Best consumed within 30 minutes post-workout."
    },
    evidenceLevel: "high",
    studyCount: 127,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/28642676/",
      "https://pubmed.ncbi.nlm.nih.gov/29497302/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: false
    },
    targetAudience: ["muscle_building", "post_workout_recovery", "athletes", "fitness_enthusiasts"],
    tags: ["protein", "whey", "muscle-building", "post-workout", "bcaa"],
    contraindications: ["lactose_intolerance", "milk_allergy"],
    drugInteractions: [],
    sideEffects: ["digestive_discomfort_if_lactose_intolerant"],
    commissionRate: 0.08,
    costPerServing: 0.74,
    isActive: true
  },
  {
    name: "Creatine Monohydrate Powder Micronized by BulkSupplements",
    brand: "BulkSupplements",
    category: "performance",
    subcategory: "creatine",
    description: "Pure micronized creatine monohydrate powder for enhanced athletic performance, muscle strength, and power output",
    servingSize: "1 teaspoon (5g)",
    servingsPerContainer: 200,
    asin: "B00E9M4XEE",
    amazonUrl: "https://www.amazon.com/dp/B00E9M4XEE",
    affiliateUrl: "https://www.amazon.com/dp/B00E9M4XEE?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/61kgT7EIPOL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 24.96,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 15267,
    isAvailable: true,
    activeIngredients: [
      { name: "Creatine Monohydrate", amount: "5", unit: "g" }
    ],
    recommendedDosage: {
      amount: "5g",
      frequency: "daily",
      timing: "post-workout or anytime",
      instructions: "Mix with water, juice, or add to protein shake. Loading phase optional: 20g daily for 5 days, then 5g daily."
    },
    evidenceLevel: "very_high",
    studyCount: 500,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/28615987/",
      "https://pubmed.ncbi.nlm.nih.gov/28474650/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["strength_training", "power_athletes", "bodybuilders", "high_intensity_sports"],
    tags: ["creatine", "strength", "power", "athletic-performance", "muscle-building"],
    contraindications: ["kidney_disease", "kidney_stones_history"],
    drugInteractions: ["nephrotoxic_drugs"],
    sideEffects: ["water_retention", "stomach_upset_if_taken_empty_stomach"],
    commissionRate: 0.08,
    costPerServing: 0.12,
    isActive: true
  },
  {
    name: "Omega-3 Fish Oil 1200mg by Nature Made",
    brand: "Nature Made",
    category: "essential_fatty_acids",
    subcategory: "omega-3",
    description: "High-potency omega-3 fish oil supplement providing 720mg of EPA and DHA per serving for heart and brain health",
    servingSize: "2 softgels",
    servingsPerContainer: 100,
    asin: "B004U3Y8FE",
    amazonUrl: "https://www.amazon.com/dp/B004U3Y8FE",
    affiliateUrl: "https://www.amazon.com/dp/B004U3Y8FE?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81vJM9QmhGL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 19.44,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 22841,
    isAvailable: true,
    activeIngredients: [
      { name: "EPA (Eicosapentaenoic Acid)", amount: "360", unit: "mg" },
      { name: "DHA (Docosahexaenoic Acid)", amount: "240", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 softgels",
      frequency: "daily",
      timing: "with_meals",
      instructions: "Take with food to improve absorption and reduce fishy aftertaste."
    },
    evidenceLevel: "very_high",
    studyCount: 300,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/29145752/",
      "https://pubmed.ncbi.nlm.nih.gov/28900017/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: false
    },
    targetAudience: ["heart_health", "brain_health", "anti_inflammatory", "general_wellness"],
    tags: ["omega-3", "fish-oil", "heart-health", "brain-health", "anti-inflammatory"],
    contraindications: ["fish_allergy", "bleeding_disorders"],
    drugInteractions: ["anticoagulants", "antiplatelet_drugs"],
    sideEffects: ["fishy_aftertaste", "digestive_upset", "fishy_burps"],
    commissionRate: 0.08,
    costPerServing: 0.19,
    isActive: true
  }
];

async function testFirestoreConnection() {
  console.log('🔧 Testing Firestore connection...');
  
  try {
    // Test write operation
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      timestamp: new Date(),
      status: 'connected'
    });
    
    console.log('✅ Firestore write test successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    return false;
  }
}

async function seedProductCatalog() {
  console.log('🌱 Starting product catalog seeding...');
  console.log(`📦 Seeding ${SAMPLE_PRODUCTS.length} products`);
  
  const isConnected = await testFirestoreConnection();
  if (!isConnected) {
    throw new Error('Firestore connection failed');
  }
  
  try {
    const catalogCollection = collection(db, 'productCatalog');
    const now = new Date();
    
    for (const product of SAMPLE_PRODUCTS) {
      const productDocRef = doc(catalogCollection);
      
      const productData = {
        id: productDocRef.id,
        ...product,
        createdAt: now,
        lastUpdated: now,
        lastPriceUpdate: now,
        lastVerified: now
      };

      await setDoc(productDocRef, productData);
      console.log(`✅ Added product: ${product.name} (ID: ${productDocRef.id})`);
    }
    
    console.log(`🎉 Successfully seeded ${SAMPLE_PRODUCTS.length} products to the catalog!`);
    
    // Verify products were added
    const catalogSnapshot = await getDocs(catalogCollection);
    console.log(`📊 Total products in catalog: ${catalogSnapshot.size}`);
    
    return {
      success: true,
      productsAdded: SAMPLE_PRODUCTS.length,
      totalProducts: catalogSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Error seeding product catalog:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProductCatalog()
    .then((result) => {
      console.log('✅ Product catalog seeding completed successfully!');
      console.log(`📊 Result: ${JSON.stringify(result, null, 2)}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product catalog seeding failed:', error);
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Check your Firebase project settings');
      console.log('2. Verify Firestore is enabled in the Firebase console');
      console.log('3. Check Firestore security rules allow writes');
      console.log('4. Verify your environment variables are set correctly');
      process.exit(1);
    });
}

module.exports = { seedProductCatalog, testFirestoreConnection };
