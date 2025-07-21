import { getAllSupplements, getAllStacks } from './supplement-firestore-service';

export async function fetchVerifiedSupplements() {
  return await getAllSupplements();
}

export async function fetchVerifiedStacks() {
  return await getAllStacks();
}
