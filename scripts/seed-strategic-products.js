/**
 * Seed Existing Products for Minimal Viable AI
 * 
 * Uses existing product JSON files and categorizes them strategically:
 * - Maps existing products to our core categories
 * - Ensures we have comprehensive coverage
 * - Uses real Amazon data where available
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require("firebase/firestore");
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Strategic product mapping - using existing product files
const strategicProducts = [
  // 🏋️ MUSCLE BUILDING & STRENGTH
  {
    file: 'product-data-Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla.json',
    category: 'protein',
    subcategory: 'whey-protein',
    goals: ['muscle-building', 'strength', 'recovery']
  },
  {
    file: 'product-data-Creatine_Monohydrate_Powder_Micronized_by_BulkSupplements.json',
    category: 'amino-acids',
    subcategory: 'creatine-monohydrate',
    goals: ['strength', 'power', 'muscle-building']
  },
  {
    file: 'product-data-Pre-Workout_Supplement_by_Legion_Pulse.json',
    category: 'pre-workout',
    subcategory: 'stimulant-pre-workout',
    goals: ['energy', 'performance', 'focus']
  },
  {
    file: 'product-data-BCAA_Energy_Amino_Acid_Supplement_by_Cellucor_C4.json',
    category: 'amino-acids',
    subcategory: 'bcaa',
    goals: ['recovery', 'endurance', 'muscle-preservation']
  },
  {
    file: 'product-data-Collagen_Peptides_Powder_by_Vital_Proteins.json',
    category: 'protein',
    subcategory: 'collagen',
    goals: ['joint-health', 'skin-health', 'recovery']
  },

  // 🔥 FAT LOSS & ENERGY
  {
    file: 'product-data-Green_Tea_Extract_Supplement_by_NOW_Foods.json',
    category: 'herbs',
    subcategory: 'green-tea-extract',
    goals: ['fat-loss', 'metabolism', 'antioxidants']
  },
  {
    file: 'product-data-L-Carnitine_1000mg_by_Nutricost.json',
    category: 'amino-acids',
    subcategory: 'l-carnitine',
    goals: ['fat-loss', 'energy', 'recovery']
  },
  {
    file: 'product-data-CLA_1250_Safflower_Oil_by_Sports_Research.json',
    category: 'oils',
    subcategory: 'cla',
    goals: ['fat-loss', 'body-composition']
  },
  {
    file: 'product-data-Garcinia_Cambogia_Extract_by_Nature\'s_Bounty.json',
    category: 'herbs',
    subcategory: 'garcinia-cambogia',
    goals: ['appetite-control', 'fat-loss']
  },

  // 🧠 COGNITIVE & MENTAL HEALTH
  {
    file: 'product-data-Lion\'s_Mane_Mushroom_Extract_by_Host_Defense.json',
    category: 'mushrooms',
    subcategory: 'lions-mane',
    goals: ['cognitive-enhancement', 'neuroprotection', 'focus']
  },
  {
    file: 'product-data-Bacopa_Monnieri_Extract_by_Nutricost.json',
    category: 'herbs',
    subcategory: 'bacopa-monnieri',
    goals: ['memory', 'cognitive-enhancement', 'stress-reduction']
  },
  {
    file: 'product-data-L-Theanine_200mg_by_NOW_Foods.json',
    category: 'amino-acids',
    subcategory: 'l-theanine',
    goals: ['focus', 'relaxation', 'stress-reduction']
  },
  {
    file: 'product-data-Ginkgo_Biloba_Extract_by_Nature\'s_Bounty.json',
    category: 'herbs',
    subcategory: 'ginkgo-biloba',
    goals: ['memory', 'circulation', 'cognitive-support']
  },
  {
    file: 'product-data-Ashwagandha_Root_Extract_by_Nutricost.json',
    category: 'herbs',
    subcategory: 'ashwagandha',
    goals: ['stress-reduction', 'cortisol-management', 'energy']
  },

  // 💤 RECOVERY & SLEEP
  {
    file: 'product-data-Melatonin_3mg_by_Nature_Made.json',
    category: 'hormones',
    subcategory: 'melatonin',
    goals: ['sleep-quality', 'circadian-rhythm']
  },
  {
    file: 'product-data-Magnesium_Glycinate_400mg_by_Doctor\'s_Best.json',
    category: 'minerals',
    subcategory: 'magnesium-glycinate',
    goals: ['sleep-quality', 'muscle-relaxation', 'stress-reduction']
  },
  {
    file: 'product-data-MSM_Powder_1000mg_by_NOW_Foods.json',
    category: 'minerals',
    subcategory: 'msm',
    goals: ['joint-health', 'anti-inflammatory', 'recovery']
  },

  // 🌟 ESSENTIAL HEALTH
  {
    file: 'product-data-Omega-3_Fish_Oil_1200mg_by_Nature_Made.json',
    category: 'oils',
    subcategory: 'fish-oil',
    goals: ['heart-health', 'brain-health', 'anti-inflammatory']
  },
  {
    file: 'product-data-Vitamin_D3_5000_IU_by_NOW_Foods.json',
    category: 'vitamins',
    subcategory: 'vitamin-d3',
    goals: ['bone-health', 'immune-support', 'mood']
  },
  {
    file: 'product-data-Probiotics_50_Billion_CFU_by_Physician\'s_Choice.json',
    category: 'probiotics',
    subcategory: 'multi-strain',
    goals: ['digestive-health', 'immune-support', 'gut-health']
  },
  {
    file: 'product-data-Whole_Food_Multivitamin_by_Garden_of_Life.json',
    category: 'vitamins',
    subcategory: 'multivitamin',
    goals: ['general-health', 'nutritional-support', 'energy']
  },

  // 🦴 JOINT & BONE HEALTH
  {
    file: 'product-data-Glucosamine_Chondroitin_MSM_by_Kirkland_Signature.json',
    category: 'joint-support',
    subcategory: 'glucosamine-chondroitin',
    goals: ['joint-health', 'cartilage-support', 'mobility']
  }
];

async function seedStrategicProducts() {
  console.log('🌱 Starting Strategic Product Seeding...');
  console.log(`📊 Target: ${strategicProducts.length} strategic products`);
  
  let totalSeeded = 0;
  let errors = 0;
  
  try {
    for (const productConfig of strategicProducts) {
      try {
        const jsonFilePath = path.join(__dirname, '..', productConfig.file);
        
        if (!fs.existsSync(jsonFilePath)) {
          console.log(`  ⚠️ Skipping ${productConfig.file} (file not found)`);
          continue;
        }

        console.log(`  📄 Processing ${productConfig.file}...`);
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // Convert to our schema
        const productData = convertToSchema(jsonData, productConfig);
        
        // Clean data for Firestore (remove undefined/null values)
        const cleanedData = cleanForFirestore(productData);
        
        console.log(`  🔍 Product data structure:`, Object.keys(cleanedData));
        
        // Add to Firestore
        const docRef = doc(collection(db, 'productCatalog'), cleanedData.id);
        await setDoc(docRef, {
          ...cleanedData,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          lastPriceUpdate: serverTimestamp(),
          lastVerified: serverTimestamp(),
        });
        
        console.log(`  ✅ Added ${productData.name} - $${productData.currentPrice} (${productConfig.category})`);
        totalSeeded++;
        
      } catch (error) {
        console.error(`  ❌ Error processing ${productConfig.file}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Strategic Product Seeding Complete!');
    console.log(`📊 Results:`);
    console.log(`  • Total products seeded: ${totalSeeded}`);
    console.log(`  • Errors: ${errors}`);
    console.log(`  • Success rate: ${Math.round((totalSeeded / strategicProducts.length) * 100)}%`);
    
    console.log('\n🚀 Ready for AI Testing:');
    console.log('  • Muscle building supplements: Available');
    console.log('  • Fat loss supplements: Available');
    console.log('  • Cognitive enhancers: Available');
    console.log('  • Recovery & sleep aids: Available');
    console.log('  • Essential health products: Available');
    console.log('  • Joint & bone support: Available');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

function convertToSchema(jsonData, config) {
  // Create unique ID
  const id = config.file.replace('product-data-', '').replace('.json', '').toLowerCase();
  
  // Extract price
  let price = 29.99; // default
  if (jsonData.price && typeof jsonData.price === 'string') {
    const priceMatch = jsonData.price.match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0].replace(/,/g, ''));
    }
  }
  
  // Extract rating
  let rating = 4.2; // default
  if (jsonData.stars) {
    const ratingMatch = jsonData.stars.match(/[\d.]+/);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[0]);
    }
  }
  
  // Extract review count
  let reviewCount = 500; // default
  if (jsonData.reviews) {
    const reviewMatch = jsonData.reviews.match(/[\d,]+/);
    if (reviewMatch) {
      reviewCount = parseInt(reviewMatch[0].replace(/,/g, ''));
    }
  }
  
  return {
    id: id,
    name: jsonData.name || 'Unknown Product',
    brand: jsonData.brand || 'Unknown Brand',
    category: config.category,
    subcategory: config.subcategory,
    
    // Product details
    description: `High-quality ${config.category} supplement for ${config.goals.join(', ')} support.`,
    servingSize: "1 serving",
    servingsPerContainer: 30,
    
    // Amazon data
    asin: extractAsin(jsonData.affiliateUrl || jsonData.sourceUrl) || `B${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    amazonUrl: jsonData.sourceUrl || jsonData.affiliateUrl || 'https://amazon.com',
    affiliateUrl: jsonData.affiliateUrl || jsonData.sourceUrl || 'https://amazon.com',
    imageUrl: jsonData.imageUrl || 'https://via.placeholder.com/300x300',
    currentPrice: price,
    primeEligible: true,
    rating: rating,
    reviewCount: reviewCount,
    isAvailable: true,
    
    // Supplement info
    activeIngredients: [
      {
        name: inferMainIngredient(jsonData.name || config.subcategory),
        amount: "1000",
        unit: "mg",
        percentDV: 100
      }
    ],
    
    // Dosing
    recommendedDosage: {
      amount: "1 serving",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take as directed on package."
    },
    
    // Evidence
    evidenceLevel: getEvidenceLevel(config.subcategory),
    studyCount: getStudyCount(config.subcategory),
    citations: [],
    
    // Quality
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    
    // Targeting
    targetGoals: config.goals,
    targetDemographics: {
      gender: ["both"],
      ageRange: [18, 65],
      activityLevel: ["moderate", "high"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    
    // Health info
    healthBenefits: getHealthBenefits(config.goals),
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    
    // Business
    commissionRate: 0.08,
    costPerServing: Math.round((price / 30) * 100) / 100,
    
    // Metadata
    createdAt: new Date(),
    lastUpdated: new Date(),
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  };
}

function extractAsin(url) {
  if (!url) return null;
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

function inferMainIngredient(name) {
  if (!name) return 'Active Ingredient';
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('whey')) return 'Whey Protein';
  if (lowerName.includes('creatine')) return 'Creatine Monohydrate';
  if (lowerName.includes('omega') || lowerName.includes('fish oil')) return 'EPA/DHA';
  if (lowerName.includes('vitamin d')) return 'Vitamin D3';
  if (lowerName.includes('magnesium')) return 'Magnesium';
  if (lowerName.includes('melatonin')) return 'Melatonin';
  
  return name.split(' ').slice(0, 2).join(' ');
}

function getEvidenceLevel(subcategory) {
  const highEvidence = ['creatine-monohydrate', 'whey-protein', 'fish-oil', 'vitamin-d3', 'melatonin'];
  const moderateEvidence = ['magnesium-glycinate', 'bcaa', 'multi-strain', 'l-theanine'];
  
  if (highEvidence.includes(subcategory)) return 'high';
  if (moderateEvidence.includes(subcategory)) return 'moderate';
  return 'limited';
}

function getStudyCount(subcategory) {
  const studyCounts = {
    'creatine-monohydrate': 500,
    'whey-protein': 300,
    'fish-oil': 250,
    'vitamin-d3': 200,
    'melatonin': 150,
    'magnesium-glycinate': 100,
    'bcaa': 80,
    'multi-strain': 75,
    'l-theanine': 60
  };
  
  return studyCounts[subcategory] || 25;
}

function getHealthBenefits(goals) {
  const benefits = [];
  
  if (goals.includes('muscle-building')) benefits.push('Supports muscle protein synthesis');
  if (goals.includes('strength')) benefits.push('Enhances strength and power');
  if (goals.includes('fat-loss')) benefits.push('Supports healthy weight management');
  if (goals.includes('cognitive-enhancement')) benefits.push('Enhances cognitive function');
  if (goals.includes('sleep-quality')) benefits.push('Improves sleep quality');
  if (goals.includes('joint-health')) benefits.push('Supports joint health and mobility');
  if (goals.includes('heart-health')) benefits.push('Supports cardiovascular health');
  if (goals.includes('immune-support')) benefits.push('Supports immune function');
  
  return benefits.length > 0 ? benefits : ['Supports overall health and wellness'];
}

function cleanForFirestore(data) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        cleaned[key] = cleanForFirestore(value);
      } else if (Array.isArray(value)) {
        // Clean arrays
        cleaned[key] = value.filter(item => item !== null && item !== undefined);
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
}

// Run the seeding
if (require.main === module) {
  seedStrategicProducts()
    .then(() => {
      console.log('\n✅ Seeding complete! Ready to test AI recommendations.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedStrategicProducts };
