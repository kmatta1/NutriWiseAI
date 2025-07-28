// check-migration-success.js
// Quick check to verify migration success

const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();

async function checkSuccess() {
  const snapshot = await db.collection('productCatalog').get();
  
  let firebase = 0, amazon = 0, missing = 0;
  
  snapshot.forEach(doc => {
    const url = doc.data().imageUrl;
    if (!url) missing++;
    else if (url.includes('firebasestorage')) firebase++;
    else if (url.includes('amazon')) amazon++;
  });
  
  console.log(`📊 QUICK CHECK: ${snapshot.size} products`);
  console.log(`✅ Firebase Storage: ${firebase}`);
  console.log(`🔴 Amazon (broken): ${amazon}`);
  console.log(`❌ Missing: ${missing}`);
  console.log(`🎯 Success Rate: ${((firebase/snapshot.size)*100).toFixed(1)}%`);
}

checkSuccess().catch(console.error);
