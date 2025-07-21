import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc } from "firebase/firestore";
import { readFile } from "fs/promises";

async function main() {
  // Read supplements JSON
  const supplementsRaw = await readFile(new URL("../updated-supplements.json", import.meta.url), "utf-8");
  const supplements = JSON.parse(supplementsRaw);

  // Read firebase config JSON
  const firebaseConfigRaw = await readFile(new URL("../firebaseConfig.json", import.meta.url), "utf-8");
  const firebaseConfig = JSON.parse(firebaseConfigRaw);

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
