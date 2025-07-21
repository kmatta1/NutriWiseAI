import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface SupplementData {
  id: string;
  name: string;
  category: string;
  brand?: string;
  amazonUrl?: string;
  affiliateUrl?: string;
  imageUrl?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  type?: string;
  features?: string[];
}

export async function analyzeFirestoreSupplements() {
  try {
    console.log('🔍 Analyzing Firestore supplement database...');
    
    // Get all supplements from the database
    const supplementsRef = collection(db, 'supplements');
    const q = query(supplementsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const supplements: SupplementData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<SupplementData, 'id'>;
      supplements.push({
        ...data,
        id: doc.id
      });
    });
    
    console.log(`📊 Found ${supplements.length} supplements in database`);
    
    // Analyze the mapping
    const imageMapping: Record<string, string> = {};
    
    supplements.forEach((supplement) => {
      const supplementName = supplement.name?.toLowerCase() || '';
      
      // Create mapping based on specific database entries we can see
      if (supplementName.includes('turmeric') || supplementName.includes('curcumin')) {
        imageMapping[supplement.id] = 'supplement_22'; // From the screenshot - Turmeric with BioPerine
      } else if (supplementName.includes('glucosamine') || supplement.category === 'Joint & Bone Health') {
        imageMapping[supplement.id] = 'supplement_22'; // Joint & Bone Health category
      } else if (supplementName.includes('protein') || supplementName.includes('whey')) {
        imageMapping[supplement.id] = 'supplement_1';
      } else if (supplementName.includes('creatine')) {
        imageMapping[supplement.id] = 'supplement_2';
      } else if (supplementName.includes('bcaa') || supplementName.includes('amino')) {
        imageMapping[supplement.id] = 'supplement_4';
      } else if (supplementName.includes('omega') || supplementName.includes('fish oil')) {
        imageMapping[supplement.id] = 'supplement_5';
      } else if (supplementName.includes('vitamin d')) {
        imageMapping[supplement.id] = 'supplement_6';
      } else if (supplementName.includes('magnesium')) {
        imageMapping[supplement.id] = 'supplement_7';
      } else if (supplementName.includes('probiotic')) {
        imageMapping[supplement.id] = 'supplement_8';
      } else if (supplementName.includes('melatonin')) {
        imageMapping[supplement.id] = 'supplement_9';
      } else if (supplementName.includes('multivitamin')) {
        imageMapping[supplement.id] = 'supplement_10';
      } else if (supplementName.includes('green tea')) {
        imageMapping[supplement.id] = 'supplement_11';
      } else if (supplementName.includes('ashwagandha')) {
        imageMapping[supplement.id] = 'supplement_12';
      } else if (supplementName.includes('rhodiola')) {
        imageMapping[supplement.id] = 'supplement_13';
      } else if (supplementName.includes('bacopa')) {
        imageMapping[supplement.id] = 'supplement_14';
      } else if (supplementName.includes('lion\'s mane') || supplementName.includes('lions mane')) {
        imageMapping[supplement.id] = 'supplement_15';
      } else if (supplementName.includes('l-theanine')) {
        imageMapping[supplement.id] = 'supplement_16';
      } else if (supplementName.includes('ginkgo')) {
        imageMapping[supplement.id] = 'supplement_17';
      } else if (supplementName.includes('garcinia')) {
        imageMapping[supplement.id] = 'supplement_18';
      } else if (supplementName.includes('cla')) {
        imageMapping[supplement.id] = 'supplement_19';
      } else if (supplementName.includes('l-carnitine')) {
        imageMapping[supplement.id] = 'supplement_20';
      } else if (supplementName.includes('collagen')) {
        imageMapping[supplement.id] = 'supplement_21';
      } else if (supplementName.includes('msm')) {
        imageMapping[supplement.id] = 'supplement_23';
      } else if (supplementName.includes('pre-workout') || supplementName.includes('pulse')) {
        imageMapping[supplement.id] = 'supplement_24';
      } else {
        // Default for unmapped supplements
        imageMapping[supplement.id] = 'supplement_25';
      }
    });
    
    // Log the mapping
    console.log('🎯 Supplement to Image Mapping:');
    supplements.forEach((supplement) => {
      console.log(`${supplement.id} (${supplement.name}) → ${imageMapping[supplement.id]}`);
    });
    
    // Group by category for better understanding
    const categoryGroups: Record<string, SupplementData[]> = {};
    supplements.forEach((supplement) => {
      const category = supplement.category || 'Uncategorized';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(supplement);
    });
    
    console.log('📁 Supplements by Category:');
    Object.entries(categoryGroups).forEach(([category, items]) => {
      console.log(`\n${category} (${items.length} items):`);
      items.forEach((item) => {
        console.log(`  - ${item.name} (${item.id}) → ${imageMapping[item.id]}`);
      });
    });
    
    return {
      supplements,
      imageMapping,
      categoryGroups
    };
    
  } catch (error) {
    console.error('❌ Error analyzing Firestore supplements:', error);
    return null;
  }
}

// Function to get the correct image for a supplement based on database ID
export function getImageForSupplementById(supplementId: string): string {
  // Based on the Firestore database structure, map specific IDs to their correct images
  const idToImageMap: Record<string, string> = {
    'supplement_22': 'supplement_22', // Turmeric Curcumin with BioPerine by BioSchwartz
    // Add more specific mappings as we discover them from the database
  };
  
  return idToImageMap[supplementId] || `supplement_${Math.floor(Math.random() * 25) + 1}`;
}

// Function to get image based on supplement name (fallback)
export function getImageForSupplementByName(supplementName: string): string {
  const name = supplementName.toLowerCase();
  
  if (name.includes('turmeric') || name.includes('curcumin')) {
    return 'supplement_22';
  }
  // Add more name-based mappings...
  
  return 'supplement_1'; // Default fallback
}
