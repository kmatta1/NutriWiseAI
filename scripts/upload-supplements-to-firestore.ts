import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc } from "firebase/firestore";

async function main() {
  // Dynamically import JSON with ESM assert
  const supplementsModule = await import("../updated-supplements.json", { assert: { type: "json" } });
  const supplements = supplementsModule.default;

  // Import firebase config
  const firebaseConfigModule = await import("../firebaseConfig.json", { assert: { type: "json" } });
  const firebaseConfig = firebaseConfigModule.default;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const batch = writeBatch(db);
  for (const supplement of supplements) {
    const docRef = doc(db, "supplements", supplement.id);
    batch.set(docRef, supplement);
  }
  await batch.commit();
  console.log(`Uploaded ${supplements.length} supplements to Firestore.`);
}

main().catch(console.error);
