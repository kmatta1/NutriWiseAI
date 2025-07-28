#!/usr/bin/env node

/**
 * Master Seeding Script for NutriWiseAI Hybrid Architecture
 * 
 * This script orchestrates the seeding of both:
 * 1. Firestore (product catalog, user data)
 * 2. Pinecone Vector Database (scientific studies, user outcomes, product embeddings)
 * 
 * Expected costs: $5-10 for initial seeding
 * Expected time: 15-20 minutes
 */

import { seedProductCatalog } from './seed-product-catalog';
import { seedVectorDatabase } from './seed-vector-database';

async function seedHybridDatabase() {
  console.log('🚀 Starting Hybrid Database Seeding');
  console.log('====================================');
  console.log('');
  console.log('This will seed:');
  console.log('🔥 Firestore: Product catalog and operational data');
  console.log('🌲 Pinecone: Scientific studies, user patterns, product embeddings');
  console.log('');
  console.log('💰 Expected Cost: $5-10 (one-time)');
  console.log('⏱️  Expected Time: 15-20 minutes');
  console.log('');

  const startTime = Date.now();

  try {
    // Phase 1: Seed Firestore with product catalog
    console.log('Phase 1: Seeding Firestore Product Catalog');
    console.log('==========================================');
    await seedProductCatalog();
    console.log('✅ Firestore seeding completed');
    console.log('');

    // Phase 2: Seed Pinecone vector database
    console.log('Phase 2: Seeding Pinecone Vector Database');
    console.log('=========================================');
    await seedVectorDatabase();
    console.log('✅ Vector database seeding completed');
    console.log('');

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('🎉 Hybrid Database Seeding Complete!');
    console.log('====================================');
    console.log('');
    console.log(`⏱️  Total Time: ${duration} seconds`);
    console.log('');
    console.log('Your NutriWiseAI system now has:');
    console.log('✅ Product catalog in Firestore (real-time operational data)');
    console.log('✅ Scientific studies database in Pinecone (AI-powered evidence)');
    console.log('✅ User success patterns in Pinecone (personalization)');
    console.log('✅ Product embeddings in Pinecone (semantic search)');
    console.log('');
    console.log('🚦 Ready for AI-powered supplement recommendations!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/advisor');
    console.log('3. Test the comprehensive AI recommendations');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your API keys in .env file');
    console.log('2. Verify Pinecone and Firebase access');
    console.log('3. Check network connection');
    console.log('4. Run individual scripts to identify issues:');
    console.log('   npx ts-node scripts/seed-product-catalog.ts');
    console.log('   npx ts-node scripts/seed-vector-database.ts');
    
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedHybridDatabase();
}

export { seedHybridDatabase };
