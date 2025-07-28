/**
 * Product Catalog Seeder
 * 
 * Seeds the Firestore database with a comprehensive supplement product catalog
 * This replaces the old cached stacks approach with a dynamic product-based system
 */

import { ProductCatalogItem } from '../src/lib/product-catalog-service';
import { productCatalogAdminService } from '../src/lib/product-catalog-admin-service';

// Comprehensive product catalog based on actual Amazon supplement data
const INITIAL_PRODUCT_CATALOG: Omit<ProductCatalogItem, 'id' | 'createdAt' | 'lastUpdated'>[] = [
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
      allergenFree: false,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["muscle-building", "recovery", "strength"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 65],
      activityLevel: ["moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports muscle protein synthesis",
      "Enhances post-workout recovery",
      "Provides essential amino acids",
      "Supports lean muscle mass maintenance"
    ],
    contraindications: [
      "Dairy allergies or lactose intolerance",
      "Kidney disease (consult physician)"
    ],
    drugInteractions: [],
    sideEffects: ["Mild digestive upset in sensitive individuals"],
    commissionRate: 0.08,
    costPerServing: 0.74,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // CREATINE
  {
    name: "Creatine Monohydrate Powder Micronized by BulkSupplements",
    brand: "BulkSupplements",
    category: "amino-acids",
    subcategory: "creatine-monohydrate",
    description: "Pure creatine monohydrate powder for enhanced strength, power, and muscle mass",
    servingSize: "5g",
    servingsPerContainer: 200,
    asin: "B00E9M4XEE",
    amazonUrl: "https://www.amazon.com/dp/B00E9M4XEE",
    affiliateUrl: "https://www.amazon.com/dp/B00E9M4XEE?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/61F7XCQ1RKL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 19.96,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 28543,
    isAvailable: true,
    activeIngredients: [
      { name: "Creatine Monohydrate", amount: "5", unit: "g" }
    ],
    recommendedDosage: {
      amount: "5g",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Mix with water, juice, or protein shake. Can be taken at any time of day."
    },
    evidenceLevel: "high",
    studyCount: 312,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/28615996/",
      "https://pubmed.ncbi.nlm.nih.gov/29059531/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["strength", "muscle-building", "power"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 65],
      activityLevel: ["moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Increases muscle strength and power",
      "Enhances high-intensity exercise performance",
      "Supports muscle volume and size",
      "May improve cognitive function"
    ],
    contraindications: [
      "Kidney disease or dysfunction",
      "Dehydration risk"
    ],
    drugInteractions: ["Caffeine (may reduce effectiveness)"],
    sideEffects: ["Water retention", "Weight gain", "Rare: stomach upset"],
    commissionRate: 0.08,
    costPerServing: 0.10,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // VITAMIN D3
  {
    name: "Vitamin D3 5000 IU by NOW Foods",
    brand: "NOW Foods",
    category: "vitamins",
    subcategory: "vitamin-d3",
    description: "High-potency vitamin D3 for bone health, immune support, and mood regulation",
    servingSize: "1 softgel",
    servingsPerContainer: 240,
    asin: "B002DLF29O",
    amazonUrl: "https://www.amazon.com/dp/B002DLF29O",
    affiliateUrl: "https://www.amazon.com/dp/B002DLF29O?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71zFnOkS8wL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 12.99,
    primeEligible: true,
    rating: 4.7,
    reviewCount: 15234,
    isAvailable: true,
    activeIngredients: [
      { name: "Vitamin D3 (Cholecalciferol)", amount: "125", unit: "mcg", percentDV: 625 }
    ],
    recommendedDosage: {
      amount: "1 softgel",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take with a meal containing fat for optimal absorption."
    },
    evidenceLevel: "high",
    studyCount: 284,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/28768407/",
      "https://pubmed.ncbi.nlm.nih.gov/29080614/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["general-health", "immune-support", "bone-health", "mood-support"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [12, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports bone and teeth health",
      "Enhances immune system function",
      "May improve mood and reduce depression",
      "Supports muscle function"
    ],
    contraindications: [
      "Hypercalcemia",
      "Kidney stones history",
      "Sarcoidosis"
    ],
    drugInteractions: ["Thiazide diuretics", "Digoxin"],
    sideEffects: ["Rare: nausea, vomiting at very high doses"],
    commissionRate: 0.08,
    costPerServing: 0.05,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // OMEGA-3 FISH OIL
  {
    name: "Omega-3 Fish Oil 1200mg by Nature Made",
    brand: "Nature Made",
    category: "oils",
    subcategory: "fish-oil",
    description: "Purified omega-3 fish oil providing EPA and DHA for heart and brain health",
    servingSize: "2 softgels",
    servingsPerContainer: 100,
    asin: "B003VBXY1K",
    amazonUrl: "https://www.amazon.com/dp/B003VBXY1K",
    affiliateUrl: "https://www.amazon.com/dp/B003VBXY1K?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/81q8cWQYB8L.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 18.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 21567,
    isAvailable: true,
    activeIngredients: [
      { name: "EPA (Eicosapentaenoic Acid)", amount: "360", unit: "mg" },
      { name: "DHA (Docosahexaenoic Acid)", amount: "240", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 softgels",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take with meals to reduce fishy aftertaste and improve absorption."
    },
    evidenceLevel: "high",
    studyCount: 198,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/29321160/",
      "https://pubmed.ncbi.nlm.nih.gov/31851936/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: false,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["heart-health", "brain-health", "anti-inflammatory", "general-health"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports cardiovascular health",
      "Promotes brain function and development",
      "Reduces inflammation",
      "May support eye health"
    ],
    contraindications: [
      "Fish or shellfish allergies",
      "Blood clotting disorders"
    ],
    drugInteractions: ["Blood thinners (warfarin)", "Antiplatelet medications"],
    sideEffects: ["Fishy aftertaste", "Mild digestive upset"],
    commissionRate: 0.08,
    costPerServing: 0.19,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // MAGNESIUM GLYCINATE
  {
    name: "Magnesium Glycinate 400mg by Doctor's Best",
    brand: "Doctor's Best",
    category: "minerals",
    subcategory: "magnesium-glycinate",
    description: "Chelated magnesium glycinate for superior absorption and bioavailability",
    servingSize: "2 tablets",
    servingsPerContainer: 60,
    asin: "B000BD0RT0",
    amazonUrl: "https://www.amazon.com/dp/B000BD0RT0",
    affiliateUrl: "https://www.amazon.com/dp/B000BD0RT0?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71S4TqKrLqL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 16.87,
    primeEligible: true,
    rating: 4.5,
    reviewCount: 12043,
    isAvailable: true,
    activeIngredients: [
      { name: "Magnesium (as Magnesium Glycinate)", amount: "400", unit: "mg", percentDV: 95 }
    ],
    recommendedDosage: {
      amount: "2 tablets",
      frequency: "daily",
      timing: "bedtime",
      instructions: "Take 1-2 hours before bedtime for optimal sleep support and muscle relaxation."
    },
    evidenceLevel: "high",
    studyCount: 156,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/27910808/",
      "https://pubmed.ncbi.nlm.nih.gov/31623649/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["stress-management", "sleep-support", "muscle-recovery", "bone-health"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports nervous system function",
      "Promotes muscle and nerve function",
      "May improve sleep quality",
      "Supports bone health"
    ],
    contraindications: [
      "Kidney disease",
      "Heart rhythm disorders"
    ],
    drugInteractions: ["Antibiotics", "Diuretics", "Proton pump inhibitors"],
    sideEffects: ["Rare: diarrhea at high doses"],
    commissionRate: 0.08,
    costPerServing: 0.28,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // PROBIOTICS
  {
    name: "Probiotics 50 Billion CFU by Physician's Choice",
    brand: "Physician's Choice",
    category: "probiotics",
    subcategory: "multi-strain",
    description: "Multi-strain probiotic with 50 billion CFUs for digestive and immune health",
    servingSize: "1 capsule",
    servingsPerContainer: 30,
    asin: "B077MKMXM5",
    amazonUrl: "https://www.amazon.com/dp/B077MKMXM5",
    affiliateUrl: "https://www.amazon.com/dp/B077MKMXM5?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71BqPKTLDpL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 24.95,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 8932,
    isAvailable: true,
    activeIngredients: [
      { name: "Probiotic Blend", amount: "50", unit: "billion CFU" },
      { name: "Lactobacillus acidophilus", amount: "20", unit: "billion CFU" },
      { name: "Bifidobacterium lactis", amount: "15", unit: "billion CFU" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take with a meal to protect probiotics from stomach acid."
    },
    evidenceLevel: "moderate",
    studyCount: 89,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/30305781/",
      "https://pubmed.ncbi.nlm.nih.gov/31551478/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["digestive-health", "immune-support", "general-health"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [12, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports digestive health",
      "May boost immune function",
      "Helps maintain gut microbiome balance",
      "May reduce bloating and gas"
    ],
    contraindications: [
      "Compromised immune system",
      "Severe acute pancreatitis"
    ],
    drugInteractions: ["Antibiotics (take 2 hours apart)"],
    sideEffects: ["Initial mild bloating or gas"],
    commissionRate: 0.08,
    costPerServing: 0.83,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // ASHWAGANDHA
  {
    name: "Ashwagandha Root Extract by Nutricost",
    brand: "Nutricost",
    category: "herbs",
    subcategory: "ashwagandha",
    description: "Standardized ashwagandha root extract for stress management and energy support",
    servingSize: "2 capsules",
    servingsPerContainer: 120,
    asin: "B01CHWJF9O",
    amazonUrl: "https://www.amazon.com/dp/B01CHWJF9O",
    affiliateUrl: "https://www.amazon.com/dp/B01CHWJF9O?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/61rOGPEqPZL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 19.95,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 5432,
    isAvailable: true,
    activeIngredients: [
      { name: "Ashwagandha Root Extract", amount: "1300", unit: "mg" },
      { name: "Withanolides", amount: "39", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "2 capsules",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take with food to reduce potential stomach upset. Best taken consistently for 4-6 weeks."
    },
    evidenceLevel: "moderate",
    studyCount: 67,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/30854330/",
      "https://pubmed.ncbi.nlm.nih.gov/31991649/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["stress-management", "energy", "recovery", "mood-support"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 65],
      activityLevel: ["sedentary", "moderate", "high"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "May reduce stress and anxiety",
      "Supports energy levels",
      "May improve sleep quality",
      "Supports exercise recovery"
    ],
    contraindications: [
      "Pregnancy and breastfeeding",
      "Autoimmune disorders",
      "Surgery (discontinue 2 weeks prior)"
    ],
    drugInteractions: ["Immunosuppressants", "Sedatives", "Blood pressure medications"],
    sideEffects: ["Drowsiness", "Stomach upset", "Diarrhea"],
    commissionRate: 0.08,
    costPerServing: 0.33,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // B-COMPLEX
  {
    name: "B-Complex 100 by Nature Made",
    brand: "Nature Made",
    category: "vitamins",
    subcategory: "b-complex",
    description: "Complete B-vitamin complex for energy metabolism and nervous system support",
    servingSize: "1 tablet",
    servingsPerContainer: 60,
    asin: "B00012NGII",
    amazonUrl: "https://www.amazon.com/dp/B00012NGII",
    affiliateUrl: "https://www.amazon.com/dp/B00012NGII?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/61mF6RQzuAL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 12.47,
    primeEligible: true,
    rating: 4.6,
    reviewCount: 9876,
    isAvailable: true,
    activeIngredients: [
      { name: "Thiamin (B1)", amount: "100", unit: "mg", percentDV: 8333 },
      { name: "Riboflavin (B2)", amount: "100", unit: "mg", percentDV: 7692 },
      { name: "Niacin (B3)", amount: "100", unit: "mg", percentDV: 625 },
      { name: "B6", amount: "100", unit: "mg", percentDV: 5882 },
      { name: "B12", amount: "100", unit: "mcg", percentDV: 4167 }
    ],
    recommendedDosage: {
      amount: "1 tablet",
      frequency: "daily",
      timing: "with-meals",
      instructions: "Take with breakfast for sustained energy throughout the day."
    },
    evidenceLevel: "high",
    studyCount: 143,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/30770215/",
      "https://pubmed.ncbi.nlm.nih.gov/31905220/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["energy", "general-health", "stress-management", "cognitive-support"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Supports energy metabolism",
      "Promotes nervous system function",
      "May reduce fatigue",
      "Supports cognitive function"
    ],
    contraindications: [
      "B6 sensitivity at high doses"
    ],
    drugInteractions: ["Levodopa", "Phenytoin"],
    sideEffects: ["Bright yellow urine (normal)", "Rare: nausea"],
    commissionRate: 0.08,
    costPerServing: 0.21,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // MELATONIN
  {
    name: "Melatonin 3mg by Nature Made",
    brand: "Nature Made",
    category: "hormones",
    subcategory: "melatonin",
    description: "Natural sleep support hormone to help regulate sleep-wake cycles",
    servingSize: "1 tablet",
    servingsPerContainer: 120,
    asin: "B00012NGLI",
    amazonUrl: "https://www.amazon.com/dp/B00012NGLI",
    affiliateUrl: "https://www.amazon.com/dp/B00012NGLI?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71sKzYzVL8L.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 8.99,
    primeEligible: true,
    rating: 4.4,
    reviewCount: 13245,
    isAvailable: true,
    activeIngredients: [
      { name: "Melatonin", amount: "3", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 tablet",
      frequency: "nightly",
      timing: "bedtime",
      instructions: "Take 30 minutes before desired bedtime. Start with lowest effective dose."
    },
    evidenceLevel: "high",
    studyCount: 95,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/30311830/",
      "https://pubmed.ncbi.nlm.nih.gov/31835314/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["sleep-support", "recovery", "stress-management"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 85],
      activityLevel: ["sedentary", "moderate", "high", "athlete"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Helps regulate sleep-wake cycle",
      "May reduce time to fall asleep",
      "Supports natural sleep patterns",
      "May help with jet lag"
    ],
    contraindications: [
      "Pregnancy and breastfeeding",
      "Autoimmune disorders",
      "Depression (consult physician)"
    ],
    drugInteractions: ["Blood thinners", "Immunosuppressants", "Blood pressure medications"],
    sideEffects: ["Drowsiness", "Headache", "Dizziness", "Nausea"],
    commissionRate: 0.08,
    costPerServing: 0.07,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  },

  // GREEN TEA EXTRACT
  {
    name: "Green Tea Extract Supplement by NOW Foods",
    brand: "NOW Foods",
    category: "herbs",
    subcategory: "green-tea-extract",
    description: "Standardized green tea extract with EGCG for antioxidant support and metabolism",
    servingSize: "1 capsule",
    servingsPerContainer: 100,
    asin: "B0013OXQEA",
    amazonUrl: "https://www.amazon.com/dp/B0013OXQEA",
    affiliateUrl: "https://www.amazon.com/dp/B0013OXQEA?tag=nutriwiseai-20",
    imageUrl: "https://m.media-amazon.com/images/I/71H-1gK9SDL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
    currentPrice: 14.99,
    primeEligible: true,
    rating: 4.3,
    reviewCount: 3412,
    isAvailable: true,
    activeIngredients: [
      { name: "Green Tea Extract", amount: "400", unit: "mg" },
      { name: "EGCG", amount: "200", unit: "mg" },
      { name: "Caffeine", amount: "32", unit: "mg" }
    ],
    recommendedDosage: {
      amount: "1 capsule",
      frequency: "1-2 times daily",
      timing: "with-meals",
      instructions: "Take with meals to reduce potential stomach upset. Avoid close to bedtime due to caffeine content."
    },
    evidenceLevel: "moderate",
    studyCount: 76,
    citations: [
      "https://pubmed.ncbi.nlm.nih.gov/31098121/",
      "https://pubmed.ncbi.nlm.nih.gov/30272048/"
    ],
    qualityFactors: {
      thirdPartyTested: true,
      gmpCertified: true,
      organicCertified: false,
      allergenFree: true,
      bioavailableForm: true,
      contaminantFree: true
    },
    targetGoals: ["fat-loss", "antioxidant-support", "energy", "general-health"],
    targetDemographics: {
      gender: ["male", "female", "both"],
      ageRange: [18, 65],
      activityLevel: ["sedentary", "moderate", "high"],
      experienceLevel: ["beginner", "intermediate", "advanced"]
    },
    healthBenefits: [
      "Provides powerful antioxidants",
      "May support metabolic rate",
      "Supports cardiovascular health",
      "May aid in fat oxidation"
    ],
    contraindications: [
      "Pregnancy and breastfeeding",
      "Caffeine sensitivity",
      "Liver disease"
    ],
    drugInteractions: ["Blood thinners", "Stimulant medications", "Iron supplements"],
    sideEffects: ["Caffeine-related: jitters, insomnia", "Stomach upset on empty stomach"],
    commissionRate: 0.08,
    costPerServing: 0.15,
    lastPriceUpdate: new Date(),
    lastVerified: new Date(),
    isActive: true
  }
];

async function seedProductCatalog() {
  console.log('🌱 Starting product catalog seeding...');
  
  try {
    for (const product of INITIAL_PRODUCT_CATALOG) {
      const productId = await productCatalogAdminService.addProduct(product);
      console.log(`✅ Added product: ${product.name} (ID: ${productId})`);
    }
    
    console.log(`🎉 Successfully seeded ${INITIAL_PRODUCT_CATALOG.length} products to the catalog!`);
    
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

export { seedProductCatalog, INITIAL_PRODUCT_CATALOG };
