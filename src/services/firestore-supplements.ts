import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export interface FirestoreSupplementData {
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
  verified?: boolean;
}

/**
 * Fetch all supplements from Firestore
 */
export async function fetchAllSupplements(): Promise<FirestoreSupplementData[]> {
  try {
    console.log('🔍 Fetching supplements from Firestore...');
    
    const supplementsRef = collection(db, 'supplements');
    const snapshot = await getDocs(supplementsRef);
    
    const supplements: FirestoreSupplementData[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      supplements.push({
        ...data,
        id: docSnap.id
      } as FirestoreSupplementData);
    });
    
    console.log(`✅ Found ${supplements.length} supplements in database`);
    return supplements;
    
  } catch (error) {
    console.error('❌ Error fetching supplements:', error);
    return [];
  }
}

/**
 * Fetch a specific supplement by ID
 */
export async function fetchSupplementById(supplementId: string): Promise<FirestoreSupplementData | null> {
  try {
    const supplementRef = doc(db, 'supplements', supplementId);
    const supplementDoc = await getDoc(supplementRef);
    
    if (supplementDoc.exists()) {
      return {
        ...supplementDoc.data(),
        id: supplementDoc.id
      } as FirestoreSupplementData;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error fetching supplement ${supplementId}:`, error);
    return null;
  }
}

/**
 * Fetch supplements by category
 */
export async function fetchSupplementsByCategory(category: string): Promise<FirestoreSupplementData[]> {
  try {
    const supplementsRef = collection(db, 'supplements');
    const q = query(supplementsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    const supplements: FirestoreSupplementData[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      supplements.push({
        ...data,
        id: docSnap.id
      } as FirestoreSupplementData);
    });
    
    return supplements;
  } catch (error) {
    console.error(`❌ Error fetching supplements for category ${category}:`, error);
    return [];
  }
}

/**
 * Get the correct Firebase Storage image path for a supplement
 * Uses the database ID as the image filename
 */
export function getSupplementImagePath(supplement: FirestoreSupplementData): string {
  // Use the database ID directly as the image filename
  return `supplement-images/${supplement.id}.jpg`;
}

/**
 * Find a supplement by name (fuzzy matching)
 */
export async function findSupplementByName(searchName: string): Promise<FirestoreSupplementData | null> {
  try {
    const supplements = await fetchAllSupplements();
    
    // Exact match first
    let match = supplements.find(sup => 
      sup.name.toLowerCase() === searchName.toLowerCase()
    );
    
    if (match) return match;
    
    // Partial match
    match = supplements.find(sup => 
      sup.name.toLowerCase().includes(searchName.toLowerCase()) ||
      searchName.toLowerCase().includes(sup.name.toLowerCase())
    );
    
    if (match) return match;
    
    // Brand + key ingredients match
    const searchWords = searchName.toLowerCase().split(' ');
    match = supplements.find(sup => {
      const supWords = sup.name.toLowerCase().split(' ');
      return searchWords.some(word => supWords.includes(word));
    });
    
    return match || null;
  } catch (error) {
    console.error(`❌ Error finding supplement by name ${searchName}:`, error);
    return null;
  }
}

/**
 * Map generated supplement names to database entries
 */
export async function mapGeneratedToDatabase(generatedSupplements: any[]): Promise<{
  matched: Array<{ generated: any; database: FirestoreSupplementData }>;
  unmatched: any[];
}> {
  try {
    const matched: Array<{ generated: any; database: FirestoreSupplementData }> = [];
    const unmatched: any[] = [];
    
    for (const genSup of generatedSupplements) {
      const dbMatch = await findSupplementByName(genSup.name);
      
      if (dbMatch) {
        matched.push({ generated: genSup, database: dbMatch });
        console.log(`✅ Matched: "${genSup.name}" → "${dbMatch.name}" (${dbMatch.id})`);
      } else {
        unmatched.push(genSup);
        console.log(`❌ No match for: "${genSup.name}"`);
      }
    }
    
    return { matched, unmatched };
  } catch (error) {
    console.error('❌ Error mapping supplements:', error);
    return { matched: [], unmatched: generatedSupplements };
  }
}
