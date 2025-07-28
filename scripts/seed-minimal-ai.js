/**
 * Minimal AI Product Seeding - Working Format
 * Uses exact same structure as seed-firestore-client.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

// Minimal AI product set - 15 strategic products
const AI_PRODUCTS = [
  // 🏋️ MUSCLE BUILDING
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
      { name: "BCAAs", amount: "5.5", unit: "g" }
    ],
    recommendedDosage: {
      amount: "1 scoop (30g)",
      frequency: "1-2 times daily",
      timing: "post-workout",
      instructions: "Mix with 6-8 oz of cold water or milk."
    },
    evidenceLevel: "high",
    studyCount: 127,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/28642676/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: false
    },
    targetAudience: ["muscle_building", "post_workout_recovery", "athletes"],
    tags: ["protein", "whey", "muscle-building", "post-workout"],
    contraindications: ["lactose_intolerance"],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.74,
    isActive: true
  },
  {
    name: "Creatine Monohydrate Powder Micronized by BulkSupplements",
    brand: "BulkSupplements",
    category: "performance",
    subcategory: "creatine",
    description: "Pure micronized creatine monohydrate powder for enhanced athletic performance and muscle strength",
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
      amount: "1 teaspoon (5g)",
      frequency: "daily",
      timing: "post-workout",
      instructions: "Mix with water or juice."
    },
    evidenceLevel: "high",
    studyCount: 200,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/12701815/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["strength_training", "power_athletes", "muscle_building"],
    tags: ["creatine", "strength", "power", "performance"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.12,
    isActive: true
  },
  // 🔥 FAT LOSS
  {
    name: "Green Tea Extract Supplement by NOW Foods",
    brand: "NOW Foods",
    category: "herbs",
    subcategory: "green-tea",
    description: "Standardized green tea extract with EGCG for metabolism support and antioxidant benefits",
    servingSize: "1 capsule",
    servingsPerContainer: 100,
    asin: "B0013OXD38",
    amazonUrl: "https://www.amazon.com/dp/B0013OXD38",
    affiliateUrl: "https://www.amazon.com/dp/B0013OXD38?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81H4xK2PFHL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 12.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 5842,
    isAvailable: true,
    activeIngredients: [
      { name: "Green Tea Extract", amount: "400", unit: "mg" },
      { name: "EGCG", amount: "200", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "2 times daily",
      timing: "between-meals",
      instructions: "Take with water between meals."
    },
    evidenceLevel: "moderate",
    studyCount: 45,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/19906797/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["weight_loss", "metabolism_support", "antioxidants"],
    tags: ["green-tea", "fat-loss", "metabolism", "antioxidants"],
    contraindications: ["caffeine_sensitivity"],
    drugInteractions: ["blood_thinners"],
    sideEffects: ["mild_stomach_upset"],
    commissionRate: 0.08,
    costPerServing: 0.13,
    isActive: true
  },
  // 🧠 COGNITIVE
  {
    name: "L-Theanine 200mg by NOW Foods",
    brand: "NOW Foods", 
    category: "amino-acids",
    subcategory: "l-theanine",
    description: "L-Theanine promotes relaxation and focus without drowsiness",
    servingSize: "1 capsule",
    servingsPerContainer: 60,
    asin: "B001QG6E8G",
    amazonUrl: "https://www.amazon.com/dp/B001QG6E8G",
    affiliateUrl: "https://www.amazon.com/dp/B001QG6E8G?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81YvMN7PROL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 16.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 3247,
    isAvailable: true,
    activeIngredients: [
      { name: "L-Theanine", amount: "200", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "1-2 times daily",
      timing: "anytime",
      instructions: "Take with or without food."
    },
    evidenceLevel: "moderate",
    studyCount: 35,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/18681988/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["focus", "relaxation", "stress_relief"],
    tags: ["l-theanine", "focus", "calm", "cognitive"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.28,
    isActive: true
  },
  // 💤 SLEEP & RECOVERY
  {
    name: "Melatonin 3mg by Nature Made",
    brand: "Nature Made",
    category: "sleep",
    subcategory: "melatonin",
    description: "Melatonin helps support restful sleep and healthy sleep cycles",
    servingSize: "1 tablet",
    servingsPerContainer: 150,
    asin: "B004L8NIKU",
    amazonUrl: "https://www.amazon.com/dp/B004L8NIKU",
    affiliateUrl: "https://www.amazon.com/dp/B004L8NIKU?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71rHWXB0QdL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 9.99,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 12583,
    isAvailable: true,
    activeIngredients: [
      { name: "Melatonin", amount: "3", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 tablet",
      frequency: "daily",
      timing: "bedtime",
      instructions: "Take 30 minutes before bedtime."
    },
    evidenceLevel: "high",
    studyCount: 89,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/23691095/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["sleep_support", "jet_lag", "shift_workers"],
    tags: ["melatonin", "sleep", "recovery", "circadian"],
    contraindications: ["pregnancy", "autoimmune_disorders"],
    drugInteractions: ["sedatives"],
    sideEffects: ["morning_grogginess"],
    commissionRate: 0.08,
    costPerServing: 0.07,
    isActive: true
  }
];

async function seedMinimalAIProducts() {
  console.log('🌱 Starting Minimal AI Product Seeding...');
  console.log(`📊 Seeding ${AI_PRODUCTS.length} strategic products for AI testing`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (let i = 0; i < AI_PRODUCTS.length; i++) {
      const product = AI_PRODUCTS[i];
      const productId = `ai_product_${i + 1}`;
      
      try {
        console.log(`📦 Adding: ${product.name}...`);
        
        const docRef = doc(collection(db, 'productCatalog'), productId);
        await setDoc(docRef, product);
        
        console.log(`  ✅ Successfully added ${product.name} ($${product.currentPrice})`);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Failed to add ${product.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Minimal AI Product Seeding Complete!');
    console.log(`✅ Successfully seeded: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📊 Success rate: ${Math.round((successCount / AI_PRODUCTS.length) * 100)}%`);
    
    if (successCount > 0) {
      console.log('\n🚀 Ready for AI Testing:');
      console.log('  • Muscle building supplements available');
      console.log('  • Fat loss supplements available');
      console.log('  • Cognitive enhancers available');
      console.log('  • Sleep & recovery aids available');
      console.log('  • Comprehensive AI recommendations can now be generated!');
      
      console.log('\n🔄 Next Steps:');
      console.log('  1. Test the AI advisor frontend');
      console.log('  2. Verify real AI recommendations (not rule-based)');
      console.log('  3. Check scientific evidence display');
      console.log('  4. Validate user experience improvements');
    }
    
  } catch (error) {
    console.error('❌ Critical seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedMinimalAIProducts()
    .then(() => {
      console.log('\n✅ Seeding complete! Firebase contains AI-ready product data.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMinimalAIProducts };
