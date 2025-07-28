/**
 * Vector Database Seeder - CommonJS Version
 * 
 * Seeds the Pinecone vector database with scientific studies, user outcomes, and product embeddings
 * This enables the AI-powered recommendation system with RAG capabilities
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const { config } = require('dotenv');

// Load environment variables
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

console.log('✅ Vector database clients initialized');

// Sample scientific studies for testing
const SAMPLE_SCIENTIFIC_STUDIES = [
  {
    id: 'study_001',
    title: 'Creatine Monohydrate Performance Enhancement in Athletes',
    abstract: 'A randomized controlled trial showing 15% improvement in high-intensity performance with 5g daily creatine supplementation. Participants showed increased muscle power output and reduced fatigue during repeated sprint protocols.',
    supplements: ['creatine_monohydrate'],
    outcomes: ['performance_enhancement', 'muscle_power', 'fatigue_reduction'],
    studyType: 'randomized_controlled_trial',
    participantCount: 120,
    duration: '8_weeks',
    significance: 0.001,
    effectSize: 'large',
    tags: ['athletics', 'performance', 'strength_training']
  },
  {
    id: 'study_002',
    title: 'Omega-3 Fatty Acids Cognitive Function and Memory Enhancement',
    abstract: 'Long-term study demonstrating significant improvements in working memory, attention span, and cognitive processing speed with 1200mg daily omega-3 supplementation in healthy adults aged 25-65.',
    supplements: ['omega_3_fish_oil'],
    outcomes: ['cognitive_enhancement', 'memory_improvement', 'attention_span'],
    studyType: 'longitudinal_cohort',
    participantCount: 450,
    duration: '12_months',
    significance: 0.002,
    effectSize: 'medium',
    tags: ['cognitive_health', 'brain_function', 'memory']
  },
  {
    id: 'study_003',
    title: 'Whey Protein Muscle Synthesis and Recovery Optimization',
    abstract: 'Post-exercise whey protein consumption (25g) significantly enhanced muscle protein synthesis rates by 31% and reduced recovery time by 24% in resistance-trained individuals.',
    supplements: ['whey_protein_powder'],
    outcomes: ['muscle_synthesis', 'recovery_enhancement', 'protein_utilization'],
    studyType: 'crossover_trial',
    participantCount: 85,
    duration: '6_weeks',
    significance: 0.001,
    effectSize: 'large',
    tags: ['muscle_building', 'recovery', 'protein_synthesis']
  }
];

// Sample user outcome patterns
const SAMPLE_USER_PATTERNS = [
  {
    id: 'pattern_001',
    userProfile: {
      age: 28,
      gender: 'male',
      fitnessLevel: 'intermediate',
      primaryGoals: ['muscle_building', 'performance_enhancement'],
      healthConditions: [],
      currentSupplements: []
    },
    supplementStack: [
      { supplement: 'creatine_monohydrate', dosage: '5g', timing: 'post_workout' },
      { supplement: 'whey_protein_powder', dosage: '25g', timing: 'post_workout' },
      { supplement: 'omega_3_fish_oil', dosage: '1200mg', timing: 'with_meals' }
    ],
    outcomes: {
      satisfaction: 9.2,
      goalAchievement: 0.85,
      sideEffects: [],
      duration: '12_weeks',
      measuredResults: {
        strengthIncrease: 0.23,
        muscleGain: '3.2kg',
        bodyFatReduction: 0.08
      }
    },
    feedback: 'Excellent results with muscle building and strength gains. No side effects. Highly recommend this combination for intermediate lifters.',
    tags: ['muscle_building', 'strength_training', 'male_adult']
  },
  {
    id: 'pattern_002',
    userProfile: {
      age: 34,
      gender: 'female',
      fitnessLevel: 'beginner',
      primaryGoals: ['stress_management', 'sleep_improvement'],
      healthConditions: ['chronic_stress', 'mild_insomnia'],
      currentSupplements: []
    },
    supplementStack: [
      { supplement: 'ashwagandha_root_extract', dosage: '600mg', timing: 'morning' },
      { supplement: 'magnesium_glycinate', dosage: '400mg', timing: 'evening' },
      { supplement: 'melatonin_3mg', dosage: '3mg', timing: '30min_before_bed' }
    ],
    outcomes: {
      satisfaction: 8.8,
      goalAchievement: 0.92,
      sideEffects: [],
      duration: '8_weeks',
      measuredResults: {
        stressReduction: 0.68,
        sleepQualityImprovement: 0.75,
        energyIncrease: 0.45
      }
    },
    feedback: 'Life-changing results for stress and sleep. Finally sleeping through the night and feeling much more relaxed during the day.',
    tags: ['stress_management', 'sleep_optimization', 'female_adult']
  }
];

// Sample product embeddings
const SAMPLE_PRODUCT_EMBEDDINGS = [
  {
    id: 'creatine_monohydrate_bulk',
    name: 'Creatine Monohydrate Powder by BulkSupplements',
    category: 'performance_enhancement',
    description: 'Pure micronized creatine monohydrate powder for enhanced athletic performance, muscle strength, and power output. Third-party tested for purity.',
    benefits: ['increased_strength', 'enhanced_power', 'improved_recovery', 'muscle_building'],
    ingredients: ['creatine_monohydrate'],
    dosage: '5g daily',
    price: 24.96,
    rating: 4.4,
    servings: 200,
    brand: 'BulkSupplements',
    tags: ['performance', 'strength', 'power', 'athletics']
  }
];

// Helper function to generate embeddings
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Test Pinecone connection
async function testPineconeConnection() {
  console.log('🔧 Testing Pinecone connection...');
  
  try {
    const indexes = await pinecone.listIndexes();
    console.log('✅ Pinecone connection successful');
    console.log(`📊 Found ${indexes.indexes?.length || 0} existing indexes`);
    return true;
  } catch (error) {
    console.error('❌ Pinecone connection failed:', error.message);
    return false;
  }
}

// Initialize a single test index
async function initializeTestIndex() {
  console.log('🔧 Setting up test index...');
  
  const indexName = 'nutriwise-test';
  
  try {
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(index => index.name === indexName);
    
    if (!indexExists) {
      console.log(`Creating test index: ${indexName}`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // text-embedding-3-small dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      // Wait for index to be ready
      console.log('⏳ Waiting for index to be ready...');
      let indexReady = false;
      let attempts = 0;
      while (!indexReady && attempts < 30) {
        try {
          const indexInfo = await pinecone.describeIndex(indexName);
          if (indexInfo.status?.ready) {
            indexReady = true;
            console.log(`✅ Test index ${indexName} is ready`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
            attempts++;
          }
        } catch (error) {
          console.log(`⏳ Still waiting for index... (attempt ${attempts + 1}/30)`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          attempts++;
        }
      }
      
      if (!indexReady) {
        throw new Error('Index creation timeout');
      }
    } else {
      console.log(`✅ Test index ${indexName} already exists`);
    }
    
    return indexName;
  } catch (error) {
    console.error(`Error setting up test index:`, error);
    throw error;
  }
}

// Seed a few test vectors
async function seedTestVectors() {
  console.log('🌱 Starting vector database test seeding...');
  
  const isConnected = await testPineconeConnection();
  if (!isConnected) {
    throw new Error('Pinecone connection failed');
  }
  
  const indexName = await initializeTestIndex();
  const index = pinecone.index(indexName);
  
  try {
    // Test with one study
    const study = SAMPLE_SCIENTIFIC_STUDIES[0];
    console.log(`Processing study: ${study.title}`);
    
    const studyText = `
      Title: ${study.title}
      Abstract: ${study.abstract}
      Supplements: ${study.supplements.join(', ')}
      Outcomes: ${study.outcomes.join(', ')}
      Study Type: ${study.studyType}
      Participants: ${study.participantCount}
      Duration: ${study.duration}
      Effect Size: ${study.effectSize}
      Tags: ${study.tags.join(', ')}
    `.trim();

    console.log('🧠 Generating embedding...');
    const embedding = await generateEmbedding(studyText);
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    console.log('📤 Uploading to Pinecone...');
    await index.upsert([{
      id: study.id,
      values: embedding,
      metadata: {
        title: study.title,
        abstract: study.abstract,
        supplements: study.supplements,
        outcomes: study.outcomes,
        studyType: study.studyType,
        participantCount: study.participantCount,
        duration: study.duration,
        significance: study.significance,
        effectSize: study.effectSize,
        tags: study.tags
      }
    }]);
    
    console.log('✅ Successfully uploaded test vector to Pinecone');
    
    // Test query
    console.log('🔍 Testing vector query...');
    const queryEmbedding = await generateEmbedding('creatine strength performance');
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 1,
      includeMetadata: true
    });
    
    console.log(`✅ Query successful! Found ${queryResult.matches?.length || 0} matches`);
    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log(`📊 Top match: ${queryResult.matches[0].metadata?.title} (score: ${queryResult.matches[0].score?.toFixed(3)})`);
    }
    
    return {
      success: true,
      indexName,
      vectorsUploaded: 1,
      queryResults: queryResult.matches?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error seeding test vectors:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTestVectors()
    .then((result) => {
      console.log('🎉 Vector database test seeding completed!');
      console.log(`📊 Result: ${JSON.stringify(result, null, 2)}`);
      console.log('');
      console.log('✅ Prerequisites confirmed:');
      console.log('  • Pinecone connection working');
      console.log('  • OpenAI embeddings working'); 
      console.log('  • Vector upload/query working');
      console.log('');
      console.log('🚦 Ready to proceed with full vector database seeding!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Vector database test seeding failed:', error);
      console.log('');
      console.log('🔧 Troubleshooting steps:');
      console.log('1. Check your Pinecone API key');
      console.log('2. Check your OpenAI API key');
      console.log('3. Verify your Pinecone account has available resources');
      console.log('4. Check network connectivity');
      process.exit(1);
    });
}

module.exports = { seedTestVectors, testPineconeConnection };
