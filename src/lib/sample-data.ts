// Sample data for fallback AI system (no external dependencies)

export const sampleStudies = [
  {
    id: 'study_001',
    title: 'Synergistic Effects of Creatine and Beta-Alanine on High-Intensity Exercise Performance',
    abstract: 'This randomized controlled trial examined the combined effects of creatine monohydrate (5g) and beta-alanine (3.2g) supplementation on anaerobic performance in trained athletes over 8 weeks.',
    supplements: ['creatine', 'beta-alanine'],
    studyType: 'RCT',
    participantCount: 45,
    duration: 8,
    outcomes: ['increased power output', 'reduced fatigue', 'improved anaerobic capacity'],
    effectSize: 1.2,
    qualityScore: 8.5,
    citation: 'Smith et al. (2023). Journal of Sports Science, 41(12), 1123-1135.',
    pValue: 0.001,
    confidenceInterval: '95%'
  },
  {
    id: 'study_002',
    title: 'Whey Protein and Leucine Supplementation for Muscle Protein Synthesis',
    abstract: 'Double-blind placebo-controlled study investigating the effects of whey protein (25g) with added leucine (2.5g) on muscle protein synthesis rates in resistance-trained individuals.',
    supplements: ['whey protein', 'leucine'],
    studyType: 'RCT',
    participantCount: 32,
    duration: 12,
    outcomes: ['increased MPS', 'improved recovery', 'enhanced muscle growth'],
    effectSize: 0.9,
    qualityScore: 9.2,
    citation: 'Johnson et al. (2023). American Journal of Clinical Nutrition, 118(3), 567-578.',
    pValue: 0.003,
    confidenceInterval: '95%'
  },
  {
    id: 'study_003',
    title: 'Magnesium Glycinate and Zinc Bisglycinate for Sleep Quality and Recovery',
    abstract: 'Randomized trial examining the effects of magnesium glycinate (400mg) and zinc bisglycinate (15mg) on sleep quality and recovery markers in athletes.',
    supplements: ['magnesium', 'zinc'],
    studyType: 'RCT',
    participantCount: 60,
    duration: 6,
    outcomes: ['improved sleep quality', 'faster recovery', 'reduced inflammation'],
    effectSize: 1.1,
    qualityScore: 8.8,
    citation: 'Davis et al. (2023). Sleep Medicine Research, 14(2), 89-98.',
    pValue: 0.002,
    confidenceInterval: '95%'
  }
];

export const sampleUserOutcomes = [
  {
    stackId: 'power-performance',
    userId: 'user_001',
    supplements: ['creatine', 'beta-alanine', 'citrulline'],
    adherence: 0.95,
    duration: 8,
    outcomes: {
      strengthGain: 0.18,
      enduranceImprovement: 0.22,
      satisfactionScore: 4.7,
      sideEffects: 'none',
      wouldRecommend: true
    },
    demographics: {
      age: 28,
      gender: 'male',
      fitnessLevel: 'intermediate',
      goals: ['strength', 'power']
    }
  },
  {
    stackId: 'recovery-sleep',
    userId: 'user_002',
    supplements: ['magnesium', 'zinc', 'melatonin'],
    adherence: 0.88,
    duration: 6,
    outcomes: {
      sleepQualityImprovement: 0.35,
      recoveryTime: -0.25,
      satisfactionScore: 4.5,
      sideEffects: 'mild drowsiness initially',
      wouldRecommend: true
    },
    demographics: {
      age: 35,
      gender: 'female',
      fitnessLevel: 'advanced',
      goals: ['recovery', 'sleep']
    }
  },
  {
    stackId: 'muscle-building',
    userId: 'user_003',
    supplements: ['whey protein', 'leucine', 'vitamin d'],
    adherence: 0.92,
    duration: 12,
    outcomes: {
      muscleGain: 0.15,
      strengthGain: 0.12,
      satisfactionScore: 4.8,
      sideEffects: 'none',
      wouldRecommend: true
    },
    demographics: {
      age: 24,
      gender: 'male',
      fitnessLevel: 'beginner',
      goals: ['muscle building', 'strength']
    }
  }
];

export const sampleAffiliateProducts = [
  {
    name: 'Creatine Monohydrate',
    brand: 'Optimum Nutrition',
    price: 29.99,
    affiliateUrl: 'https://example.com/creatine-affiliate',
    commissionRate: 0.08,
    rating: 4.6,
    reviewCount: 15420,
    category: 'performance',
    dosage: '5g',
    servingsPerContainer: 60,
    keyBenefits: ['increased power', 'muscle volumization', 'improved recovery'],
    realProductImage: 'https://m.media-amazon.com/images/I/51YJLAOlzWL._AC_SL1000_.jpg'
  },
  {
    name: 'Beta-Alanine Powder',
    brand: 'NOW Sports',
    price: 24.99,
    affiliateUrl: 'https://example.com/beta-alanine-affiliate',
    commissionRate: 0.06,
    rating: 4.4,
    reviewCount: 8750,
    category: 'performance',
    dosage: '3.2g',
    servingsPerContainer: 75,
    keyBenefits: ['reduced fatigue', 'improved endurance', 'enhanced workout capacity'],
    realProductImage: 'https://m.media-amazon.com/images/I/71BtVvXBXuL._AC_SL1500_.jpg'
  },
  {
    name: 'Whey Protein Isolate',
    brand: 'Dymatize',
    price: 54.99,
    affiliateUrl: 'https://example.com/whey-affiliate',
    commissionRate: 0.12,
    rating: 4.7,
    reviewCount: 22340,
    category: 'protein',
    dosage: '25g',
    servingsPerContainer: 32,
    keyBenefits: ['muscle protein synthesis', 'fast absorption', 'lean muscle growth'],
    realProductImage: 'https://m.media-amazon.com/images/I/71k5qOUlFKL._AC_SL1500_.jpg'
  },
  {
    name: 'Magnesium Glycinate',
    brand: 'Thorne',
    price: 19.99,
    affiliateUrl: 'https://example.com/magnesium-affiliate',
    commissionRate: 0.10,
    rating: 4.8,
    reviewCount: 5670,
    category: 'recovery',
    dosage: '400mg',
    servingsPerContainer: 30,
    keyBenefits: ['improved sleep', 'muscle relaxation', 'reduced stress'],
    realProductImage: 'https://m.media-amazon.com/images/I/61E5HpNQzjL._AC_SL1500_.jpg'
  },
  {
    name: 'Zinc Bisglycinate',
    brand: 'Life Extension',
    price: 12.99,
    affiliateUrl: 'https://example.com/zinc-affiliate',
    commissionRate: 0.09,
    rating: 4.5,
    reviewCount: 3420,
    category: 'recovery',
    dosage: '15mg',
    servingsPerContainer: 90,
    keyBenefits: ['immune support', 'wound healing', 'hormone optimization'],
    realProductImage: 'https://m.media-amazon.com/images/I/61E5ZZKgVEL._SL1500_.jpg'
  }
];
