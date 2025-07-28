/**
 * Expanded Core Products for Minimal Viable AI
 * 
 * Strategic selection of 38 products covering all major customer use cases:
 * - Muscle building & strength
 * - Fat loss & energy  
 * - Cognitive & mental health
 * - Recovery & sleep
 * - Essential health
 * - Joint & bone health
 * - Pre/post workout
 */

const expandedCoreProducts = [
  // 🏋️ MUSCLE BUILDING & STRENGTH (8 products)
  {
    category: 'muscle-building',
    products: [
      'Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla', // Premium whey
      'Dymatize_ISO100_Whey_Protein_Isolate', // Budget whey option
      'Garden_of_Life_Sport_Organic_Plant_Based_Protein', // Plant-based
      'Casein_Protein_Powder_by_Dymatize_Elite', // Slow-release protein
      'Creatine_Monohydrate_Powder_Micronized_by_BulkSupplements', // Creatine powder
      'Creatine_Monohydrate_Capsules_by_NOW_Foods', // Creatine capsules
      'Pre-Workout_Supplement_by_Legion_Pulse', // High-stim pre-workout
      'BCAA_Energy_Amino_Acid_Supplement_by_Cellucor_C4' // BCAA support
    ]
  },

  // 🔥 FAT LOSS & ENERGY (6 products)  
  {
    category: 'fat-loss',
    products: [
      'Hydroxycut_Hardcore_Elite_Fat_Burner', // Thermogenic
      'Green_Tea_Extract_Supplement_by_NOW_Foods', // Natural metabolism
      'L-Carnitine_1000mg_by_Nutricost', // Fat oxidation
      'CLA_1250_Safflower_Oil_by_Sports_Research', // Body composition
      'Garcinia_Cambogia_Extract_by_Nature\'s_Bounty', // Appetite control
      'Caffeine_Pills_200mg_by_ProLab' // Energy support
    ]
  },

  // 🧠 COGNITIVE & MENTAL HEALTH (5 products)
  {
    category: 'cognitive',
    products: [
      'Lion\'s_Mane_Mushroom_Extract_by_Host_Defense', // Neurogenesis
      'Bacopa_Monnieri_Extract_by_Nutricost', // Memory enhancement
      'L-Theanine_200mg_by_NOW_Foods', // Focus + calm
      'Ginkgo_Biloba_Extract_by_Nature\'s_Bounty', // Circulation + memory
      'Ashwagandha_Root_Extract_by_Nutricost' // Stress reduction
    ]
  },

  // 💤 RECOVERY & SLEEP (4 products)
  {
    category: 'recovery',
    products: [
      'Melatonin_3mg_by_Nature_Made', // Sleep quality
      'ZMA_Zinc_Magnesium_by_NOW_Foods', // Recovery + sleep
      'Magnesium_Glycinate_400mg_by_Doctor\'s_Best', // Relaxation
      'Turmeric_Curcumin_with_BioPerine_by_BioSchwartz' // Anti-inflammatory
    ]
  },

  // 🌟 ESSENTIAL HEALTH (8 products)
  {
    category: 'essential-health',
    products: [
      'Men\'s_Multivitamin_by_Garden_of_Life_Vitamin_Code', // Men's health
      'Women\'s_Multivitamin_by_Garden_of_Life_Vitamin_Code', // Women's health
      'Omega-3_Fish_Oil_1200mg_by_Nature_Made', // Essential fatty acids
      'Algae_Omega_3_by_Nordic_Naturals', // Plant-based omega-3
      'Vitamin_D3_2000_IU_by_NOW_Foods', // Standard D3
      'Vitamin_D3_5000_IU_by_Sports_Research', // High potency D3
      'Probiotics_50_Billion_CFU_by_Physician\'s_Choice', // Gut health
      'Digestive_Enzymes_by_NOW_Foods' // Digestive support
    ]
  },

  // 🦴 JOINT & BONE HEALTH (4 products)
  {
    category: 'joint-health',
    products: [
      'Glucosamine_Chondroitin_MSM_by_Kirkland_Signature', // Joint support
      'Collagen_Peptides_Powder_by_Vital_Proteins', // Collagen powder
      'Collagen_Capsules_by_Sports_Research', // Collagen capsules
      'MSM_Powder_1000mg_by_NOW_Foods' // Anti-inflammatory
    ]
  },

  // ⚡ PRE/POST WORKOUT (3 products)
  {
    category: 'workout-support',
    products: [
      'Pump_Pre_Workout_by_Ghost_Legend', // Stimulant-free pump
      'Post_Workout_Recovery_by_Optimum_Nutrition', // Recovery blend
      'Electrolyte_Powder_by_LMNT' // Hydration support
    ]
  }
];

// Generate seeding data for products we don't have JSON files for
const generateProductData = (productName, category) => {
  // This will create basic product data for products we don't have files for
  // We'll enhance this with real Amazon data later
  return {
    id: productName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: productName.replace(/_/g, ' '),
    brand: extractBrand(productName),
    category: category,
    subcategory: extractSubcategory(productName),
    
    // Basic product details
    description: `High-quality ${category} supplement for optimal health and performance.`,
    servingSize: "1 serving",
    servingsPerContainer: 30,
    
    // Placeholder Amazon data (to be updated with real data)
    asin: `B${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amazonUrl: `https://amazon.com/dp/placeholder`,
    affiliateUrl: `https://amazon.com/dp/placeholder?tag=nutriwise-20`,
    imageUrl: "https://via.placeholder.com/300x300",
    currentPrice: Math.floor(Math.random() * 50) + 20,
    primeEligible: true,
    rating: 4.0 + Math.random() * 1.0,
    reviewCount: Math.floor(Math.random() * 1000) + 100,
    isAvailable: true,
    
    // Basic supplement info
    activeIngredients: [
      {
        name: extractMainIngredient(productName),
        amount: "1000",
        unit: "mg",
        percentDV: 100
      }
    ],
    
    // Dosing info
    recommendedDosage: {
      amount: "1 serving",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take as directed on package."
    },
    
    // Evidence level based on ingredient
    evidenceLevel: getEvidenceLevel(productName),
    studyCount: Math.floor(Math.random() * 20) + 5,
    citations: [],
    
    // Quality factors
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    
    // Target info
    targetGoals: getTargetGoals(category),
    targetDemographics: {
      gender: ["both"],
      ageRange: [18, 65],
      activityLevel: ["moderate", "high"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    
    // Health info
    healthBenefits: getHealthBenefits(category),
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    
    // Business data
    commissionRate: 0.08,
    costPerServing: 1.50,
    
    // Metadata
    createdAt: new Date(),
    lastUpdated: new Date(),
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  };
};

function extractBrand(productName) {
  const brands = ['Optimum_Nutrition', 'NOW_Foods', 'Nature_Made', 'Nutricost', 'BulkSupplements', 
                 'Garden_of_Life', 'Sports_Research', 'Vital_Proteins', 'Host_Defense'];
  const found = brands.find(brand => productName.includes(brand));
  return found ? found.replace(/_/g, ' ') : 'Generic Brand';
}

function extractSubcategory(productName) {
  if (productName.includes('Whey')) return 'whey-protein';
  if (productName.includes('Creatine')) return 'creatine-monohydrate';
  if (productName.includes('Omega')) return 'fish-oil';
  if (productName.includes('Vitamin_D')) return 'vitamin-d3';
  if (productName.includes('Magnesium')) return 'magnesium';
  if (productName.includes('Melatonin')) return 'melatonin';
  return 'general';
}

function extractMainIngredient(productName) {
  if (productName.includes('Whey')) return 'Whey Protein';
  if (productName.includes('Creatine')) return 'Creatine Monohydrate';
  if (productName.includes('Omega')) return 'EPA/DHA';
  if (productName.includes('Vitamin_D')) return 'Vitamin D3';
  return 'Active Ingredient';
}

function getEvidenceLevel(productName) {
  const highEvidence = ['Creatine', 'Whey', 'Omega', 'Vitamin_D', 'Melatonin'];
  const moderateEvidence = ['Magnesium', 'BCAA', 'Probiotics'];
  
  if (highEvidence.some(ing => productName.includes(ing))) return 'high';
  if (moderateEvidence.some(ing => productName.includes(ing))) return 'moderate';
  return 'limited';
}

function getTargetGoals(category) {
  const goalMap = {
    'muscle-building': ['muscle-building', 'strength', 'recovery'],
    'fat-loss': ['fat-loss', 'energy', 'metabolism'],
    'cognitive': ['focus', 'memory', 'brain-health'],
    'recovery': ['recovery', 'sleep', 'stress-relief'],
    'essential-health': ['general-health', 'immune-support'],
    'joint-health': ['joint-health', 'mobility', 'anti-inflammatory'],
    'workout-support': ['performance', 'endurance', 'hydration']
  };
  return goalMap[category] || ['general-health'];
}

function getHealthBenefits(category) {
  const benefitMap = {
    'muscle-building': ['Supports muscle protein synthesis', 'Enhances strength', 'Improves recovery'],
    'fat-loss': ['Boosts metabolism', 'Supports fat oxidation', 'Increases energy'],
    'cognitive': ['Enhances focus', 'Improves memory', 'Reduces brain fog'],
    'recovery': ['Improves sleep quality', 'Reduces inflammation', 'Speeds recovery'],
    'essential-health': ['Supports immune function', 'Fills nutritional gaps', 'Promotes overall health'],
    'joint-health': ['Supports joint flexibility', 'Reduces inflammation', 'Maintains cartilage'],
    'workout-support': ['Enhances performance', 'Improves endurance', 'Maintains hydration']
  };
  return benefitMap[category] || ['Supports general health'];
}

// Export functions
module.exports = {
  expandedCoreProducts,
  generateProductData
};
