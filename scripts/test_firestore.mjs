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
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));

console.log('Firebase Config Check:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestoreConnection() {
  console.log('\n🧪 Testing basic Firestore connection...');
  
  try {
    // Test with the simplest possible document
    const testData = {
      name: "Test Supplement",
      price: 19.99,
      created: new Date().toISOString()
    };
    
    console.log('Attempting to write test document...');
    const docRef = doc(collection(db, 'test'), 'test-doc-1');
    await setDoc(docRef, testData);
    console.log('✅ Basic Firestore write successful!');
    
    // Now try with a supplement-like structure
    const supplementTest = {
      id: "vitamin-d3-test",
      name: "Vitamin D3 2000 IU Test",
      brand: "Test Brand",
      category: "Vitamins",
      price: 8.99,
      rating: 4.7,
      reviewCount: 1000,
      isAvailable: true
    };
    
    console.log('Attempting to write supplement test document...');
    const suppRef = doc(collection(db, 'supplements'), 'vitamin-d3-test');
    await setDoc(suppRef, supplementTest);
    console.log('✅ Supplement structure write successful!');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check if it's a permissions issue
    if (error.code === 'permission-denied') {
      console.log('\n🔒 This appears to be a Firestore security rules issue.');
      console.log('Please check your Firestore security rules and ensure they allow writes.');
    }
    
    // Check if it's a project configuration issue
    if (error.code === 'invalid-argument') {
      console.log('\n⚙️ This appears to be a project configuration issue.');
      console.log('Please verify:');
      console.log('1. Firebase project exists and is active');
      console.log('2. Firestore database is initialized in your Firebase console');
      console.log('3. Environment variables are correctly set');
    }
  }
}

testFirestoreConnection().catch(console.error);
