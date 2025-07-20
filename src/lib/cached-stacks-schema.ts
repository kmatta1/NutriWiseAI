// Database schema and types for the cached supplement system
export interface UserArchetype {
  id: string;
  name: string;
  description: string;
  demographics: {
    ageRange: [number, number];
    gender?: 'male' | 'female' | 'any';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
    primaryGoals: string[];
  };
  criteria: {
    budget: number;
    dietaryRestrictions: string[];
    healthConcerns: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface VerifiedSupplement {
  id: string;
  name: string;
  brand: string;
  dosage: string;
  timing: string;
  reasoning: string;
  
  // Verified Amazon data
  asin: string;
  amazonUrl: string;
  imageUrl: string;
  currentPrice: number;
  primeEligible: boolean;
  rating: number;
  reviewCount: number;
  
  // Verification metadata
  lastVerified: Date;
  lastPriceUpdate: Date;
  isAvailable: boolean;
  linkStatus: 'working' | 'broken' | 'redirected';
  imageStatus: 'working' | 'broken' | 'placeholder' | 'verified';
  
  // Quality indicators
  qualityFactors: {
    thirdPartyTested: boolean;
    gmpCertified: boolean;
    organicCertified: boolean;
    allergenFree: boolean;
    bioavailableForm: boolean;
  };
}

export interface CachedSupplementStack {
  id: string;
  archetypeId: string;
  name: string;
  description: string;
  
  supplements: VerifiedSupplement[];
  
  // Stack metadata
  totalMonthlyCost: number;
  estimatedCommission: number;
  evidenceScore: number;
  userSuccessRate: number;
  timeline: string;
  synergies: string[];
  contraindications: string[];
  
  // Cache metadata
  createdAt: Date;
  lastUpdated: Date;
  lastVerified: Date;
  allLinksValid: boolean;
  averageRating: number;
  
  scientificBacking: {
    studyCount: number;
    qualityScore: number;
    citations: string[];
  };
}

export interface StackVerificationResult {
  stackId: string;
  isValid: boolean;
  brokenLinks: string[];
  brokenImages: string[];
  unavailableProducts: string[];
  priceChanges: Array<{
    supplementId: string;
    oldPrice: number;
    newPrice: number;
  }>;
  recommendedActions: string[];
}

// Common user archetypes to pre-generate stacks for
export const USER_ARCHETYPES: UserArchetype[] = [
  {
    id: 'young-male-muscle',
    name: 'Young Male - Muscle Building',
    description: 'College-age to young professional male focused on building muscle mass',
    demographics: {
      ageRange: [18, 28],
      gender: 'male',
      activityLevel: 'heavy',
      primaryGoals: ['muscle building', 'strength', 'performance']
    },
    criteria: {
      budget: 75,
      dietaryRestrictions: [],
      healthConcerns: [],
      experienceLevel: 'intermediate'
    }
  },
  {
    id: 'young-female-wellness',
    name: 'Young Female - General Wellness',
    description: 'Young professional woman focused on overall health and energy',
    demographics: {
      ageRange: [22, 32],
      gender: 'female',
      activityLevel: 'moderate',
      primaryGoals: ['energy', 'skin health', 'mood support', 'general wellness']
    },
    criteria: {
      budget: 65,
      dietaryRestrictions: [],
      healthConcerns: ['stress', 'energy'],
      experienceLevel: 'beginner'
    }
  },
  {
    id: 'middle-aged-male-performance',
    name: 'Middle-aged Male - Performance & Health',
    description: 'Professional male balancing performance with long-term health',
    demographics: {
      ageRange: [35, 50],
      gender: 'male',
      activityLevel: 'moderate',
      primaryGoals: ['energy', 'cognitive function', 'heart health', 'performance']
    },
    criteria: {
      budget: 90,
      dietaryRestrictions: [],
      healthConcerns: ['cardiovascular health', 'cognitive function'],
      experienceLevel: 'intermediate'
    }
  },
  {
    id: 'middle-aged-female-wellness',
    name: 'Middle-aged Female - Wellness & Energy',
    description: 'Professional woman focused on energy, stress management, and aging well',
    demographics: {
      ageRange: [35, 50],
      gender: 'female',
      activityLevel: 'moderate',
      primaryGoals: ['energy', 'stress management', 'bone health', 'skin health']
    },
    criteria: {
      budget: 80,
      dietaryRestrictions: [],
      healthConcerns: ['stress', 'hormonal balance', 'bone health'],
      experienceLevel: 'intermediate'
    }
  },
  {
    id: 'senior-vitality',
    name: 'Senior - Vitality & Longevity',
    description: 'Older adults focused on maintaining health and vitality',
    demographics: {
      ageRange: [55, 75],
      gender: 'any',
      activityLevel: 'light',
      primaryGoals: ['joint health', 'cognitive function', 'heart health', 'bone health']
    },
    criteria: {
      budget: 70,
      dietaryRestrictions: [],
      healthConcerns: ['joint pain', 'cognitive decline', 'cardiovascular health'],
      experienceLevel: 'beginner'
    }
  },
  {
    id: 'athlete-performance',
    name: 'Athlete - Peak Performance',
    description: 'Competitive athletes and serious fitness enthusiasts',
    demographics: {
      ageRange: [20, 40],
      gender: 'any',
      activityLevel: 'athlete',
      primaryGoals: ['performance optimization', 'recovery', 'endurance', 'strength']
    },
    criteria: {
      budget: 120,
      dietaryRestrictions: [],
      healthConcerns: [],
      experienceLevel: 'advanced'
    }
  }
];
