export async function getAllStacks() {
  const colRef = collection(db, "cachedStacks");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getAllSupplements() {
  const colRef = collection(db, "supplements");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function uploadSupplements(supplements: any[]) {
  const colRef = collection(db, "supplements");
  for (const supplement of supplements) {
    await setDoc(doc(colRef, supplement.id), supplement);
  }
}
