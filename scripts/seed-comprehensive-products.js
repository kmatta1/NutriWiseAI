/**
 * Comprehensive Product Seeding for Full AI System
 * Seeds additional strategic products to demonstrate full AI capabilities
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

// Comprehensive product set - 25 total products across all categories
const COMPREHENSIVE_PRODUCTS = [
  // 🏋️ MUSCLE BUILDING & STRENGTH (7 products)
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
    name: "Dymatize ISO100 Hydrolyzed Whey Protein Isolate",
    brand: "Dymatize",
    category: "protein",
    subcategory: "whey-isolate",
    description: "25g of hydrolyzed whey protein isolate per serving, fast-absorbing and lactose-free",
    servingSize: "1 scoop (32g)",
    servingsPerContainer: 71,
    asin: "B00PUC1S8O",
    amazonUrl: "https://www.amazon.com/dp/B00PUC1S8O",
    affiliateUrl: "https://www.amazon.com/dp/B00PUC1S8O?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71N8KX3KFXL._AC_SX300_SY300_.jpg",
    currentPrice: 69.99,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 12847,
    isAvailable: true,
    activeIngredients: [
      { name: "Hydrolyzed Whey Protein Isolate", amount: "25", unit: "g" },
      { name: "BCAAs", amount: "5.5", unit: "g" }
    ],
    recommendedDosage: {
      amount: "1 scoop (32g)",
      frequency: "1-2 times daily", 
      timing: "post-workout",
      instructions: "Mix with 6-8 oz of cold water."
    },
    evidenceLevel: "high",
    studyCount: 95,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/20048505/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["muscle_building", "lactose_sensitive", "premium_users"],
    tags: ["protein", "isolate", "hydrolyzed", "fast-absorbing"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.99,
    isActive: true
  },
  {
    name: "Garden of Life Sport Organic Plant-Based Protein - Vanilla",
    brand: "Garden of Life",
    category: "protein",
    subcategory: "plant-protein",
    description: "30g of organic plant protein from pea, brown rice, amaranth, and quinoa",
    servingSize: "1 scoop (43g)",
    servingsPerContainer: 29,
    asin: "B01COLCNUG",
    amazonUrl: "https://www.amazon.com/dp/B01COLCNUG",
    affiliateUrl: "https://www.amazon.com/dp/B01COLCNUG?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81ZY4RKYYML._AC_SX300_SY300_.jpg",
    currentPrice: 44.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 8563,
    isAvailable: true,
    activeIngredients: [
      { name: "Organic Plant Protein Blend", amount: "30", unit: "g" },
      { name: "BCAAs", amount: "2.5", unit: "g" }
    ],
    recommendedDosage: {
      amount: "1 scoop (43g)",
      frequency: "1-2 times daily",
      timing: "post-workout",
      instructions: "Mix with plant milk or water."
    },
    evidenceLevel: "moderate",
    studyCount: 42,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/25628520/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: true,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["vegan", "plant_based", "organic_preference"],
    tags: ["protein", "plant-based", "organic", "vegan"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 1.55,
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
  {
    name: "Pre-Workout Supplement by Legion Pulse",
    brand: "Legion",
    category: "pre-workout",
    subcategory: "stimulant-pre-workout",
    description: "Natural pre-workout with citrulline, beta-alanine, betaine, and caffeine for enhanced performance",
    servingSize: "1 scoop (21g)",
    servingsPerContainer: 21,
    asin: "B00PGN0P9C",
    amazonUrl: "https://www.amazon.com/dp/B00PGN0P9C",
    affiliateUrl: "https://www.amazon.com/dp/B00PGN0P9C?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71ZqN+M4CWL._AC_SX300_SY300_.jpg",
    currentPrice: 39.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 3247,
    isAvailable: true,
    activeIngredients: [
      { name: "L-Citrulline", amount: "8", unit: "g" },
      { name: "Beta-Alanine", amount: "3.2", unit: "g" },
      { name: "Caffeine", amount: "350", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 scoop (21g)",
      frequency: "pre-workout",
      timing: "30-45 min before exercise",
      instructions: "Mix with 10-12 oz of water."
    },
    evidenceLevel: "high",
    studyCount: 85,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/20386132/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["athletes", "strength_training", "endurance"],
    tags: ["pre-workout", "energy", "pump", "focus"],
    contraindications: ["caffeine_sensitivity", "heart_conditions"],
    drugInteractions: ["stimulants"],
    sideEffects: ["tingling_from_beta_alanine"],
    commissionRate: 0.08,
    costPerServing: 1.90,
    isActive: true
  },
  {
    name: "BCAA Energy Amino Acid Supplement by Cellucor C4",
    brand: "Cellucor",
    category: "amino-acids",
    subcategory: "bcaa",
    description: "2:1:1 BCAA ratio with natural caffeine and zero sugar for energy and recovery",
    servingSize: "1 scoop (7g)",
    servingsPerContainer: 30,
    asin: "B00QQA06RQ",
    amazonUrl: "https://www.amazon.com/dp/B00QQA06RQ",
    affiliateUrl: "https://www.amazon.com/dp/B00QQA06RQ?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71BfJ4bqH4L._AC_SX300_SY300_.jpg",
    currentPrice: 29.99,
    primeEligible: true,
    rating: 4.2,
    reviewCount: 7854,
    isAvailable: true,
    activeIngredients: [
      { name: "L-Leucine", amount: "2.5", unit: "g" },
      { name: "L-Isoleucine", amount: "1.25", unit: "g" },
      { name: "L-Valine", amount: "1.25", unit: "g" },
      { name: "Natural Caffeine", amount: "135", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 scoop (7g)",
      frequency: "1-2 times daily",
      timing: "during or post-workout",
      instructions: "Mix with 6-8 oz of cold water."
    },
    evidenceLevel: "moderate",
    studyCount: 67,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/19997019/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["endurance_athletes", "intra_workout", "recovery"],
    tags: ["bcaa", "amino-acids", "recovery", "energy"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 1.00,
    isActive: true
  },
  {
    name: "Collagen Peptides Powder by Vital Proteins",
    brand: "Vital Proteins",
    category: "protein",
    subcategory: "collagen",
    description: "Grass-fed collagen peptides for skin, hair, nail, and joint health",
    servingSize: "1 scoop (20g)",
    servingsPerContainer: 28,
    asin: "B00K05PSM8",
    amazonUrl: "https://www.amazon.com/dp/B00K05PSM8",
    affiliateUrl: "https://www.amazon.com/dp/B00K05PSM8?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71cQ8zV+oDL._AC_SX300_SY300_.jpg",
    currentPrice: 43.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 41253,
    isAvailable: true,
    activeIngredients: [
      { name: "Collagen Peptides (Types I & III)", amount: "20", unit: "g" }
    ],
    recommendedDosage: {
      amount: "1 scoop (20g)",
      frequency: "daily",
      timing: "anytime",
      instructions: "Mix with hot or cold liquid."
    },
    evidenceLevel: "moderate",
    studyCount: 38,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/24401291/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["joint_health", "skin_health", "anti_aging"],
    tags: ["collagen", "joint-health", "beauty", "peptides"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 1.57,
    isActive: true
  },

  // 🔥 FAT LOSS & METABOLISM (5 products)
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
  {
    name: "L-Carnitine 1000mg by Nutricost",
    brand: "Nutricost",
    category: "amino-acids",
    subcategory: "l-carnitine",
    description: "L-Carnitine tartrate for fat metabolism and energy production support",
    servingSize: "2 capsules",
    servingsPerContainer: 90,
    asin: "B01I1JBZDE",
    amazonUrl: "https://www.amazon.com/dp/B01I1JBZDE",
    affiliateUrl: "https://www.amazon.com/dp/B01I1JBZDE?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71vZw8oGe8L._AC_SX300_SY300_.jpg",
    currentPrice: 18.99,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 3264,
    isAvailable: true,
    activeIngredients: [
      { name: "L-Carnitine Tartrate", amount: "1000", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "pre-workout",
      instructions: "Take 30 minutes before exercise."
    },
    evidenceLevel: "moderate",
    studyCount: 52,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/11509746/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["fat_loss", "endurance", "energy"],
    tags: ["l-carnitine", "fat-burning", "energy", "endurance"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.21,
    isActive: true
  },
  {
    name: "CLA 1250 Safflower Oil by Sports Research",
    brand: "Sports Research",
    category: "oils",
    subcategory: "cla",
    description: "Conjugated Linoleic Acid from safflower oil for body composition support",
    servingSize: "1 softgel",
    servingsPerContainer: 180,
    asin: "B00ITKQAUC",
    amazonUrl: "https://www.amazon.com/dp/B00ITKQAUC",
    affiliateUrl: "https://www.amazon.com/dp/B00ITKQAUC?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71k8HYyGMuL._AC_SX300_SY300_.jpg",
    currentPrice: 26.99,
    primeEligible: true,
    rating: 4.2,
    reviewCount: 12847,
    isAvailable: true,
    activeIngredients: [
      { name: "CLA (Conjugated Linoleic Acid)", amount: "1250", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 softgel",
      frequency: "3 times daily",
      timing: "with-meals",
      instructions: "Take with meals for best absorption."
    },
    evidenceLevel: "moderate",
    studyCount: 34,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/15159244/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["body_composition", "lean_muscle", "fat_loss"],
    tags: ["cla", "body-composition", "lean-muscle", "fat-loss"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.45,
    isActive: true
  },
  {
    name: "Garcinia Cambogia Extract by Nature's Bounty",
    brand: "Nature's Bounty",
    category: "herbs",
    subcategory: "garcinia-cambogia",
    description: "Garcinia Cambogia with 60% HCA for appetite and weight management support",
    servingSize: "2 capsules",
    servingsPerContainer: 45,
    asin: "B00JKDRYQM",
    amazonUrl: "https://www.amazon.com/dp/B00JKDRYQM",
    affiliateUrl: "https://www.amazon.com/dp/B00JKDRYQM?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81ufJmHh83L._AC_SX300_SY300_.jpg",
    currentPrice: 14.99,
    primeEligible: true,
    rating: 3.9,
    reviewCount: 8264,
    isAvailable: true,
    activeIngredients: [
      { name: "Garcinia Cambogia Extract (60% HCA)", amount: "1500", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "before-meals",
      instructions: "Take 30-60 minutes before meals."
    },
    evidenceLevel: "limited",
    studyCount: 23,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/9820262/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["appetite_control", "weight_management"],
    tags: ["garcinia-cambogia", "appetite-control", "hca", "weight-management"],
    contraindications: ["diabetes", "pregnancy"],
    drugInteractions: ["diabetes_medication"],
    sideEffects: ["digestive_upset"],
    commissionRate: 0.08,
    costPerServing: 0.33,
    isActive: true
  },
  {
    name: "Caffeine Pills 200mg by ProLab",
    brand: "ProLab",
    category: "stimulants",
    subcategory: "caffeine",
    description: "Pure caffeine anhydrous for energy, focus, and metabolism support",
    servingSize: "1 tablet",
    servingsPerContainer: 100,
    asin: "B0011865IQ",
    amazonUrl: "https://www.amazon.com/dp/B0011865IQ",
    affiliateUrl: "https://www.amazon.com/dp/B0011865IQ?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71Nst8bCOFL._AC_SX300_SY300_.jpg",
    currentPrice: 8.99,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 15742,
    isAvailable: true,
    activeIngredients: [
      { name: "Caffeine Anhydrous", amount: "200", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 tablet",
      frequency: "1-2 times daily",
      timing: "morning or pre-workout",
      instructions: "Take with water, not within 6 hours of bedtime."
    },
    evidenceLevel: "high",
    studyCount: 156,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/20164566/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["energy", "focus", "fat_burning", "pre_workout"],
    tags: ["caffeine", "energy", "focus", "thermogenic"],
    contraindications: ["heart_conditions", "anxiety_disorders"],
    drugInteractions: ["stimulants", "blood_pressure_medication"],
    sideEffects: ["jitters", "insomnia"],
    commissionRate: 0.08,
    costPerServing: 0.09,
    isActive: true
  },

  // 🧠 COGNITIVE & MENTAL HEALTH (5 products)
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
  {
    name: "Lion's Mane Mushroom Extract by Host Defense",
    brand: "Host Defense",
    category: "mushrooms",
    subcategory: "lions-mane",
    description: "Lion's Mane mushroom extract for cognitive function and nerve health support",
    servingSize: "2 capsules",
    servingsPerContainer: 60,
    asin: "B01E8YKW9W",
    amazonUrl: "https://www.amazon.com/dp/B01E8YKW9W",
    affiliateUrl: "https://www.amazon.com/dp/B01E8YKW9W?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71rxjvLRD5L._AC_SX300_SY300_.jpg",
    currentPrice: 34.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 4562,
    isAvailable: true,
    activeIngredients: [
      { name: "Lion's Mane Mushroom Extract", amount: "1000", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food for best absorption."
    },
    evidenceLevel: "moderate",
    studyCount: 28,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/18844328/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: true,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["cognitive_enhancement", "neuroprotection", "focus"],
    tags: ["lions-mane", "nootropic", "cognitive", "mushroom"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.58,
    isActive: true
  },
  {
    name: "Bacopa Monnieri Extract by Nutricost",
    brand: "Nutricost",
    category: "herbs",
    subcategory: "bacopa-monnieri",
    description: "Standardized Bacopa Monnieri extract for memory and cognitive function support",
    servingSize: "1 capsule",
    servingsPerContainer: 120,
    asin: "B01LZGWFPZ",
    amazonUrl: "https://www.amazon.com/dp/B01LZGWFPZ",
    affiliateUrl: "https://www.amazon.com/dp/B01LZGWFPZ?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71n+MVwzMKL._AC_SX300_SY300_.jpg",
    currentPrice: 19.99,
    primeEligible: true,
    rating: 4.2,
    reviewCount: 2847,
    isAvailable: true,
    activeIngredients: [
      { name: "Bacopa Monnieri Extract (20% Bacosides)", amount: "500", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food to reduce stomach upset."
    },
    evidenceLevel: "moderate",
    studyCount: 41,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/22747190/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["memory", "cognitive_enhancement", "students"],
    tags: ["bacopa", "memory", "cognitive", "nootropic"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: ["stomach_upset_if_taken_without_food"],
    commissionRate: 0.08,
    costPerServing: 0.17,
    isActive: true
  },
  {
    name: "Ginkgo Biloba Extract by Nature's Bounty",
    brand: "Nature's Bounty",
    category: "herbs",
    subcategory: "ginkgo-biloba",
    description: "Standardized Ginkgo Biloba extract for memory and circulation support",
    servingSize: "1 capsule",
    servingsPerContainer: 100,
    asin: "B000NPYY04",
    amazonUrl: "https://www.amazon.com/dp/B000NPYY04",
    affiliateUrl: "https://www.amazon.com/dp/B000NPYY04?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81vOWDIvOIL._AC_SX300_SY300_.jpg",
    currentPrice: 12.99,
    primeEligible: true,
    rating: 4.1,
    reviewCount: 6842,
    isAvailable: true,
    activeIngredients: [
      { name: "Ginkgo Biloba Extract (24% Flavone Glycosides)", amount: "120", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food."
    },
    evidenceLevel: "moderate",
    studyCount: 67,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/15173128/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["memory", "circulation", "cognitive_support"],
    tags: ["ginkgo", "memory", "circulation", "cognitive"],
    contraindications: ["blood_thinners"],
    drugInteractions: ["anticoagulants"],
    sideEffects: ["headache", "dizziness"],
    commissionRate: 0.08,
    costPerServing: 0.13,
    isActive: true
  },
  {
    name: "Ashwagandha Root Extract by Nutricost",
    brand: "Nutricost",
    category: "herbs",
    subcategory: "ashwagandha",
    description: "KSM-66 Ashwagandha root extract for stress management and vitality support",
    servingSize: "2 capsules",
    servingsPerContainer: 60,
    asin: "B01C8HSKGU",
    amazonUrl: "https://www.amazon.com/dp/B01C8HSKGU",
    affiliateUrl: "https://www.amazon.com/dp/B01C8HSKGU?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71tX4v3vLdL._AC_SX300_SY300_.jpg",
    currentPrice: 21.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 8547,
    isAvailable: true,
    activeIngredients: [
      { name: "KSM-66 Ashwagandha Root Extract", amount: "600", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food, preferably in the morning."
    },
    evidenceLevel: "moderate",
    studyCount: 52,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/19718255/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["stress_management", "cortisol_support", "energy"],
    tags: ["ashwagandha", "adaptogen", "stress", "cortisol"],
    contraindications: ["thyroid_medication", "immunosuppressants"],
    drugInteractions: ["thyroid_medication"],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.37,
    isActive: true
  },

  // 💤 SLEEP & RECOVERY (4 products)
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
  },
  {
    name: "ZMA Zinc Magnesium by NOW Foods",
    brand: "NOW Foods",
    category: "minerals",
    subcategory: "zma",
    description: "Zinc, Magnesium, and Vitamin B6 for recovery and sleep support",
    servingSize: "3 capsules",
    servingsPerContainer: 30,
    asin: "B0013OXKHC",
    amazonUrl: "https://www.amazon.com/dp/B0013OXKHC",
    affiliateUrl: "https://www.amazon.com/dp/B0013OXKHC?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81lwgLi-RjL._AC_SX300_SY300_.jpg",
    currentPrice: 19.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 7264,
    isAvailable: true,
    activeIngredients: [
      { name: "Zinc (as Monomethionine)", amount: "30", unit: "mg" },
      { name: "Magnesium (as Aspartate)", amount: "450", unit: "mg" },
      { name: "Vitamin B6", amount: "10.5", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "3 capsules",
      frequency: "daily",
      timing: "bedtime",
      instructions: "Take on empty stomach 30-60 minutes before bed."
    },
    evidenceLevel: "moderate",
    studyCount: 31,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/10919047/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["recovery", "sleep_quality", "athletes"],
    tags: ["zma", "recovery", "sleep", "minerals"],
    contraindications: [],
    drugInteractions: ["antibiotics"],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.67,
    isActive: true
  },
  {
    name: "Magnesium Glycinate 400mg by Doctor's Best",
    brand: "Doctor's Best",
    category: "minerals", 
    subcategory: "magnesium",
    description: "Chelated magnesium glycinate for superior absorption and muscle relaxation",
    servingSize: "2 tablets",
    servingsPerContainer: 120,
    asin: "B000BD0RT0",
    amazonUrl: "https://www.amazon.com/dp/B000BD0RT0",
    affiliateUrl: "https://www.amazon.com/dp/B000BD0RT0?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71n5q1hN0nL._AC_SX300_SY300_.jpg",
    currentPrice: 18.99,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 15847,
    isAvailable: true,
    activeIngredients: [
      { name: "Magnesium Glycinate Chelate", amount: "400", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 tablets",
      frequency: "daily",
      timing: "evening",
      instructions: "Take with or without food, preferably in the evening."
    },
    evidenceLevel: "high",
    studyCount: 78,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/23144599/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["sleep_quality", "muscle_relaxation", "stress"],
    tags: ["magnesium", "sleep", "relaxation", "chelated"],
    contraindications: ["kidney_disease"],
    drugInteractions: ["antibiotics"],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.16,
    isActive: true
  },
  {
    name: "Turmeric Curcumin with BioPerine by BioSchwartz",
    brand: "BioSchwartz",
    category: "herbs",
    subcategory: "turmeric",
    description: "High-potency turmeric curcumin with black pepper extract for enhanced absorption",
    servingSize: "2 capsules",
    servingsPerContainer: 45,
    asin: "B019E9XKNI",
    amazonUrl: "https://www.amazon.com/dp/B019E9XKNI",
    affiliateUrl: "https://www.amazon.com/dp/B019E9XKNI?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71qjJdVYQPL._AC_SX300_SY300_.jpg",
    currentPrice: 24.99,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 24847,
    isAvailable: true,
    activeIngredients: [
      { name: "Turmeric Root Extract (95% Curcuminoids)", amount: "1500", unit: "mg" },
      { name: "BioPerine Black Pepper Extract", amount: "10", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food for best absorption."
    },
    evidenceLevel: "high",
    studyCount: 94,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/17569207/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["anti_inflammatory", "joint_health", "recovery"],
    tags: ["turmeric", "curcumin", "anti-inflammatory", "bioperine"],
    contraindications: ["blood_thinners", "gallstones"],
    drugInteractions: ["blood_thinners"],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.56,
    isActive: true
  },

  // 🌟 ESSENTIAL HEALTH (4 products)
  {
    name: "Omega-3 Fish Oil 1200mg by Nature Made",
    brand: "Nature Made",
    category: "oils",
    subcategory: "fish-oil",
    description: "High-quality fish oil with EPA and DHA for heart and brain health",
    servingSize: "2 softgels",
    servingsPerContainer: 100,
    asin: "B004U3Y6N8",
    amazonUrl: "https://www.amazon.com/dp/B004U3Y6N8",
    affiliateUrl: "https://www.amazon.com/dp/B004U3Y6N8?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81H4xK2PFHL._AC_SX300_SY300_.jpg",
    currentPrice: 22.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 18562,
    isAvailable: true,
    activeIngredients: [
      { name: "EPA (Eicosapentaenoic Acid)", amount: "360", unit: "mg" },
      { name: "DHA (Docosahexaenoic Acid)", amount: "240", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 softgels",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food to enhance absorption."
    },
    evidenceLevel: "high",
    studyCount: 127,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/16841861/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: false
    },
    targetAudience: ["heart_health", "brain_health", "anti_inflammatory"],
    tags: ["omega-3", "fish-oil", "epa", "dha"],
    contraindications: ["fish_allergies"],
    drugInteractions: ["blood_thinners"],
    sideEffects: ["fishy_aftertaste"],
    commissionRate: 0.08,
    costPerServing: 0.23,
    isActive: true
  },
  {
    name: "Vitamin D3 5000 IU by NOW Foods",
    brand: "NOW Foods",
    category: "vitamins",
    subcategory: "vitamin-d3",
    description: "High-potency vitamin D3 for bone health, immune support, and mood",
    servingSize: "1 softgel",
    servingsPerContainer: 240,
    asin: "B002DTC0WQ",
    amazonUrl: "https://www.amazon.com/dp/B002DTC0WQ",
    affiliateUrl: "https://www.amazon.com/dp/B002DTC0WQ?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71gw9CkrLcL._AC_SX300_SY300_.jpg",
    currentPrice: 14.99,
    primeEligible: true,
    rating: 4.7,
    reviewCount: 8964,
    isAvailable: true,
    activeIngredients: [
      { name: "Vitamin D3 (Cholecalciferol)", amount: "5000", unit: "IU" }
    ],
    recommendedDosage: {
      amount: "1 softgel",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with a fat-containing meal for best absorption."
    },
    evidenceLevel: "high",
    studyCount: 156,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/18400738/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["bone_health", "immune_support", "mood_support"],
    tags: ["vitamin-d3", "bone-health", "immune", "mood"],
    contraindications: ["hypercalcemia"],
    drugInteractions: ["thiazide_diuretics"],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 0.06,
    isActive: true
  },
  {
    name: "Probiotics 50 Billion CFU by Physician's Choice",
    brand: "Physician's Choice",
    category: "probiotics",
    subcategory: "multi-strain",
    description: "Multi-strain probiotic with 50 billion CFU for digestive and immune health",
    servingSize: "1 capsule",
    servingsPerContainer: 30,
    asin: "B078XBYN8F",
    amazonUrl: "https://www.amazon.com/dp/B078XBYN8F",
    affiliateUrl: "https://www.amazon.com/dp/B078XBYN8F?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71cPD8b5X7L._AC_SX300_SY300_.jpg",
    currentPrice: 29.99,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 14726,
    isAvailable: true,
    activeIngredients: [
      { name: "Probiotic Blend (10 strains)", amount: "50", unit: "billion CFU" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food, preferably in the morning."
    },
    evidenceLevel: "moderate",
    studyCount: 73,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/23474365/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["digestive_health", "immune_support", "gut_health"],
    tags: ["probiotics", "digestive", "gut-health", "immune"],
    contraindications: ["immunocompromised"],
    drugInteractions: ["antibiotics"],
    sideEffects: ["mild_digestive_changes"],
    commissionRate: 0.08,
    costPerServing: 1.00,
    isActive: true
  },
  {
    name: "Multivitamin by Garden of Life Vitamin Code Men",
    brand: "Garden of Life",
    category: "vitamins",
    subcategory: "multivitamin",
    description: "Whole food multivitamin for men with vitamins, minerals, and probiotics",
    servingSize: "4 capsules",
    servingsPerContainer: 30,
    asin: "B003B3OAPK",
    amazonUrl: "https://www.amazon.com/dp/B003B3OAPK",
    affiliateUrl: "https://www.amazon.com/dp/B003B3OAPK?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81NhQp0G3hL._AC_SX300_SY300_.jpg",
    currentPrice: 39.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 5847,
    isAvailable: true,
    activeIngredients: [
      { name: "Vitamin A", amount: "5000", unit: "IU" },
      { name: "Vitamin C", amount: "120", unit: "mg" },
      { name: "Vitamin D3", amount: "800", unit: "IU" },
      { name: "B-Complex", amount: "various", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "4 capsules",
      frequency: "daily",
      timing: "with-food",
      instructions: "Take with food, can split into 2 doses."
    },
    evidenceLevel: "moderate",
    studyCount: 35,
    citations: ["https://pubmed.ncbi.nlm.nih.gov/19735513/"],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: true,
      nonGmo: true,
      allergenFree: true
    },
    targetAudience: ["general_health", "nutritional_insurance", "men"],
    tags: ["multivitamin", "whole-food", "men", "general-health"],
    contraindications: [],
    drugInteractions: [],
    sideEffects: [],
    commissionRate: 0.08,
    costPerServing: 1.33,
    isActive: true
  }
];

async function seedComprehensiveProducts() {
  console.log('🌱 Starting Comprehensive Product Seeding...');
  console.log(`📊 Seeding ${COMPREHENSIVE_PRODUCTS.length} strategic products for full AI system`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (let i = 0; i < COMPREHENSIVE_PRODUCTS.length; i++) {
      const product = COMPREHENSIVE_PRODUCTS[i];
      const productId = `comprehensive_product_${i + 1}`;
      
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
    
    console.log('\n🎉 Comprehensive Product Seeding Complete!');
    console.log(`✅ Successfully seeded: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📊 Success rate: ${Math.round((successCount / COMPREHENSIVE_PRODUCTS.length) * 100)}%`);
    
    if (successCount > 0) {
      console.log('\n🚀 Product Categories Seeded:');
      
      const categories = {};
      COMPREHENSIVE_PRODUCTS.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  • ${category}: ${count} products`);
      });
      
      console.log('\n🎯 Ready for Full AI System:');
      console.log('  • Comprehensive product catalog available');
      console.log('  • Multiple options per category for AI selection');
      console.log('  • Evidence levels and study counts included');
      console.log('  • Scientific citations and contraindications mapped');
      console.log('  • Comprehensive AI advisor can now generate sophisticated stacks!');
    }
    
  } catch (error) {
    console.error('❌ Critical seeding error:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedComprehensiveProducts()
    .then(() => {
      console.log('\n✅ Comprehensive seeding complete! Ready for full AI system testing.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedComprehensiveProducts };
