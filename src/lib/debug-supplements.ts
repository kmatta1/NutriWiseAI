import { fetchAllSupplements } from '../services/firestore-supplements';

export async function debugSupplementImages() {
  console.log('🔍 DEBUG: Checking supplement data and images...');
  
  try {
    const supplements = await fetchAllSupplements();
    console.log(`Found ${supplements.length} supplements in database:`);
    
    supplements.forEach((supplement, index) => {
      console.log(`${index + 1}. ID: ${supplement.id}`);
      console.log(`   Name: ${supplement.name}`);
      console.log(`   Brand: ${supplement.brand || 'N/A'}`);
      console.log(`   ImageUrl: ${supplement.imageUrl || 'N/A'}`);
      console.log(`   AmazonUrl: ${supplement.amazonUrl || 'N/A'}`);
      console.log(`   Price: ${supplement.price || 'N/A'}`);
      console.log(`   Expected Firebase path: supplement-images/${supplement.id}.jpg`);
      console.log('   ---');
    });
    
    return supplements;
  } catch (error) {
    console.error('❌ Error fetching supplements for debug:', error);
    return [];
  }
}
