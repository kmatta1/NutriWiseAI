import { productCatalogAdminService } from '../../src/lib/product-catalog-admin-service';
import { db } from '../../src/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { logger } from './logger';

// Firestore seeding
export async function seedStackToFirestore(input: any, stack: any) {
  try {
    const stackId = `stack_${
      input.fitnessGoals
    }_${input.gender}_${input.activityLevel}_${input.diet}_${input.sleepQuality}`;
    const ref = doc(collection(db, 'aiStacks'), stackId);
    await setDoc(ref, {
      input,
      stack,
      updatedAt: new Date(),
    });
    logger.info('Seeded stack to Firestore', { stackId });
  } catch (err) {
    logger.error('Failed to seed stack to Firestore', { error: err });
  }
}

// Pinecone seeding (stub, replace with real implementation)
export async function seedStackToPinecone(input: any, stack: any) {
  // TODO: Implement Pinecone upsert logic here
  logger.info('Stub: Seeded stack to Pinecone', { input });
}
