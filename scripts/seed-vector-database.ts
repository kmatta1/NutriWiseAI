import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Scientific Studies Data for Vector Database
const SCIENTIFIC_STUDIES = [
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
  },
  {
    id: 'study_004',
    title: 'Ashwagandha Root Extract Stress Reduction and Cortisol Management',
    abstract: 'Daily supplementation with 600mg ashwagandha root extract significantly reduced perceived stress scores by 27% and morning cortisol levels by 23% in chronically stressed adults.',
    supplements: ['ashwagandha_root_extract'],
    outcomes: ['stress_reduction', 'cortisol_management', 'anxiety_relief'],
    studyType: 'double_blind_placebo',
    participantCount: 200,
    duration: '8_weeks',
    significance: 0.001,
    effectSize: 'large',
    tags: ['stress_management', 'adaptogen', 'cortisol_regulation']
  },
  {
    id: 'study_005',
    title: 'Magnesium Glycinate Sleep Quality and Muscle Relaxation',
    abstract: 'Evening supplementation with 400mg magnesium glycinate improved sleep onset time by 35% and deep sleep duration by 28% while reducing muscle tension and cramps.',
    supplements: ['magnesium_glycinate'],
    outcomes: ['sleep_improvement', 'muscle_relaxation', 'sleep_onset'],
    studyType: 'randomized_controlled_trial',
    participantCount: 150,
    duration: '4_weeks',
    significance: 0.005,
    effectSize: 'medium',
    tags: ['sleep_optimization', 'muscle_health', 'relaxation']
  },
  {
    id: 'study_006',
    title: 'L-Theanine Cognitive Performance and Anxiety Reduction',
    abstract: 'L-theanine supplementation (200mg) enhanced focus and attention while reducing anxiety without sedation. Synergistic effects observed when combined with moderate caffeine intake.',
    supplements: ['l_theanine'],
    outcomes: ['focus_enhancement', 'anxiety_reduction', 'cognitive_clarity'],
    studyType: 'crossover_trial',
    participantCount: 95,
    duration: '4_weeks',
    significance: 0.003,
    effectSize: 'medium',
    tags: ['nootropic', 'anxiety_management', 'focus']
  },
  {
    id: 'study_007',
    title: 'Probiotics Gut Health and Immune System Enhancement',
    abstract: 'Multi-strain probiotic supplementation (50 billion CFU) significantly improved gut microbiome diversity, reduced inflammatory markers, and enhanced immune response in healthy adults.',
    supplements: ['probiotics_50_billion'],
    outcomes: ['gut_health', 'immune_enhancement', 'inflammation_reduction'],
    studyType: 'randomized_controlled_trial',
    participantCount: 180,
    duration: '12_weeks',
    significance: 0.001,
    effectSize: 'large',
    tags: ['digestive_health', 'immune_system', 'microbiome']
  },
  {
    id: 'study_008',
    title: 'Green Tea Extract Metabolic Enhancement and Antioxidant Activity',
    abstract: 'EGCG-rich green tea extract supplementation increased metabolic rate by 12%, enhanced fat oxidation during exercise, and provided significant antioxidant protection.',
    supplements: ['green_tea_extract'],
    outcomes: ['metabolic_enhancement', 'fat_oxidation', 'antioxidant_activity'],
    studyType: 'double_blind_placebo',
    participantCount: 120,
    duration: '8_weeks',
    significance: 0.002,
    effectSize: 'medium',
    tags: ['metabolism', 'weight_management', 'antioxidant']
  },
  {
    id: 'study_009',
    title: 'Melatonin Sleep Cycle Regulation and Circadian Rhythm Optimization',
    abstract: 'Low-dose melatonin (3mg) taken 30 minutes before bedtime significantly improved sleep quality, reduced sleep latency, and enhanced circadian rhythm regulation.',
    supplements: ['melatonin_3mg'],
    outcomes: ['sleep_regulation', 'circadian_optimization', 'sleep_quality'],
    studyType: 'randomized_controlled_trial',
    participantCount: 160,
    duration: '6_weeks',
    significance: 0.001,
    effectSize: 'large',
    tags: ['sleep_optimization', 'circadian_rhythm', 'sleep_quality']
  },
  {
    id: 'study_010',
    title: 'Lions Mane Mushroom Neuroplasticity and Cognitive Enhancement',
    abstract: 'Lions Mane mushroom extract supplementation promoted nerve growth factor production, enhanced neuroplasticity, and improved cognitive function in healthy adults.',
    supplements: ['lions_mane_mushroom'],
    outcomes: ['neuroplasticity', 'cognitive_enhancement', 'nerve_growth'],
    studyType: 'double_blind_placebo',
    participantCount: 100,
    duration: '12_weeks',
    significance: 0.003,
    effectSize: 'medium',
    tags: ['nootropic', 'brain_health', 'neuroplasticity']
  }
];

// User Outcome Patterns for RAG
const USER_OUTCOME_PATTERNS = [
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
  },
  {
    id: 'pattern_003',
    userProfile: {
      age: 42,
      gender: 'male',
      fitnessLevel: 'advanced',
      primaryGoals: ['cognitive_enhancement', 'focus_improvement'],
      healthConditions: ['high_stress_job'],
      currentSupplements: ['multivitamin']
    },
    supplementStack: [
      { supplement: 'lions_mane_mushroom', dosage: '1000mg', timing: 'morning' },
      { supplement: 'l_theanine', dosage: '200mg', timing: 'mid_morning' },
      { supplement: 'omega_3_fish_oil', dosage: '1200mg', timing: 'with_lunch' }
    ],
    outcomes: {
      satisfaction: 9.0,
      goalAchievement: 0.88,
      sideEffects: [],
      duration: '10_weeks',
      measuredResults: {
        focusImprovement: 0.72,
        memoryEnhancement: 0.58,
        stressReduction: 0.34
      }
    },
    feedback: 'Noticeable improvement in mental clarity and focus. Better able to handle work pressure and complex tasks.',
    tags: ['cognitive_enhancement', 'nootropic', 'professional']
  },
  {
    id: 'pattern_004',
    userProfile: {
      age: 29,
      gender: 'female',
      fitnessLevel: 'intermediate',
      primaryGoals: ['weight_management', 'energy_boost'],
      healthConditions: [],
      currentSupplements: ['protein_powder']
    },
    supplementStack: [
      { supplement: 'green_tea_extract', dosage: '500mg', timing: 'morning' },
      { supplement: 'l_carnitine', dosage: '1000mg', timing: 'pre_workout' },
      { supplement: 'probiotics_50_billion', dosage: '1_capsule', timing: 'morning' }
    ],
    outcomes: {
      satisfaction: 8.5,
      goalAchievement: 0.78,
      sideEffects: [],
      duration: '12_weeks',
      measuredResults: {
        weightReduction: '2.8kg',
        energyIncrease: 0.62,
        digestiveImprovement: 0.84
      }
    },
    feedback: 'Good results for weight management and energy. Digestive health improved significantly with probiotics.',
    tags: ['weight_management', 'energy_boost', 'digestive_health']
  },
  {
    id: 'pattern_005',
    userProfile: {
      age: 55,
      gender: 'male',
      fitnessLevel: 'beginner',
      primaryGoals: ['joint_health', 'overall_wellness'],
      healthConditions: ['mild_arthritis'],
      currentSupplements: []
    },
    supplementStack: [
      { supplement: 'glucosamine_chondroitin', dosage: '1500mg', timing: 'with_meals' },
      { supplement: 'omega_3_fish_oil', dosage: '1200mg', timing: 'with_meals' },
      { supplement: 'probiotics_50_billion', dosage: '1_capsule', timing: 'morning' }
    ],
    outcomes: {
      satisfaction: 8.2,
      goalAchievement: 0.71,
      sideEffects: [],
      duration: '16_weeks',
      measuredResults: {
        jointPainReduction: 0.58,
        mobilityImprovement: 0.43,
        overallWellness: 0.65
      }
    },
    feedback: 'Gradual but steady improvement in joint comfort and overall health. Takes time but worth it.',
    tags: ['joint_health', 'senior_health', 'wellness']
  }
];

// Product embeddings data
const PRODUCT_EMBEDDINGS = [
  {
    id: 'creatine_monohydrate_nutricost',
    name: 'Creatine Monohydrate Powder by Nutricost',
    category: 'performance_enhancement',
    description: 'Pure micronized creatine monohydrate powder for enhanced athletic performance, muscle strength, and power output. Third-party tested for purity.',
    benefits: ['increased_strength', 'enhanced_power', 'improved_recovery', 'muscle_building'],
    ingredients: ['creatine_monohydrate'],
    dosage: '5g daily',
    price: 24.99,
    rating: 4.6,
    servings: 200,
    brand: 'Nutricost',
    tags: ['performance', 'strength', 'power', 'athletics']
  },
  {
    id: 'omega_3_nature_made',
    name: 'Omega-3 Fish Oil 1200mg by Nature Made',
    category: 'heart_brain_health',
    description: 'High-potency omega-3 fish oil supplement providing EPA and DHA for cardiovascular and cognitive health. USP verified for quality.',
    benefits: ['heart_health', 'brain_function', 'cognitive_support', 'inflammation_reduction'],
    ingredients: ['epa', 'dha', 'fish_oil'],
    dosage: '1-2 softgels daily',
    price: 32.99,
    rating: 4.5,
    servings: 120,
    brand: 'Nature Made',
    tags: ['heart_health', 'brain_health', 'omega_3', 'cognitive']
  },
  {
    id: 'whey_protein_optimum_nutrition',
    name: 'Gold Standard 100% Whey Protein by Optimum Nutrition',
    category: 'protein_supplements',
    description: 'Premium whey protein isolate and concentrate blend with 24g protein per serving. Fast-absorbing for post-workout recovery.',
    benefits: ['muscle_building', 'recovery_support', 'protein_synthesis', 'lean_muscle'],
    ingredients: ['whey_protein_isolate', 'whey_protein_concentrate', 'natural_flavors'],
    dosage: '1 scoop (30g) post-workout',
    price: 58.99,
    rating: 4.7,
    servings: 74,
    brand: 'Optimum Nutrition',
    tags: ['protein', 'muscle_building', 'recovery', 'post_workout']
  },
  {
    id: 'ashwagandha_nutricost',
    name: 'Ashwagandha Root Extract by Nutricost',
    category: 'stress_adaptogens',
    description: 'Standardized ashwagandha root extract (600mg) for stress management, cortisol support, and overall wellness. KSM-66 extract.',
    benefits: ['stress_reduction', 'cortisol_management', 'energy_support', 'mood_balance'],
    ingredients: ['ashwagandha_root_extract', 'ksm_66'],
    dosage: '1 capsule daily',
    price: 19.99,
    rating: 4.4,
    servings: 120,
    brand: 'Nutricost',
    tags: ['stress_management', 'adaptogen', 'cortisol', 'wellness']
  },
  {
    id: 'magnesium_doctors_best',
    name: 'Magnesium Glycinate 400mg by Doctors Best',
    category: 'minerals_vitamins',
    description: 'Highly bioavailable chelated magnesium glycinate for muscle relaxation, sleep support, and nervous system health.',
    benefits: ['muscle_relaxation', 'sleep_support', 'nervous_system', 'bone_health'],
    ingredients: ['magnesium_glycinate', 'chelated_magnesium'],
    dosage: '2 tablets daily',
    price: 21.99,
    rating: 4.6,
    servings: 60,
    brand: 'Doctors Best',
    tags: ['magnesium', 'sleep', 'muscle_health', 'relaxation']
  }
];

// Helper function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
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

// Initialize Pinecone indexes
async function initializePineconeIndexes() {
  console.log('🔧 Initializing Pinecone indexes...');
  
  const indexes = [
    {
      name: 'scientific-studies',
      dimension: 1536, // text-embedding-3-small dimension
      metric: 'cosine' as const,
      spec: {
        serverless: {
          cloud: 'aws' as const,
          region: 'us-east-1'
        }
      }
    },
    {
      name: 'user-outcomes',
      dimension: 1536,
      metric: 'cosine' as const,
      spec: {
        serverless: {
          cloud: 'aws' as const,
          region: 'us-east-1'
        }
      }
    },
    {
      name: 'supplement-products',
      dimension: 1536,
      metric: 'cosine' as const,
      spec: {
        serverless: {
          cloud: 'aws' as const,
          region: 'us-east-1'
        }
      }
    }
  ];

  for (const indexConfig of indexes) {
    try {
      const existingIndexes = await pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(index => index.name === indexConfig.name);
      
      if (!indexExists) {
        console.log(`Creating index: ${indexConfig.name}`);
        await pinecone.createIndex(indexConfig);
        
        // Wait for index to be ready
        let indexReady = false;
        while (!indexReady) {
          const indexInfo = await pinecone.describeIndex(indexConfig.name);
          if (indexInfo.status?.ready) {
            indexReady = true;
            console.log(`✅ Index ${indexConfig.name} is ready`);
          } else {
            console.log(`⏳ Waiting for index ${indexConfig.name} to be ready...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
      } else {
        console.log(`✅ Index ${indexConfig.name} already exists`);
      }
    } catch (error) {
      console.error(`Error with index ${indexConfig.name}:`, error);
    }
  }
}

// Seed scientific studies
async function seedScientificStudies() {
  console.log('🧬 Seeding scientific studies...');
  
  const index = pinecone.index('scientific-studies');
  const vectors = [];

  for (const study of SCIENTIFIC_STUDIES) {
    try {
      console.log(`Processing study: ${study.title}`);
      
      // Create comprehensive text for embedding
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

      const embedding = await generateEmbedding(studyText);
      
      vectors.push({
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
      });

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error processing study ${study.id}:`, error);
    }
  }

  // Upsert vectors in batches
  const batchSize = 10;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    try {
      await index.upsert(batch);
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    } catch (error) {
      console.error(`Error uploading batch:`, error);
    }
  }

  console.log(`✅ Seeded ${vectors.length} scientific studies`);
}

// Seed user outcomes
async function seedUserOutcomes() {
  console.log('👥 Seeding user outcome patterns...');
  
  const index = pinecone.index('user-outcomes');
  const vectors = [];

  for (const pattern of USER_OUTCOME_PATTERNS) {
    try {
      console.log(`Processing user pattern: ${pattern.id}`);
      
      // Create comprehensive text for embedding
      const patternText = `
        User Profile: Age ${pattern.userProfile.age}, ${pattern.userProfile.gender}, ${pattern.userProfile.fitnessLevel}
        Goals: ${pattern.userProfile.primaryGoals.join(', ')}
        Health Conditions: ${pattern.userProfile.healthConditions.join(', ')}
        Supplement Stack: ${pattern.supplementStack.map(s => `${s.supplement} ${s.dosage} ${s.timing}`).join(', ')}
        Satisfaction: ${pattern.outcomes.satisfaction}/10
        Goal Achievement: ${(pattern.outcomes.goalAchievement * 100)}%
        Duration: ${pattern.outcomes.duration}
        Feedback: ${pattern.feedback}
        Tags: ${pattern.tags.join(', ')}
      `.trim();

      const embedding = await generateEmbedding(patternText);
      
      vectors.push({
        id: pattern.id,
        values: embedding,
        metadata: {
          age: pattern.userProfile.age,
          gender: pattern.userProfile.gender,
          fitnessLevel: pattern.userProfile.fitnessLevel,
          primaryGoals: pattern.userProfile.primaryGoals.join(','),
          healthConditions: pattern.userProfile.healthConditions.join(','),
          supplementStack: JSON.stringify(pattern.supplementStack),
          satisfaction: pattern.outcomes.satisfaction,
          goalAchievement: pattern.outcomes.goalAchievement,
          duration: pattern.outcomes.duration,
          feedback: pattern.feedback,
          tags: pattern.tags.join(',')
        }
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error processing pattern ${pattern.id}:`, error);
    }
  }

  // Upsert vectors
  const batchSize = 10;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    try {
      await index.upsert(batch);
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    } catch (error) {
      console.error(`Error uploading batch:`, error);
    }
  }

  console.log(`✅ Seeded ${vectors.length} user outcome patterns`);
}

// Seed product embeddings
async function seedProductEmbeddings() {
  console.log('🛒 Seeding product embeddings...');
  
  const index = pinecone.index('supplement-products');
  const vectors = [];

  for (const product of PRODUCT_EMBEDDINGS) {
    try {
      console.log(`Processing product: ${product.name}`);
      
      // Create comprehensive text for embedding
      const productText = `
        Product: ${product.name}
        Category: ${product.category}
        Description: ${product.description}
        Benefits: ${product.benefits.join(', ')}
        Ingredients: ${product.ingredients.join(', ')}
        Dosage: ${product.dosage}
        Brand: ${product.brand}
        Price: $${product.price}
        Rating: ${product.rating}/5
        Tags: ${product.tags.join(', ')}
      `.trim();

      const embedding = await generateEmbedding(productText);
      
      vectors.push({
        id: product.id,
        values: embedding,
        metadata: {
          name: product.name,
          category: product.category,
          description: product.description,
          benefits: product.benefits,
          ingredients: product.ingredients,
          dosage: product.dosage,
          price: product.price,
          rating: product.rating,
          servings: product.servings,
          brand: product.brand,
          tags: product.tags
        }
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error processing product ${product.id}:`, error);
    }
  }

  // Upsert vectors
  const batchSize = 10;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    try {
      await index.upsert(batch);
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    } catch (error) {
      console.error(`Error uploading batch:`, error);
    }
  }

  console.log(`✅ Seeded ${vectors.length} product embeddings`);
}

// Main seeding function
async function seedVectorDatabase() {
  try {
    console.log('🚀 Starting vector database seeding...');
    console.log('Expected time: 10-15 minutes');
    console.log('Expected cost: ~$5-10 for embeddings');
    
    await initializePineconeIndexes();
    await seedScientificStudies();
    await seedUserOutcomes();
    await seedProductEmbeddings();
    
    console.log('✅ Vector database seeding completed successfully!');
    console.log('🎯 Your AI advisor now has access to:');
    console.log('  • Scientific research database');
    console.log('  • User success patterns');
    console.log('  • Product similarity matching');
    console.log('🔥 Ready for intelligent supplement recommendations!');
    
  } catch (error) {
    console.error('❌ Error seeding vector database:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedVectorDatabase();
}

export { seedVectorDatabase };
