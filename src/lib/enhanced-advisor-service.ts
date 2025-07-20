import { CachedStackService } from './cached-stack-service';
import { fallbackAI } from './fallback-ai';
import type { SupplementAdvisorInput } from './actions';
import { CachedSupplementStack } from './cached-stacks-schema';

export interface EnhancedSupplementAdvisorResult {
  success: boolean;
  stack: any;
  source: 'cached' | 'ai-generated';
  matchScore?: number;
  archetypeUsed?: string;
  error?: string;
}

export class EnhancedAdvisorService {
  private cachedStackService: CachedStackService;

  constructor() {
    this.cachedStackService = new CachedStackService();
  }
  
  /**
   * Get supplement recommendations - tries cached stacks first, falls back to AI
   */
  async getRecommendations(input: SupplementAdvisorInput): Promise<EnhancedSupplementAdvisorResult> {
    try {
      console.log('🎯 Enhanced Advisor: Processing request for user profile');
      
      // Initialize cached stacks if not already done
      if (this.cachedStackService.getAllCachedStacks().length === 0) {
        console.log('🔄 Initializing cached stacks...');
        await this.cachedStackService.generateAndCacheAllStacks();
      }

      // Step 1: Try to find a matching cached stack
      const cachedResult = await this.tryFindCachedStack(input);
      if (cachedResult) {
        console.log(`✅ Found cached stack: ${cachedResult.stack.name} (${cachedResult.archetypeUsed})`);
        return cachedResult;
      }

      // Step 2: Fall back to AI generation
      console.log('🤖 No cached match found, generating with AI...');
      return await this.generateWithAI(input);

    } catch (error) {
      console.error('❌ Enhanced Advisor error:', error);
      return {
        success: false,
        stack: null,
        source: 'ai-generated',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Try to find a matching cached stack
   */
  private async tryFindCachedStack(input: SupplementAdvisorInput): Promise<EnhancedSupplementAdvisorResult | null> {
    const userGoals = Array.isArray(input.fitnessGoals) ? input.fitnessGoals : [input.fitnessGoals];
    const age = input.age;
    const gender = input.gender;

    // Find best matching cached stack
    const matchedStack = this.cachedStackService.findBestMatchingStack(userGoals, age, gender);
    
    if (matchedStack) {
      // Convert cached stack to the format expected by the frontend
      const convertedStack = this.convertCachedStackToAdvisorFormat(matchedStack, input);
      
      return {
        success: true,
        stack: convertedStack,
        source: 'cached',
        matchScore: this.calculateMatchScore(matchedStack, input),
        archetypeUsed: matchedStack.archetypeId
      };
    }

    return null;
  }

  /**
   * Generate recommendations using AI as fallback
   */
  private async generateWithAI(input: SupplementAdvisorInput): Promise<EnhancedSupplementAdvisorResult> {
    try {
      // Convert input to UserProfile format for fallback AI
      const userProfile = {
        age: input.age,
        gender: input.gender,
        fitnessGoals: Array.isArray(input.fitnessGoals) ? input.fitnessGoals : [input.fitnessGoals],
        dietaryRestrictions: input.dietaryRestrictions || [],
        currentSupplements: input.currentSupplements || [],
        healthConcerns: input.healthConcerns || [],
        budget: input.budget || 100,
        experienceLevel: input.experienceLevel || 'intermediate',
        lifestyle: input.lifestyle || 'balanced',
        activityLevel: input.activityLevel || 'moderate',
        diet: input.diet || 'balanced',
        sleepQuality: input.sleepQuality || 'good',
        otherCriteria: input.otherCriteria,
        race: input.race,
        weight: input.weight
      };

      const aiStack = await fallbackAI.generateEvidenceBasedStack(userProfile, true);
      
      return {
        success: true,
        stack: aiStack,
        source: 'ai-generated'
      };
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      throw error;
    }
  }

  /**
   * Convert cached stack format to advisor format
   */
  private convertCachedStackToAdvisorFormat(cachedStack: CachedSupplementStack, _input: SupplementAdvisorInput) {
    return {
      id: cachedStack.id,
      name: cachedStack.name,
      supplements: cachedStack.supplements.map(supplement => ({
        name: supplement.name,
        dosage: supplement.dosage,
        timing: supplement.timing,
        reasoning: supplement.reasoning,
        affiliateUrl: supplement.amazonUrl,
        commissionRate: 0.08, // 8%
        price: supplement.currentPrice,
        imageUrl: supplement.imageUrl,
        brand: supplement.brand,
        amazonProduct: {
          asin: supplement.asin,
          rating: supplement.rating,
          reviewCount: supplement.reviewCount,
          primeEligible: supplement.primeEligible,
          qualityScore: 0.9,
          qualityFactors: supplement.qualityFactors
        }
      })),
      totalMonthlyCost: cachedStack.totalMonthlyCost,
      estimatedCommission: cachedStack.estimatedCommission,
      evidenceScore: cachedStack.evidenceScore,
      userSuccessRate: cachedStack.userSuccessRate,
      timeline: cachedStack.timeline,
      synergies: cachedStack.synergies,
      contraindications: cachedStack.contraindications,
      scientificBacking: cachedStack.scientificBacking,
      // Add metadata about caching
      _metadata: {
        source: 'cached',
        archetypeUsed: cachedStack.archetypeId,
        lastVerified: cachedStack.lastVerified,
        allLinksValid: cachedStack.allLinksValid
      }
    };
  }

  /**
   * Calculate how well a cached stack matches the user input
   */
  private calculateMatchScore(stack: CachedSupplementStack, input: SupplementAdvisorInput): number {
    let score = 0;
    let maxScore = 0;

    // Age matching (weight: 20%)
    maxScore += 20;
    // Note: We'd need to store archetype data with the stack for perfect matching
    // For now, assume reasonable age matching based on stack type
    score += 15;

    // Budget matching (weight: 25%)
    maxScore += 25;
    const budgetDiff = Math.abs((input.budget || 100) - stack.totalMonthlyCost);
    if (budgetDiff <= 20) score += 25;
    else if (budgetDiff <= 40) score += 15;
    else if (budgetDiff <= 60) score += 10;

    // Goals matching (weight: 35%) - simplified for now
    maxScore += 35;
    // This would require storing goals with the stack for perfect matching
    score += 25;

    // Gender matching (weight: 10%)
    maxScore += 10;
    score += 8; // Assume most stacks work for both genders

    // Activity level matching (weight: 10%)
    maxScore += 10;
    score += 7; // Simplified

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Get analytics about cached vs AI usage
   */
  getUsageAnalytics() {
    // This would be implemented with actual usage tracking
    return {
      totalRequests: 0,
      cachedStackUsage: 0,
      aiGenerationUsage: 0,
      averageResponseTime: {
        cached: 50, // milliseconds
        ai: 2500   // milliseconds
      }
    };
  }

  /**
   * Clear cached stacks and regenerate with updated data
   */
  async clearAndRegenerateStacks(): Promise<void> {
    console.log('🗑️ Clearing existing cached stacks...');
    
    // Create a new service instance to clear the cache
    this.cachedStackService = new CachedStackService();
    
    console.log('🔄 Regenerating stacks with updated data...');
    await this.cachedStackService.generateAndCacheAllStacks();
    
    console.log('✅ Cache cleared and stacks regenerated successfully');
  }
}

export const enhancedAdvisorService = new EnhancedAdvisorService();
