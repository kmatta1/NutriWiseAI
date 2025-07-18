// Data seeding script for Pinecone indexes
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Sample scientific studies data
const sampleStudies = [
  {
    id: 'study_001',
    title: 'Synergistic Effects of Creatine and Beta-Alanine on High-Intensity Exercise Performance',
    abstract: 'This randomized controlled trial examined the combined effects of creatine monohydrate (5g) and beta-alanine (3.2g) supplementation on anaerobic performance in trained athletes over 8 weeks.',
    supplements: ['creatine', 'beta-alanine'],
    studyType: 'RCT',
    qualityScore: 8.5,
    sampleSize: 60,
    outcomes: ['increased power output', 'reduced fatigue', 'improved time to exhaustion'],
    dosages: ['creatine: 5g daily', 'beta-alanine: 3.2g daily'],
    duration: '8 weeks',
    citations: 'Journal of Sports Science, 2023'
  },
  {
    id: 'study_002',
    title: 'Caffeine and L-Theanine Combination for Cognitive Enhancement',
    abstract: 'Double-blind study investigating the cognitive benefits of combining caffeine (100mg) with L-theanine (200mg) in healthy adults.',
    supplements: ['caffeine', 'l-theanine'],
    studyType: 'RCT',
    qualityScore: 9.0,
    sampleSize: 80,
    outcomes: ['improved focus', 'reduced anxiety', 'enhanced cognitive performance'],
    dosages: ['caffeine: 100mg', 'l-theanine: 200mg'],
    duration: '4 weeks',
    citations: 'Nutritional Neuroscience, 2023'
  },
  {
    id: 'study_003',
    title: 'Magnesium and Vitamin D3 Synergy for Bone Health',
    abstract: 'Meta-analysis of 15 studies examining the combined effects of magnesium and vitamin D3 supplementation on bone mineral density.',
    supplements: ['magnesium', 'vitamin-d3'],
    studyType: 'meta-analysis',
    qualityScore: 9.2,
    sampleSize: 1200,
    outcomes: ['increased bone density', 'improved calcium absorption', 'reduced fracture risk'],
    dosages: ['magnesium: 400mg daily', 'vitamin D3: 2000 IU daily'],
    duration: '12 months',
    citations: 'Bone Research Journal, 2023'
  },
  {
    id: 'study_004',
    title: 'Omega-3 and Curcumin Anti-Inflammatory Stack',
    abstract: 'Clinical trial examining the anti-inflammatory effects of combined omega-3 fatty acids and curcumin supplementation.',
    supplements: ['omega-3', 'curcumin'],
    studyType: 'RCT',
    qualityScore: 8.7,
    sampleSize: 90,
    outcomes: ['reduced inflammation markers', 'improved joint mobility', 'enhanced recovery'],
    dosages: ['omega-3: 2g daily', 'curcumin: 500mg daily'],
    duration: '12 weeks',
    citations: 'Inflammation Research, 2023'
  },
  {
    id: 'study_005',
    title: 'Vitamin B Complex and Ashwagandha for Stress Management',
    abstract: 'Randomized trial investigating the stress-reducing effects of B-complex vitamins combined with ashwagandha root extract.',
    supplements: ['vitamin-b-complex', 'ashwagandha'],
    studyType: 'RCT',
    qualityScore: 8.3,
    sampleSize: 120,
    outcomes: ['reduced cortisol levels', 'improved mood', 'better sleep quality'],
    dosages: ['B-complex: 50mg daily', 'ashwagandha: 300mg daily'],
    duration: '8 weeks',
    citations: 'Stress & Health Journal, 2023'
  }
];

// Sample user outcomes data
const sampleUserOutcomes = [
  {
    id: 'user_001',
    age: 28,
    gender: 'male',
    fitnessGoals: ['muscle_gain', 'strength'],
    lifestyle: 'active',
    successRate: 0.85,
    stacks: [{
      supplements: [
        { name: 'creatine', dosage: '5g', timing: 'post-workout' },
        { name: 'whey-protein', dosage: '25g', timing: 'post-workout' },
        { name: 'vitamin-d3', dosage: '2000 IU', timing: 'morning' }
      ],
      duration: '12 weeks',
      results: ['15% strength increase', '3kg muscle gain', 'improved recovery']
    }]
  },
  {
    id: 'user_002',
    age: 35,
    gender: 'female',
    fitnessGoals: ['weight_loss', 'energy'],
    lifestyle: 'moderately_active',
    successRate: 0.92,
    stacks: [{
      supplements: [
        { name: 'caffeine', dosage: '100mg', timing: 'morning' },
        { name: 'l-theanine', dosage: '200mg', timing: 'morning' },
        { name: 'green-tea-extract', dosage: '500mg', timing: 'afternoon' }
      ],
      duration: '8 weeks',
      results: ['sustained energy', '5kg weight loss', 'better focus']
    }]
  },
  {
    id: 'user_003',
    age: 42,
    gender: 'male',
    fitnessGoals: ['general_health', 'recovery'],
    lifestyle: 'busy_professional',
    successRate: 0.78,
    stacks: [{
      supplements: [
        { name: 'omega-3', dosage: '2g', timing: 'with_dinner' },
        { name: 'magnesium', dosage: '400mg', timing: 'evening' },
        { name: 'vitamin-b-complex', dosage: '50mg', timing: 'morning' }
      ],
      duration: '16 weeks',
      results: ['better sleep', 'reduced stress', 'improved immunity']
    }]
  }
];

// Sample affiliate products data
const sampleAffiliateProducts = [
  {
    id: 'product_001',
    name: 'Premium Creatine Monohydrate',
    supplement: 'creatine',
    price: 24.99,
    rating: 4.8,
    commissionRate: 0.12,
    affiliateUrl: 'https://example.com/affiliate/creatine-001',
    brand: 'OptimumNutrition',
    servings: 60,
    pricePerServing: 0.42
  },
  {
    id: 'product_002',
    name: 'Caffeine + L-Theanine Capsules',
    supplement: 'caffeine-l-theanine',
    price: 19.99,
    rating: 4.6,
    commissionRate: 0.15,
    affiliateUrl: 'https://example.com/affiliate/caffeine-theanine-002',
    brand: 'NowFoods',
    servings: 90,
    pricePerServing: 0.22
  },
  {
    id: 'product_003',
    name: 'High-Potency Omega-3 Fish Oil',
    supplement: 'omega-3',
    price: 34.99,
    rating: 4.7,
    commissionRate: 0.10,
    affiliateUrl: 'https://example.com/affiliate/omega3-003',
    brand: 'NordicNaturals',
    servings: 60,
    pricePerServing: 0.58
  },
  {
    id: 'product_004',
    name: 'Magnesium Glycinate Complex',
    supplement: 'magnesium',
    price: 22.99,
    rating: 4.5,
    commissionRate: 0.14,
    affiliateUrl: 'https://example.com/affiliate/magnesium-004',
    brand: 'DoctorsBest',
    servings: 120,
    pricePerServing: 0.19
  },
  {
    id: 'product_005',
    name: 'Organic Ashwagandha Root Extract',
    supplement: 'ashwagandha',
    price: 27.99,
    rating: 4.4,
    commissionRate: 0.18,
    affiliateUrl: 'https://example.com/affiliate/ashwagandha-005',
    brand: 'GaiaHerbs',
    servings: 60,
    pricePerServing: 0.47
  }
];

export async function seedPineconeIndexes() {
  console.log('🌱 Starting Pinecone data seeding...');

  try {
    // 1. Seed Scientific Studies Index
    console.log('📚 Seeding scientific studies...');
    const studyEmbeddings = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: sampleStudies.map(study => 
        `${study.title} ${study.abstract} ${study.supplements.join(' ')} ${study.outcomes.join(' ')}`
      )
    });

    const studyIndex = pinecone.index('scientific-studies');
    await studyIndex.upsert(
      studyEmbeddings.data.map((embedding, i) => ({
        id: sampleStudies[i].id,
        values: embedding.embedding,
        metadata: sampleStudies[i]
      }))
    );

    // 2. Seed User Outcomes Index
    console.log('👥 Seeding user outcomes...');
    const userEmbeddings = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: sampleUserOutcomes.map(user => 
        `${user.age} ${user.gender} ${user.fitnessGoals.join(' ')} ${user.lifestyle}`
      )
    });

    const userIndex = pinecone.index('user-outcomes');
    await userIndex.upsert(
      userEmbeddings.data.map((embedding, i) => ({
        id: sampleUserOutcomes[i].id,
        values: embedding.embedding,
        metadata: {
          age: sampleUserOutcomes[i].age,
          gender: sampleUserOutcomes[i].gender,
          fitnessGoals: sampleUserOutcomes[i].fitnessGoals,
          lifestyle: sampleUserOutcomes[i].lifestyle,
          successRate: sampleUserOutcomes[i].successRate,
          stacksJson: JSON.stringify(sampleUserOutcomes[i].stacks)
        }
      }))
    );

    // 3. Seed Affiliate Products Index
    console.log('🛍️ Seeding affiliate products...');
    const productEmbeddings = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: sampleAffiliateProducts.map(product => 
        `${product.name} ${product.supplement} ${product.brand}`
      )
    });

    const productIndex = pinecone.index('affiliate-products');
    await productIndex.upsert(
      productEmbeddings.data.map((embedding, i) => ({
        id: sampleAffiliateProducts[i].id,
        values: embedding.embedding,
        metadata: sampleAffiliateProducts[i]
      }))
    );

    console.log('✅ Pinecone seeding completed successfully!');
    console.log(`📊 Seeded ${sampleStudies.length} studies, ${sampleUserOutcomes.length} user outcomes, ${sampleAffiliateProducts.length} products`);

  } catch (error) {
    console.error('❌ Error seeding Pinecone:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPineconeIndexes()
    .then(() => console.log('🎉 Seeding complete!'))
    .catch(console.error);
}

export { sampleStudies, sampleUserOutcomes, sampleAffiliateProducts };
