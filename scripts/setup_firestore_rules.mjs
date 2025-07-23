#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Firebase configuration
const configPath = join(__dirname, '..', 'firebaseconfig.json');
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));

async function updateFirestoreRules() {
  console.log('🔧 Automatically updating Firestore security rules...');
  console.log(`📋 Project ID: ${firebaseConfig.projectId}`);
  
  // Open rules for data import
  const openRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary open rules for data import - REMOVE AFTER IMPORT
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  try {
    // Get access token using Firebase REST API
    const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInAnonymously?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnSecureToken: true
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status} ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication successful');

    // Update Firestore rules using Firebase REST API
    const rulesResponse = await fetch(`https://firebaserules.googleapis.com/v1/projects/${firebaseConfig.projectId}/releases`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${authData.idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `projects/${firebaseConfig.projectId}/releases/cloud.firestore`,
        rulesetName: `projects/${firebaseConfig.projectId}/rulesets`,
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: openRules
            }
          ]
        }
      })
    });

    if (rulesResponse.ok) {
      console.log('✅ Firestore rules updated successfully!');
      console.log('🔓 Rules are now open for data import');
      console.log('⚠️  IMPORTANT: Change rules back to secure after import!');
      return true;
    } else {
      console.log('⚠️  REST API method failed, using alternative approach...');
      return false;
    }

  } catch (error) {
    console.log('⚠️  Auto-update failed, providing manual instructions...');
    console.error('Error details:', error.message);
    return false;
  }
}

async function manualInstructions() {
  console.log('\n📋 MANUAL FIRESTORE RULES UPDATE REQUIRED');
  console.log('==========================================');
  console.log('1. Go to: https://console.firebase.google.com/');
  console.log(`2. Select project: ${firebaseConfig.projectId}`);
  console.log('3. Click "Firestore Database" → "Rules" tab');
  console.log('4. Replace existing rules with:');
  console.log('\n' + '='.repeat(50));
  console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`);
  console.log('='.repeat(50));
  console.log('5. Click "Publish"');
  console.log('6. Run: npm run test-firestore');
  console.log('\n⚠️  REMEMBER: Change rules back to secure after data import!');
}

async function main() {
  console.log('🚀 Firebase Firestore Rules Auto-Updater');
  console.log('========================================');
  
  const success = await updateFirestoreRules();
  
  if (!success) {
    await manualInstructions();
  } else {
    console.log('\n🧪 Testing Firestore connection...');
    // Auto-run the test
    const { spawn } = await import('child_process');
    const testProcess = spawn('npm', ['run', 'test-firestore'], { 
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 SUCCESS! Firestore is ready for data import!');
        console.log('Run: npm run generate-all-stacks');
      } else {
        console.log('\n❌ Test failed. Please check Firestore setup manually.');
      }
    });
  }
}

main().catch(console.error);
