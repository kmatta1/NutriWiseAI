import { db } from '../lib/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

interface ProductData {
  name: string;
  brand?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  imageUrl?: string;
  amazonUrl?: string;
  affiliateUrl?: string;
  category?: string;
  type?: string;
}

/**
 * Map product data files to their corresponding supplement IDs
 */
const PRODUCT_TO_SUPPLEMENT_MAP: Record<string, { id: string; category: string; type: string }> = {
  'Ashwagandha_Root_Extract_by_Nutricost': { id: 'supplement_12', category: 'Cognitive Enhancement', type: 'Adaptogen' },
  'Bacopa_Monnieri_Extract_by_Nutricost': { id: 'supplement_14', category: 'Cognitive Enhancement', type: 'Nootropic' },
  'BCAA_Energy_Amino_Acid_Supplement_by_Cellucor_C4': { id: 'supplement_4', category: 'Athletic Performance', type: 'Amino Acid' },
  'CLA_1250_Safflower_Oil_by_Sports_Research': { id: 'supplement_19', category: 'Weight Management', type: 'Fat Burner' },
  'Collagen_Peptides_Powder_by_Vital_Proteins': { id: 'supplement_21', category: 'Recovery & Sleep', type: 'Protein' },
  'Creatine_Monohydrate_Powder_Micronized_by_BulkSupplements_supplement': { id: 'supplement_2', category: 'Athletic Performance', type: 'Performance' },
  'Creatine_Monohydrate_Powder_Micronized_by_BulkSupplements': { id: 'supplement_2', category: 'Athletic Performance', type: 'Performance' },
  'Creatine_Monohydrate': { id: 'supplement_2', category: 'Athletic Performance', type: 'Performance' },
  'Garcinia_Cambogia_Extract_by_Nature\'s_Bounty': { id: 'supplement_18', category: 'Weight Management', type: 'Fat Burner' },
  'Ginkgo_Biloba_Extract_by_Nature\'s_Bounty': { id: 'supplement_17', category: 'Cognitive Enhancement', type: 'Nootropic' },
  'Glucosamine_Chondroitin_MSM_by_Kirkland_Signature': { id: 'supplement_22', category: 'Joint & Bone Health', type: 'Joint Support' },
  'Green_Tea_Extract_Supplement_by_NOW_Foods': { id: 'supplement_11', category: 'General Wellness', type: 'Antioxidant' },
  'L-Carnitine_1000mg_by_Nutricost': { id: 'supplement_20', category: 'Weight Management', type: 'Fat Burner' },
  'L-Theanine_200mg_by_NOW_Foods': { id: 'supplement_16', category: 'Cognitive Enhancement', type: 'Nootropic' },
  'Lion\'s_Mane_Mushroom_Extract_by_Host_Defense': { id: 'supplement_15', category: 'Cognitive Enhancement', type: 'Nootropic' },
  'Magnesium_Glycinate_400mg_by_Doctor\'s_Best': { id: 'supplement_7', category: 'General Wellness', type: 'Mineral' },
  'Melatonin_3mg_by_Nature_Made': { id: 'supplement_9', category: 'Recovery & Sleep', type: 'Sleep Aid' },
  'MSM_Powder_1000mg_by_NOW_Foods': { id: 'supplement_23', category: 'Joint & Bone Health', type: 'Joint Support' },
  'Omega-3_Fish_Oil_1200mg_by_Nature_Made': { id: 'supplement_5', category: 'General Wellness', type: 'Essential Fatty Acid' },
  'Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla_supplement': { id: 'supplement_1', category: 'Athletic Performance', type: 'Protein' },
  'Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla': { id: 'supplement_1', category: 'Athletic Performance', type: 'Protein' },
  'Pre-Workout_Supplement_by_Legion_Pulse': { id: 'supplement_24', category: 'Athletic Performance', type: 'Pre-workout' },
  'Probiotics_50_Billion_CFU_by_Physician\'s_Choice': { id: 'supplement_8', category: 'General Wellness', type: 'Probiotic' },
  'Rhodiola_Rosea_Extract_by_NOW_Foods': { id: 'supplement_13', category: 'Cognitive Enhancement', type: 'Adaptogen' },
  'Turmeric_Curcumin_with_BioPerine_by_BioSchwartz': { id: 'supplement_22', category: 'Joint & Bone Health', type: 'Anti-inflammatory' },
  'Vitamin_D3_5000_IU_by_NOW_Foods': { id: 'supplement_6', category: 'General Wellness', type: 'Vitamin' },
  'Whole_Food_Multivitamin_by_Garden_of_Life': { id: 'supplement_10', category: 'General Wellness', type: 'Multivitamin' }
};

/**
 * Load product data from JSON file
 */
async function loadProductData(filename: string): Promise<ProductData | null> {
  try {
    const response = await fetch(`/${filename}.json`);
    if (!response.ok) {
      console.log(`❌ Product data file not found: ${filename}.json`);
      return null;
    }
    const data = await response.json();
    console.log(`✅ Loaded product data: ${filename}`);
    return data;
  } catch (error) {
    console.error(`❌ Error loading product data ${filename}:`, error);
    return null;
  }
}

/**
 * Populate Firestore with supplement data from product files
 */
export async function populateFirestoreSupplements() {
  try {
    console.log('🚀 Starting Firestore supplement population...');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const [productKey, supplementInfo] of Object.entries(PRODUCT_TO_SUPPLEMENT_MAP)) {
      try {
        // Load product data
        const productData = await loadProductData(`product-data-${productKey}`);
        
        if (!productData) {
          console.log(`⚠️ Skipping ${productKey} - no product data`);
          failCount++;
          continue;
        }
        
        // Create supplement document
        const supplementDoc = {
          name: productData.name,
          category: supplementInfo.category,
          type: supplementInfo.type,
          brand: productData.brand || 'Unknown',
          price: productData.price || 'N/A',
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0,
          features: productData.features || [],
          imageUrl: productData.imageUrl || '',
          amazonUrl: productData.amazonUrl || '',
          affiliateUrl: productData.affiliateUrl || '',
          verified: true,
          lastUpdated: new Date().toISOString()
        };
        
        // Save to Firestore
        const supplementRef = doc(db, 'supplements', supplementInfo.id);
        await setDoc(supplementRef, supplementDoc);
        
        console.log(`✅ Added ${supplementInfo.id}: ${productData.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${productKey}:`, error);
        failCount++;
      }
    }
    
    console.log(`🎉 Firestore population complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    return { successCount, failCount };
    
  } catch (error) {
    console.error('❌ Error populating Firestore:', error);
    return { successCount: 0, failCount: Object.keys(PRODUCT_TO_SUPPLEMENT_MAP).length };
  }
}

/**
 * Check current Firestore supplement data
 */
export async function checkFirestoreSupplements() {
  try {
    console.log('🔍 Checking current Firestore supplements...');
    
    const supplementsRef = collection(db, 'supplements');
    const snapshot = await getDocs(supplementsRef);
    
    console.log(`📊 Found ${snapshot.size} supplements in database:`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  ${doc.id}: ${data.name} (${data.category})`);
    });
    
    return snapshot.size;
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
    return 0;
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).populateFirestoreSupplements = populateFirestoreSupplements;
  (window as any).checkFirestoreSupplements = checkFirestoreSupplements;
}
