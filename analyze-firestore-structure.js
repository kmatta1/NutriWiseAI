// analyze-firestore-structure.js
// Comprehensive analysis of Firestore collections for NutriWise AI

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();

async function analyzeAllCollections() {
  console.log('🔍 COMPREHENSIVE FIRESTORE ANALYSIS');
  console.log('====================================\n');

  try {
    // Get all collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    
    console.log(`📚 Found ${collectionNames.length} collections:`);
    collectionNames.forEach(name => console.log(`  • ${name}`));
    console.log('');

    const analysis = {
      collections: {},
      totalDocuments: 0,
      issues: [],
      recommendations: []
    };

    // Analyze each collection
    for (const collectionName of collectionNames) {
      console.log(`📊 Analyzing ${collectionName}:`);
      console.log('-'.repeat(40));

      try {
        const snapshot = await db.collection(collectionName).get();
        const docs = [];
        const sampleDocs = [];
        const fieldAnalysis = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          docs.push({ id: doc.id, ...data });
          
          // Keep first 2 docs as samples
          if (sampleDocs.length < 2) {
            sampleDocs.push({ id: doc.id, data });
          }

          // Analyze field structure
          Object.keys(data).forEach(field => {
            if (!fieldAnalysis[field]) {
              fieldAnalysis[field] = {
                type: typeof data[field],
                examples: [],
                count: 0
              };
            }
            fieldAnalysis[field].count++;
            if (fieldAnalysis[field].examples.length < 2) {
              fieldAnalysis[field].examples.push(data[field]);
            }
          });
        });

        console.log(`  📄 Documents: ${docs.length}`);
        console.log(`  🗂️  Fields: ${Object.keys(fieldAnalysis).length}`);
        
        // Show key fields
        Object.entries(fieldAnalysis).forEach(([field, info]) => {
          const coverage = ((info.count / docs.length) * 100).toFixed(1);
          console.log(`    ${field}: ${info.type} (${coverage}% coverage)`);
        });

        // Store analysis
        analysis.collections[collectionName] = {
          documentCount: docs.length,
          fields: fieldAnalysis,
          sampleDocuments: sampleDocs,
          allDocuments: docs.slice(0, 5) // Only store first 5 for analysis
        };

        analysis.totalDocuments += docs.length;
        console.log('');

      } catch (error) {
        console.error(`❌ Error analyzing ${collectionName}:`, error.message);
        analysis.issues.push(`${collectionName}: ${error.message}`);
      }
    }

    // Generate insights
    generateInsights(analysis);
    
    // Save analysis
    fs.writeFileSync('firestore-analysis.json', JSON.stringify(analysis, null, 2));
    console.log('\n📁 Analysis saved to firestore-analysis.json');

    return analysis;

  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return null;
  }
}

function generateInsights(analysis) {
  console.log('🧠 KEY INSIGHTS:');
  console.log('================');

  const collections = analysis.collections;

  // 1. Identify product collections
  const productCollections = Object.keys(collections).filter(name => 
    name.toLowerCase().includes('product') || 
    name.toLowerCase().includes('catalog')
  );

  // 2. Identify stack collections
  const stackCollections = Object.keys(collections).filter(name =>
    name.toLowerCase().includes('stack') || 
    name.toLowerCase().includes('recommendation')
  );

  console.log(`\n📦 Product Collections: ${productCollections.join(', ')}`);
  console.log(`🥞 Stack Collections: ${stackCollections.join(', ')}`);

  // 3. Check data quality
  productCollections.forEach(collName => {
    const coll = collections[collName];
    console.log(`\n📊 ${collName} Analysis:`);
    console.log(`  📄 Documents: ${coll.documentCount}`);
    console.log(`  🖼️  Has images: ${coll.fields.imageUrl ? 'Yes' : 'No'}`);
    console.log(`  💰 Has prices: ${coll.fields.price ? 'Yes' : 'No'}`);
    console.log(`  🏷️  Has brands: ${coll.fields.brand ? 'Yes' : 'No'}`);
    console.log(`  📂 Has categories: ${coll.fields.category ? 'Yes' : 'No'}`);
  });

  // 4. Analyze stacks for accuracy
  stackCollections.forEach(collName => {
    const coll = collections[collName];
    console.log(`\n🥞 ${collName} Analysis:`);
    console.log(`  📄 Documents: ${coll.documentCount}`);
    
    // Check sample stacks
    if (coll.sampleDocuments.length > 0) {
      coll.sampleDocuments.forEach((doc, index) => {
        console.log(`  📋 Sample ${index + 1}: ${doc.data.name || doc.id}`);
        if (doc.data.goal) {
          console.log(`    🎯 Goal: ${doc.data.goal}`);
        }
        if (doc.data.supplements) {
          console.log(`    💊 Supplements: ${doc.data.supplements.length}`);
          
          // Check for muscle building without protein
          const isMuscleBuildingGoal = (doc.data.goal || doc.data.name || '').toLowerCase().includes('muscle');
          if (isMuscleBuildingGoal) {
            const hasProtein = doc.data.supplements.some(s => 
              (s.name || '').toLowerCase().includes('protein') ||
              (s.name || '').toLowerCase().includes('whey') ||
              (s.name || '').toLowerCase().includes('casein')
            );
            if (!hasProtein) {
              console.log(`    ❌ ISSUE: Muscle building stack without protein!`);
              analysis.issues.push(`${doc.data.name || doc.id}: Muscle building stack missing protein`);
            }
          }
        }
      });
    }
  });

  // 5. Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');

  // Database structure recommendations
  if (productCollections.length > 1) {
    console.log('❌ Multiple product collections detected - consolidate into single source');
    analysis.recommendations.push('Consolidate product collections into single productCatalog');
  }

  if (stackCollections.length > 1) {
    console.log('❌ Multiple stack collections detected - consolidate for consistency');
    analysis.recommendations.push('Consolidate stack collections for consistent AI recommendations');
  }

  // AI accuracy recommendations
  if (analysis.issues.some(issue => issue.includes('muscle building'))) {
    console.log('❌ AI recommendations not scientifically accurate');
    analysis.recommendations.push('Rebuild AI logic with evidence-based supplement science');
  }

  console.log('\n🎯 OPTIMAL STRUCTURE:');
  console.log('1. 📦 products - Master catalog (single source of truth)');
  console.log('2. 🥞 stacks - Evidence-based supplement combinations');
  console.log('3. 👤 userProfiles - User questionnaire data');
  console.log('4. 🎯 recommendations - AI-generated personalized stacks');
}

// Run the analysis
analyzeAllCollections().catch(console.error);
