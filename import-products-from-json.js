// Script: import-products-from-json.js
// Description: Imports all product JSON files from public folder into Firestore 'productCatalog' collection.
// Usage: node import-products-from-json.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with your service account key.
// Ensure serviceAccountKey.json is in the repo root (for the target project).
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importProducts() {
  try {
    const publicDir = path.join(__dirname, 'public');
    const files = fs.readdirSync(publicDir).filter(file => file.startsWith('product-data-') && file.endsWith('.json'));
    console.log(`Found ${files.length} product files to import.`);

    let importedCount = 0;
    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);

      // Use ASIN or file-based ID
      const docId = data.asin || path.basename(file, '.json');
      
      // Prepare document payload matching ProductCatalogItem interface.
      const payload = {
        id: docId,
        name: data.title || data.name,
        brand: data.brand || data.manufacturer || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        description: data.description || data.feature || '',
        servingSize: data.servingSize || '',
        servingsPerContainer: data.servingsPerContainer || 0,
        asin: data.asin || '',
        amazonUrl: data.amazonUrl || data.url || '',
        affiliateUrl: data.affiliateUrl || data.amazonUrl || data.url || '',
        imageUrl: data.imageUrl || data.image || '',
        currentPrice: data.currentPrice || data.price || 0,
        primeEligible: data.primeEligible || false,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        isAvailable: data.isAvailable !== false,
        activeIngredients: Array.isArray(data.activeIngredients) ? data.activeIngredients : [],
        recommendedDosage: data.recommendedDosage || {},
        evidenceLevel: data.evidenceLevel || 'moderate',
        studyCount: data.studyCount || 0,
        citations: data.citations || [],
        qualityFactors: data.qualityFactors || {},
        targetGoals: data.targetGoals || [],
        targetDemographics: data.targetDemographics || {},
        healthBenefits: data.healthBenefits || [],
        contraindications: data.contraindications || [],
        drugInteractions: data.drugInteractions || [],
        sideEffects: data.sideEffects || [],
        commissionRate: data.commissionRate || 0,
        costPerServing: data.costPerServing || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        lastPriceUpdate: admin.firestore.FieldValue.serverTimestamp(),
        lastVerified: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      await db.collection('productCatalog').doc(docId).set(payload);
      importedCount++;
      console.log(`Imported [${importedCount}/${files.length}]: ${payload.name}`);
    }

    console.log(`\n🎉 Finished importing ${importedCount} products into Firestore.`);
  } catch (error) {
    console.error('Error importing products:', error);
  }
}

importProducts();
