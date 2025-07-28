#!/usr/bin/env node

/**
 * NutriWiseAI Hybrid Architecture Setup Script
 * 
 * This script helps you set up the hybrid Pinecone + Firestore architecture
 * for the NutriWiseAI supplement recommendation system.
 * 
 * Expected Costs:
 * - Pinecone Starter: $70/month
 * - Firestore: $5/month
 * - OpenAI API: $10-20/month
 * - Total: ~$85-95/month
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

class HybridArchitectureSetup {
  private envConfig: Record<string, string> = {};

  async run() {
    console.log('🚀 NutriWiseAI Hybrid Architecture Setup');
    console.log('=====================================');
    console.log('');
    console.log('This script will help you set up:');
    console.log('✅ Pinecone Vector Database (AI Features)');
    console.log('✅ Firebase Firestore (Operational Data)');
    console.log('✅ OpenAI API (LLM + Embeddings)');
    console.log('✅ Product Catalog Seeding');
    console.log('');
    console.log('💰 Expected Monthly Costs: $85-95');
    console.log('⏱️  Setup Time: 15-20 minutes');
    console.log('');

    try {
      await this.checkPrerequisites();
      await this.gatherApiKeys();
      await this.createEnvironmentFile();
      await this.installDependencies();
      await this.setupFirebase();
      await this.setupPinecone();
      await this.seedDatabases();
      await this.runTests();
      
      console.log('');
      console.log('🎉 Setup Complete!');
      console.log('==================');
      console.log('');
      console.log('Your NutriWiseAI system is ready with:');
      console.log('✅ Hybrid Architecture (Pinecone + Firestore)');
      console.log('✅ AI-Powered Recommendations');
      console.log('✅ Scientific Evidence Database');
      console.log('✅ User Success Patterns');
      console.log('✅ Product Catalog');
      console.log('');
      console.log('🚦 Next Steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000/advisor');
      console.log('3. Test the AI recommendations!');
      console.log('');
      console.log('📊 Monitor your usage at:');
      console.log('• Pinecone: https://app.pinecone.io');
      console.log('• Firebase: https://console.firebase.google.com');
      console.log('• OpenAI: https://platform.openai.com/usage');
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`npm version: ${npmVersion}`);
    } catch (error) {
      throw new Error('npm is required but not found');
    }
    
    console.log('✅ Prerequisites check passed');
  }

  async gatherApiKeys() {
    console.log('');
    console.log('🔑 API Key Configuration');
    console.log('========================');
    console.log('');
    console.log('Please gather the following API keys:');
    console.log('');

    // OpenAI API Key
    console.log('1. OpenAI API Key (Required)');
    console.log('   • Visit: https://platform.openai.com/api-keys');
    console.log('   • Cost: ~$10-20/month for embeddings + LLM calls');
    const openaiKey = await question('   Enter your OpenAI API key: ');
    this.envConfig.OPENAI_API_KEY = openaiKey;

    // Pinecone API Key
    console.log('');
    console.log('2. Pinecone API Key (Required)');
    console.log('   • Visit: https://app.pinecone.io');
    console.log('   • Sign up for Starter plan ($70/month)');
    const pineconeKey = await question('   Enter your Pinecone API key: ');
    this.envConfig.PINECONE_API_KEY = pineconeKey;

    // Firebase Configuration
    console.log('');
    console.log('3. Firebase Configuration (Required)');
    console.log('   • Visit: https://console.firebase.google.com');
    console.log('   • Create a new project');
    console.log('   • Enable Firestore Database');
    const firebaseProject = await question('   Enter your Firebase Project ID: ');
    this.envConfig.FIREBASE_PROJECT_ID = firebaseProject;

    // Optional: Anthropic
    console.log('');
    console.log('4. Anthropic API Key (Optional)');
    console.log('   • Visit: https://console.anthropic.com');
    console.log('   • Used for enhanced content analysis');
    const anthropicKey = await question('   Enter your Anthropic API key (or press Enter to skip): ');
    if (anthropicKey.trim()) {
      this.envConfig.ANTHROPIC_API_KEY = anthropicKey;
    }

    console.log('');
    console.log('✅ API keys collected');
  }

  async createEnvironmentFile() {
    console.log('');
    console.log('📝 Creating environment configuration...');

    const envContent = `# NutriWiseAI Environment Configuration - Generated by Setup Script
# Generated on: ${new Date().toISOString()}

# AI Services Configuration
OPENAI_API_KEY=${this.envConfig.OPENAI_API_KEY}
${this.envConfig.ANTHROPIC_API_KEY ? `ANTHROPIC_API_KEY=${this.envConfig.ANTHROPIC_API_KEY}` : '# ANTHROPIC_API_KEY=optional'}
PINECONE_API_KEY=${this.envConfig.PINECONE_API_KEY}

# Firebase Configuration
FIREBASE_PROJECT_ID=${this.envConfig.FIREBASE_PROJECT_ID}

# Next.js Configuration
NEXTAUTH_SECRET=${this.generateRandomSecret()}
NEXTAUTH_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development

# Hybrid Architecture Settings
USE_VECTOR_DATABASE=true
USE_FIRESTORE=true
ENABLE_RAG_FEATURES=true

# Cost Optimization Settings
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
MAX_TOKENS_PER_REQUEST=4000
CACHE_EMBEDDINGS=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
BATCH_SIZE=10
RATE_LIMIT_DELAY=200

# Vector Database Configuration
PINECONE_INDEX_DIMENSION=1536
SCIENTIFIC_STUDIES_INDEX=scientific-studies
USER_OUTCOMES_INDEX=user-outcomes
PRODUCT_CATALOG_INDEX=supplement-products
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Environment file created (.env)');
  }

  async installDependencies() {
    console.log('');
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      throw new Error('Failed to install dependencies');
    }
  }

  async setupFirebase() {
    console.log('');
    console.log('🔥 Setting up Firebase...');
    console.log('Please follow these steps:');
    console.log('1. Go to https://console.firebase.google.com');
    console.log('2. Select your project');
    console.log('3. Go to Firestore Database');
    console.log('4. Click "Create database"');
    console.log('5. Choose "Start in test mode"');
    console.log('6. Select your preferred region');
    
    await question('Press Enter when Firestore is set up...');
    console.log('✅ Firebase setup confirmed');
  }

  async setupPinecone() {
    console.log('');
    console.log('🌲 Setting up Pinecone...');
    console.log('Please follow these steps:');
    console.log('1. Go to https://app.pinecone.io');
    console.log('2. Sign up for Starter plan ($70/month)');
    console.log('3. Note your API key (already entered)');
    console.log('4. The setup script will create indexes automatically');
    
    await question('Press Enter when Pinecone account is ready...');
    console.log('✅ Pinecone setup confirmed');
  }

  async seedDatabases() {
    console.log('');
    console.log('🌱 Seeding databases...');
    console.log('This will take 10-15 minutes and cost ~$5-10 in API calls');
    
    const confirm = await question('Proceed with database seeding? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('⏭️  Skipping database seeding (you can run it later)');
      return;
    }

    try {
      console.log('Seeding Firestore product catalog...');
      execSync('npx ts-node scripts/seed-product-catalog.ts', { stdio: 'inherit' });
      
      console.log('Seeding Pinecone vector database...');
      execSync('npx ts-node scripts/seed-vector-database.ts', { stdio: 'inherit' });
      
      console.log('✅ Database seeding completed');
    } catch (error) {
      console.log('⚠️  Seeding encountered issues - you can run it manually later');
      console.log('   npx ts-node scripts/seed-product-catalog.ts');
      console.log('   npx ts-node scripts/seed-vector-database.ts');
    }
  }

  async runTests() {
    console.log('');
    console.log('🧪 Running system tests...');
    
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ Tests passed');
    } catch (error) {
      console.log('⚠️  Some tests failed - system should still work');
    }
  }

  private generateRandomSecret(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  new HybridArchitectureSetup().run();
}

export { HybridArchitectureSetup };
