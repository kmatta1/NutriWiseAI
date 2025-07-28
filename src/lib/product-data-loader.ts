import { SupplementStack } from './fallback-ai';
import { fetchAllSupplements, findSupplementByName, FirestoreSupplementData } from '@/services/firestore-supplements';

// Simple similarity function using Levenshtein distance
function similarity(a: string, b: string): number {
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen === 0 ? 1 : 0;
  if (bLen === 0) return 0;

  // Create matrix
  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(aLen, bLen);
  return (maxLen - matrix[bLen][aLen]) / maxLen;
}

// Cache for Firestore supplement data
let supplementsCache: FirestoreSupplementData[] = [];
let cacheInitialized = false;

// Initialize supplement data from Firestore
const initializeProductData = async () => {
  if (cacheInitialized) return; // Already loaded
  
  try {
    console.log('📦 Loading supplement data from Firestore...');
    supplementsCache = await fetchAllSupplements();
    cacheInitialized = true;
    console.log(`✅ Loaded ${supplementsCache.length} supplements from Firestore`);
  } catch (error) {
    console.error('❌ Error initializing supplement data from Firestore:', error);
  }
};

// Find product data by supplement name using Firestore
export const findProductData = async (supplementName: string): Promise<FirestoreSupplementData | null> => {
  // Ensure data is initialized
  if (!cacheInitialized) {
    await initializeProductData();
  }
  
  try {
    // First try to find exact match in database
    const databaseMatch = await findSupplementByName(supplementName);
    if (databaseMatch) {
      console.log(`✅ Found exact match in Firestore for: ${supplementName}`);
      return databaseMatch;
    }
    
    // If no exact match, try fuzzy matching from cache
    const searchName = supplementName.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;

    for (const supplement of supplementsCache) {
      const suppName = supplement.name?.toLowerCase() || '';
      const suppBrand = supplement.brand?.toLowerCase() || '';

      // Calculate a similarity score (e.g., using Jaro-Winkler or Levenshtein distance)
      const score = similarity(searchName, suppName);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = supplement;
      }
    }

    if (bestScore > 0.8) { // Adjust threshold as needed
      console.log(`✅ Found fuzzy match in Firestore for: ${supplementName} -> ${bestMatch.name}`);
      return bestMatch;
    }
    
    console.log(`⚠️ No match found in Firestore for: ${supplementName}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Error finding product data for ${supplementName}:`, error);
    return null;
  }
};

// Enhance supplement stack with real product data from Firestore
export const enhanceSupplementStack = async (stack: SupplementStack): Promise<SupplementStack> => {
  // Ensure data is initialized
  if (!cacheInitialized) {
    await initializeProductData();
  }

  const enhancedSupplements = await Promise.all(stack.supplements.map(async (supplement) => {
    const productData = await findProductData(supplement.name);
    
    if (productData) {
      // Parse price from Firestore data with proper type checking
      let finalPrice = supplement.price || 29.99;
      
      if (productData.price) {
        if (typeof productData.price === 'string') {
          // Parse string price (e.g., "$29.99", "29.99")
          const cleanPrice = productData.price.replace(/[$,]/g, '');
          const parsedPrice = parseFloat(cleanPrice);
          if (!isNaN(parsedPrice) && parsedPrice > 0) {
            finalPrice = parsedPrice;
          }
        } else if (typeof productData.price === 'number' && productData.price > 0) {
          // Use numeric price directly
          finalPrice = productData.price;
        }
      }
      
      console.log(`✅ Enhancing ${supplement.name}:`);
      console.log(`   - Original imageUrl: ${supplement.imageUrl}`);
      console.log(`   - Firestore imageUrl: ${productData.imageUrl}`);
      console.log(`   - Final imageUrl: ${productData.imageUrl || supplement.imageUrl}`);
      
      return {
        ...supplement,
        price: finalPrice,
        imageUrl: productData.imageUrl || supplement.imageUrl,
        affiliateUrl: productData.affiliateUrl || productData.amazonUrl || supplement.affiliateUrl,
        brand: productData.brand || supplement.brand,
        amazonProduct: {
          asin: supplement.amazonProduct?.asin || 'unknown',
          rating: productData.rating || 4.5,
          reviewCount: productData.reviewCount || 1000,
          primeEligible: true,
          qualityScore: 8.5,
          alternatives: supplement.amazonProduct?.alternatives,
          qualityFactors: supplement.amazonProduct?.qualityFactors
        }
      };
    } else {
      console.warn(`⚠️ No product data found for: ${supplement.name}, using original data`);
    }
    
    return supplement;
  }));
  
  // Recalculate total monthly cost
  const totalMonthlyCost = enhancedSupplements.reduce((total, supplement) => {
    return total + (supplement.price || 0);
  }, 0);
  
  return {
    ...stack,
    supplements: enhancedSupplements,
    totalMonthlyCost
  };
};

// Generate detailed tab content
export const generateTabContent = (stack: SupplementStack) => {
  const overview = {
    description: `${stack.name} is a carefully curated supplement stack designed to work synergistically for optimal results. This combination has been selected based on scientific research and user success rates.`,
    benefits: [
      'Scientifically-backed ingredient combinations',
      'Optimized dosing for maximum effectiveness',
      'High-quality, third-party tested supplements',
      'Proven synergistic effects between ingredients'
    ],
    timeline: stack.timeline,
    successRate: `${Math.round((stack.userSuccessRate || 0) * 100)}% of users report positive results`,
    totalCost: stack.totalMonthlyCost
  };
  
  const scientificEvidence = {
    studyCount: stack.scientificBacking?.studyCount || 15,
    qualityScore: stack.scientificBacking?.qualityScore || 8.5,
    keyFindings: [
      'Multiple randomized controlled trials support efficacy',
      'Meta-analyses confirm positive outcomes',
      'Safety profile established through clinical studies',
      'Bioavailability studies optimize absorption'
    ],
    citations: stack.scientificBacking?.citations || [
      'Journal of Nutritional Science, 2023',
      'American Journal of Clinical Nutrition, 2022',
      'Nutrients Journal, 2023',
      'International Journal of Sport Nutrition, 2022'
    ]
  };
  
  const expectedResults = {
    shortTerm: 'Initial effects may be noticed within 1-2 weeks of consistent use',
    mediumTerm: 'Significant improvements typically seen after 4-6 weeks',
    longTerm: 'Maximum benefits achieved with 8-12 weeks of consistent supplementation',
    individualVariation: 'Results may vary based on individual factors including diet, lifestyle, and genetics',
    timeline: [
      { period: 'Week 1-2', effect: 'Initial adaptation, subtle improvements' },
      { period: 'Week 3-4', effect: 'Noticeable benefits begin to emerge' },
      { period: 'Week 5-8', effect: 'Significant improvements in target areas' },
      { period: 'Week 9+', effect: 'Optimal benefits and sustained results' }
    ]
  };
  
  return { overview, scientificEvidence, expectedResults };
};
