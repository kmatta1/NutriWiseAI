#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Firebase configuration from JSON file
const configPath = join(__dirname, '..', 'firebaseconfig.json');
let firebaseConfig;

try {
  firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ Error: firebaseconfig.json file not found at:', configPath);
    console.error('Please ensure the Firebase configuration file exists.');
  } else if (error instanceof SyntaxError) {
    console.error('❌ Error: Invalid JSON in firebaseconfig.json file');
    console.error('Please check the file format and syntax.');
  } else {
    console.error('❌ Error loading Firebase configuration:', error.message);
  }
  process.exit(1);
}

console.log('🔥 Firebase Rules Test - Supplements & Stacks Only');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testSupplementsAndStacks() {
  console.log('\n🧪 Testing supplements collection write...');
  
  try {
    // Test supplements collection (should work with your rules)
    const supplementTest = {
      id: "test-supplement",
      name: "Test Supplement",
      brand: "Test Brand",
      category: "Vitamins",
      price: 19.99,
      rating: 4.5,
      reviewCount: 1000,
      isAvailable: true,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Attempting to write to supplements collection...');
    const suppRef = doc(collection(db, 'supplements'), 'test-supplement');
    await setDoc(suppRef, supplementTest);
    console.log('✅ Supplements collection write SUCCESSFUL!');
    
  } catch (suppError) {
    console.error('❌ Supplements collection write FAILED:', suppError.code, suppError.message);
  }
  
  try {
    // Test cachedStacks collection (should work with your rules)
    const stackTest = {
      id: "test-stack",
      name: "Test Stack",
      archetype: "test-user",
      supplements: ["test-supplement"],
      totalMonthlyCost: 29.99,
      evidenceScore: 8.5,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('\n🧪 Testing cachedStacks collection write...');
    const stackRef = doc(collection(db, 'cachedStacks'), 'test-stack');
    await setDoc(stackRef, stackTest);
    console.log('✅ CachedStacks collection write SUCCESSFUL!');
    
  } catch (stackError) {
    console.error('❌ CachedStacks collection write FAILED:', stackError.code, stackError.message);
  }

  try {
    // Test users collection (should fail with your rules)
    const userTest = {
      id: "test-user",
      email: "test@example.com",
      isAdmin: false,
      lastUpdated: new Date().toISOString()
    };

    console.log('\n🧪 Testing users collection write...');
    const userRef = doc(collection(db, 'users'), 'test-user');
    await setDoc(userRef, userTest);
    console.log('❌ Users collection write should have FAILED, but it SUCCEEDED!');

  } catch (userError) {
    if (userError.code === 'permission-denied') {
      console.log('✅ Users collection write FAILED as expected (permission-denied)!');
    } else {
      console.error('❌ Users collection write FAILED with an unexpected error:', userError.code, userError.message);
    }
  }
  
  console.log('\n🎯 Rules Test Summary:');
  console.log('If both writes succeeded, your Firestore rules are working correctly!');
  console.log('If both failed, your rules may not be deployed yet in Firebase Console.');
  console.log('If one succeeded and one failed, there may be a rules syntax issue.');
}

testFirestoreConnection().catch(console.error);

async function testFirestoreConnection() {
  await testSupplementsAndStacks();
}
