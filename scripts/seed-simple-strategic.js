/**
 * Simple Strategic Product Seeding
 * Based on our working seed-firestore-client.js approach
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require("firebase/firestore");

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

// Simple product definitions for AI testing
const strategicProducts = [
  {
    id: 'optimum_whey_vanilla',
    name: 'Optimum Nutrition Gold Standard Whey Protein - Vanilla',
    brand: 'Optimum Nutrition',
    category: 'protein',
    subcategory: 'whey-protein',
    price: 39.99,
    rating: 4.6,
    goals: ['muscle-building', 'strength', 'recovery'],
    evidenceLevel: 'high',
    studyCount: 300
  },
  {
    id: 'creatine_monohydrate',
    name: 'Creatine Monohydrate Powder Micronized',
    brand: 'BulkSupplements',
    category: 'amino-acids',
    subcategory: 'creatine-monohydrate',
    price: 24.99,
    rating: 4.5,
    goals: ['strength', 'power', 'muscle-building'],
    evidenceLevel: 'high',
    studyCount: 500
  },
  {
    id: 'legion_pulse_preworkout',
    name: 'Pre-Workout Supplement by Legion Pulse',
    brand: 'Legion',
    category: 'pre-workout',
    subcategory: 'stimulant-pre-workout',
    price: 49.99,
    rating: 4.4,
    goals: ['energy', 'performance', 'focus'],
    evidenceLevel: 'moderate',
    studyCount: 50
  },
  {
    id: 'omega3_fish_oil',
    name: 'Omega-3 Fish Oil 1200mg',
    brand: 'Nature Made',
    category: 'oils',
    subcategory: 'fish-oil',
    price: 19.99,
    rating: 4.3,
    goals: ['heart-health', 'brain-health', 'anti-inflammatory'],
    evidenceLevel: 'high',
    studyCount: 250
  },
  {
    id: 'vitamin_d3_5000',
    name: 'Vitamin D3 5000 IU',
    brand: 'NOW Foods',
    category: 'vitamins',
    subcategory: 'vitamin-d3',
    price: 14.99,
    rating: 4.7,
    goals: ['bone-health', 'immune-support', 'mood'],
    evidenceLevel: 'high',
    studyCount: 200
  },
  {
    id: 'magnesium_glycinate',
    name: 'Magnesium Glycinate 400mg',
    brand: 'Doctor\'s Best',
    category: 'minerals',
    subcategory: 'magnesium-glycinate',
    price: 18.99,
    rating: 4.5,
    goals: ['sleep-quality', 'muscle-relaxation', 'stress-reduction'],
    evidenceLevel: 'high',
    studyCount: 100
  },
  {
    id: 'melatonin_3mg',
    name: 'Melatonin 3mg',
    brand: 'Nature Made',
    category: 'hormones',
    subcategory: 'melatonin',
    price: 9.99,
    rating: 4.4,
    goals: ['sleep-quality', 'circadian-rhythm'],
    evidenceLevel: 'high',
    studyCount: 150
  },
  {
    id: 'probiotics_50billion',
    name: 'Probiotics 50 Billion CFU',
    brand: 'Physician\'s Choice',
    category: 'probiotics',
    subcategory: 'multi-strain',
    price: 29.99,
    rating: 4.6,
    goals: ['digestive-health', 'immune-support', 'gut-health'],
    evidenceLevel: 'moderate',
    studyCount: 75
  },
  {
    id: 'lions_mane_extract',
    name: 'Lion\'s Mane Mushroom Extract',
    brand: 'Host Defense',
    category: 'mushrooms',
    subcategory: 'lions-mane',
    price: 34.99,
    rating: 4.3,
    goals: ['cognitive-enhancement', 'neuroprotection', 'focus'],
    evidenceLevel: 'moderate',
    studyCount: 45
  },
  {
    id: 'l_theanine_200mg',
    name: 'L-Theanine 200mg',
    brand: 'NOW Foods',
    category: 'amino-acids',
    subcategory: 'l-theanine',
    price: 16.99,
    rating: 4.5,
    goals: ['focus', 'relaxation', 'stress-reduction'],
    evidenceLevel: 'moderate',
    studyCount: 60
  },
  {
    id: 'green_tea_extract',
    name: 'Green Tea Extract Supplement',
    brand: 'NOW Foods',
    category: 'herbs',
    subcategory: 'green-tea-extract',
    price: 22.99,
    rating: 4.2,
    goals: ['fat-loss', 'metabolism', 'antioxidants'],
    evidenceLevel: 'moderate',
    studyCount: 80
  },
  {
    id: 'l_carnitine_1000mg',
    name: 'L-Carnitine 1000mg',
    brand: 'Nutricost',
    category: 'amino-acids',
    subcategory: 'l-carnitine',
    price: 19.99,
    rating: 4.3,
    goals: ['fat-loss', 'energy', 'recovery'],
    evidenceLevel: 'moderate',
    studyCount: 70
  },
  {
    id: 'ashwagandha_extract',
    name: 'Ashwagandha Root Extract',
    brand: 'Nutricost',
    category: 'herbs',
    subcategory: 'ashwagandha',
    price: 21.99,
    rating: 4.4,
    goals: ['stress-reduction', 'cortisol-management', 'energy'],
    evidenceLevel: 'moderate',
    studyCount: 85
  },
  {
    id: 'collagen_peptides',
    name: 'Collagen Peptides Powder',
    brand: 'Vital Proteins',
    category: 'protein',
    subcategory: 'collagen',
    price: 35.99,
    rating: 4.4,
    goals: ['joint-health', 'skin-health', 'recovery'],
    evidenceLevel: 'moderate',
    studyCount: 40
  },
  {
    id: 'glucosamine_chondroitin',
    name: 'Glucosamine Chondroitin MSM',
    brand: 'Kirkland Signature',
    category: 'joint-support',
    subcategory: 'glucosamine-chondroitin',
    price: 26.99,
    rating: 4.2,
    goals: ['joint-health', 'cartilage-support', 'mobility'],
    evidenceLevel: 'moderate',
    studyCount: 65
  }
];

async function seedSimpleProducts() {
  console.log('🌱 Starting Simple Strategic Product Seeding...');
  console.log(`📊 Target: ${strategicProducts.length} strategic products`);
  
  let totalSeeded = 0;
  
  try {
    for (const product of strategicProducts) {
      try {
        const productData = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          subcategory: product.subcategory,
          
          // Product details
          description: `High-quality ${product.category} supplement for ${product.goals.join(', ')} support.`,
          servingSize: "1 serving",
          servingsPerContainer: 30,
          
          // Amazon data (simplified)
          asin: `B${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          amazonUrl: "https://amazon.com/placeholder",
          affiliateUrl: "https://amazon.com/placeholder?tag=nutriwise-20",
          imageUrl: "https://via.placeholder.com/300x300",
          currentPrice: product.price,
          primeEligible: true,
          rating: product.rating,
          reviewCount: Math.floor(Math.random() * 1000) + 100,
          isAvailable: true,
          
          // Supplement info
          activeIngredients: [
            {
              name: product.name.split(' ')[0],
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
          evidenceLevel: product.evidenceLevel,
          studyCount: product.studyCount,
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
          targetGoals: product.goals,
          targetDemographics: {
            gender: ["both"],
            ageRange: [18, 65],
            activityLevel: ["moderate", "high"],
            experienceLevel: ["beginner", "intermediate", "advanced"]
          },
          
          // Health info
          healthBenefits: product.goals.map(goal => `Supports ${goal.replace('-', ' ')}`),
          contraindications: [],
          drugInteractions: [],
          sideEffects: [],
          
          // Business
          commissionRate: 0.08,
          costPerServing: Math.round((product.price / 30) * 100) / 100,
          
          // Metadata
          isActive: true
        };
        
        const docRef = doc(collection(db, 'productCatalog'), product.id);
        await setDoc(docRef, {
          ...productData,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          lastPriceUpdate: serverTimestamp(),
          lastVerified: serverTimestamp(),
        });
        
        console.log(`  ✅ Added ${product.name} - $${product.price} (${product.category})`);
        totalSeeded++;
        
      } catch (error) {
        console.error(`  ❌ Error processing ${product.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Simple Strategic Product Seeding Complete!');
    console.log(`📊 Results:`);
    console.log(`  • Total products seeded: ${totalSeeded}`);
    console.log(`  • Success rate: ${Math.round((totalSeeded / strategicProducts.length) * 100)}%`);
    
    console.log('\n🚀 Product Categories Available:');
    const categories = [...new Set(strategicProducts.map(p => p.category))];
    categories.forEach(cat => {
      const count = strategicProducts.filter(p => p.category === cat).length;
      console.log(`  • ${cat}: ${count} products`);
    });
    
    console.log('\n✅ Ready for Minimal Viable AI Testing!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedSimpleProducts()
    .then(() => {
      console.log('\n✅ Seeding complete! Ready to test AI recommendations.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSimpleProducts };
