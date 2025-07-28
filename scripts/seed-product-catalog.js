/**
 * Product Catalog Seeder - CommonJS Version
 * 
 * Seeds the Firestore database with a comprehensive supplement product catalog
 * This replaces the old cached stacks approach with a dynamic product-based system
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nutriwise-ai-3fmvs',
  });
  console.log('✅ Firebase Admin SDK initialized');
}

const db = admin.firestore();

// Comprehensive product catalog based on actual Amazon supplement data
const INITIAL_PRODUCT_CATALOG = [
  // PROTEIN SUPPLEMENTS
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

  // CREATINE SUPPLEMENTS  
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

  // OMEGA-3 SUPPLEMENTS
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
  },

  // Add more products as needed...
  {
    name: "Ashwagandha Root Extract by Nutricost",
    brand: "Nutricost",
    category: "adaptogens",
    subcategory: "stress-support",
    description: "Standardized ashwagandha root extract (600mg) for stress management, cortisol support, and overall wellness",
    servingSize: "1 capsule",
    servingsPerContainer: 120,
    asin: "B01D0Z48P8",
    amazonUrl: "https://www.amazon.com/dp/B01D0Z48P8",
    affiliateUrl: "https://www.amazon.com/dp/B01D0Z48P8?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71kh2kJKSQL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 17.95,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 8392,
    isAvailable: true,
    activeIngredients: [
      { name: "Ashwagandha Root Extract", amount: "600", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "1-2 times daily",
      timing: "with_meals",
      instructions: "Take with food. Can be taken morning or evening based on individual response."
    },
    evidenceLevel: "high",
    studyCount: 89,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/30305843/",
      "https://pubmed.ncbi.nlm.nih.gov/31991167/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["stress_management", "anxiety_support", "sleep_quality", "energy_balance"],
    tags: ["ashwagandha", "adaptogen", "stress-relief", "anxiety", "cortisol"],
    contraindications: ["pregnancy", "breastfeeding", "autoimmune_disorders"],
    drugInteractions: ["immunosuppressants", "sedatives"],
    sideEffects: ["drowsiness", "stomach_upset", "diarrhea"],
    commissionRate: 0.08,
    costPerServing: 0.15,
    isActive: true
  },

  {
    name: "Magnesium Glycinate 400mg by Doctor's Best",
    brand: "Doctor's Best",
    category: "minerals",
    subcategory: "magnesium",
    description: "Highly bioavailable chelated magnesium glycinate for muscle relaxation, sleep support, and nervous system health",
    servingSize: "2 tablets",
    servingsPerContainer: 60,
    asin: "B000BD0RT0",
    amazonUrl: "https://www.amazon.com/dp/B000BD0RT0",
    affiliateUrl: "https://www.amazon.com/dp/B000BD0RT0?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71AoNj5NDDL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 13.77,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 45932,
    isAvailable: true,
    activeIngredients: [
      { name: "Magnesium (as Magnesium Glycinate)", amount: "400", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 tablets",
      frequency: "daily",  
      timing: "evening",
      instructions: "Take 30-60 minutes before bedtime for sleep support, or as directed by healthcare provider."
    },
    evidenceLevel: "high",
    studyCount: 156,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/28392498/",
      "https://pubmed.ncbi.nlm.nih.gov/23853635/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["sleep_support", "muscle_relaxation", "stress_relief", "bone_health"],
    tags: ["magnesium", "sleep", "muscle-relaxation", "glycinate", "bioavailable"],
    contraindications: ["kidney_disease", "heart_block"],
    drugInteractions: ["antibiotics", "diuretics", "bisphosphonates"],
    sideEffects: ["diarrhea_high_doses", "nausea", "stomach_cramps"],
    commissionRate: 0.08,
    costPerServing: 0.23,
    isActive: true
  }
];

async function seedProductCatalog() {
  console.log('🌱 Starting product catalog seeding...');
  console.log(`📦 Seeding ${INITIAL_PRODUCT_CATALOG.length} products`);
  
  try {
    const collection = db.collection('productCatalog');
    const now = new Date();
    
    for (const product of INITIAL_PRODUCT_CATALOG) {
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
      console.log(`✅ Added product: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log(`🎉 Successfully seeded ${INITIAL_PRODUCT_CATALOG.length} products to the catalog!`);
    
    // Get catalog stats
    const snapshot = await collection.get();
    console.log(`📊 Total products in catalog: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error seeding product catalog:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedProductCatalog()
    .then(() => {
      console.log('✅ Product catalog seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product catalog seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProductCatalog, INITIAL_PRODUCT_CATALOG };
