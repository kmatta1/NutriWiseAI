import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc } from "firebase/firestore";
import * as fs from "fs";

async function main() {
  // Load cached stacks JSON using fs
  const stacks = JSON.parse(fs.readFileSync("cached-stacks.json", "utf-8"));

  // Load firebase config JSON using fs
  const firebaseConfig = JSON.parse(fs.readFileSync("firebaseConfig.json", "utf-8"));

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const batch = writeBatch(db);
  for (const stack of stacks) {
    // Use archetype as document ID for now
    const docRef = doc(db, "cachedStacks", stack.archetype);
    batch.set(docRef, stack);
  }
  await batch.commit();
  console.log(`Uploaded ${stacks.length} cached stacks to Firestore.`);
}

main().catch(console.error);
