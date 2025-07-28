// Evidence-based AI service for supplement recommendations (no vector dependencies)
import { EvidenceBasedAI } from './evidence-based-ai-service';

// Import and re-export types from our evidence-based service
export interface SupplementStack {
  id: string;
  name: string;
  description: string;
  supplements: {
    id: string;
    name: string;
    brand: string;
    category: string;
    dosage: string;
    timing: string;
    reasoning: string;
    price: number;
    amazonUrl: string;
    affiliateUrl: string;
    imageUrl: string;
    asin: string;
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    primeEligible: boolean;
    evidenceLevel: string;
    studyCount: number;
  }[];
  userProfile: {
    age: number;
    gender: string;
    fitnessGoals: string[];
    budget: number;
    dietaryRestrictions: string[];
    currentSupplements: string[];
  };
  totalMonthlyCost: number;
  estimatedCommission: number;
  evidenceScore: number;
  userSuccessRate: number;
  timeline: string;
  synergies: string[];
  contraindications: string[];
  scientificBacking: {
    studyCount: number;
    qualityScore: number;
    citations: string[];
  };
}

export interface UserProfile {
  age: number;
  gender: string;
  fitnessGoals: string[] | string;
  dietaryRestrictions?: string[];
  currentSupplements?: string[];
  healthConcerns?: string[];
  budget: number;
  experienceLevel?: string;
  lifestyle?: string;
}

// Simplified AI service using evidence-based supplement selection
export class RevenueOptimizedAI {
  private evidenceBasedAI = new EvidenceBasedAI();

  async generateEvidenceBasedStack(userProfile: UserProfile, isPremium: boolean = false): Promise<SupplementStack> {
    try {
      // Use our evidence-based AI service for scientifically accurate recommendations
      const stack = await this.evidenceBasedAI.generateEvidenceBasedStack(userProfile);
      
      console.log(`Generated evidence-based stack for ${userProfile.fitnessGoals}: ${stack.name}`);
      console.log(`Stack cost: $${stack.totalMonthlyCost}, Evidence score: ${stack.evidenceScore}%`);
      
      return stack;
      
    } catch (error) {
      console.error('Error generating evidence-based stack:', error);
      throw new Error('Failed to generate supplement recommendation');
    }
  }
}

export const revenueOptimizedAI = new RevenueOptimizedAI();
