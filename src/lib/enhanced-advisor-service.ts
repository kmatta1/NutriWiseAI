import { fetchVerifiedStacks } from './cached-stack-service.ts';
import { fallbackAI } from './fallback-ai.ts';
import type { SupplementAdvisorInput } from './actions.ts';
import { CachedSupplementStack } from './cached-stacks-schema.ts';
import { enhanceSupplementStack } from './product-data-loader';

export interface EnhancedSupplementAdvisorResult {
  success: boolean;
  stack: any;
  source: 'cached' | 'ai-generated';
  matchScore?: number;
  archetypeUsed?: string;
  error?: string;
}

export class EnhancedAdvisorService {
  private cachedStacks: any[] = [];
  
  /**
   * Get supplement recommendations - tries cached stacks first, falls back to AI
   */
  async getRecommendations(input: SupplementAdvisorInput): Promise<EnhancedSupplementAdvisorResult> {
    try {
      console.log('🎯 Enhanced Advisor: Processing request for user profile');
      
      // Initialize cached stacks if not already done
      // Fetch cached stacks from Firestore if not already loaded
      if (this.cachedStacks.length === 0) {
        console.log('🔄 Fetching cached stacks from Firestore...');
        this.cachedStacks = await fetchVerifiedStacks();
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
    const matchedStack = this.findBestMatchingStack(userGoals, age, gender);

    if (matchedStack) {
      // Convert cached stack to the format expected by the frontend
      const convertedStack = this.convertCachedStackToAdvisorFormat(matchedStack, input);
      
      // Enhance the stack with real product data from Firestore
      console.log('🔄 Enhancing cached stack with real product data...');
      const enhancedStack = await enhanceSupplementStack(convertedStack);
      console.log('✅ Stack enhanced with Firestore data');

      return {
        success: true,
        stack: enhancedStack,
        source: 'cached',
        matchScore: this.calculateMatchScore(matchedStack, input),
        archetypeUsed: matchedStack.archetypeId
      };
    }

    return null;
  }

  /**
   * Find best matching stack from cachedStacks array
   */
  private findBestMatchingStack(userGoals: string[], age: number, gender: string): any | null {
    // Simple matching logic: find stack with most overlapping goals and matching demographics
    let bestMatch: any | null = null;
    let bestScore = -1;
    for (const stack of this.cachedStacks) {
      let score = 0;
      if (stack.demographics) {
        if (stack.demographics.gender === gender || stack.demographics.gender === 'any') score += 1;
        if (age >= stack.demographics.ageRange[0] && age <= stack.demographics.ageRange[1]) score += 1;
        score += stack.demographics.primaryGoals.filter((goal: string) => userGoals.includes(goal)).length;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = stack;
      }
    }
    return bestMatch;
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
    // Use supplementDetails array if available, otherwise fallback to supplement IDs
    const details = cachedStack.supplementDetails || cachedStack.supplementsDetails || [];
    
    // Create supplement info mapping for common supplements
    const supplementInfoMap: { [key: string]: { dosage: string; timing: string; reasoning: string } } = {
      'Pre-Workout Supplement by Legion Pulse': {
        dosage: '1 scoop (21.5g)',
        timing: '15-30 minutes before workout',
        reasoning: 'Clinically dosed pre-workout formula with natural caffeine, citrulline malate, and beta-alanine for enhanced energy, focus, and endurance during training sessions.'
      },
      'Optimum Nutrition Gold Standard 100% Whey Protein Powder - Vanilla': {
        dosage: '1 scoop (30g)',
        timing: 'Post-workout or between meals',
        reasoning: 'High-quality whey protein isolates and concentrates providing 24g of protein per serving to support muscle recovery and growth.'
      },
      'Creatine Monohydrate Powder Micronized by BulkSupplements': {
        dosage: '5g',
        timing: 'Daily, any time',
        reasoning: 'Pure creatine monohydrate to increase muscle power, strength, and size. Most researched supplement for athletic performance.'
      },
      'BCAA Energy Amino Acid Supplement by Cellucor C4': {
        dosage: '1 scoop (7g)',
        timing: 'During or after workout',
        reasoning: 'Essential amino acids (leucine, isoleucine, valine) to prevent muscle breakdown and support recovery during intense training.'
      }
    };

    const processedSupplements = details.map((supplement: any) => {
      const supplementInfo = supplementInfoMap[supplement.name] || {
        dosage: 'As directed',
        timing: 'With meals',
        reasoning: 'Supports overall health and wellness goals'
      };
      
      // Parse price to number for calculation
      let numericPrice = 0;
      if (typeof supplement.price === 'string') {
        numericPrice = parseFloat(supplement.price.replace(/[$,]/g, ''));
      } else if (typeof supplement.price === 'number') {
        numericPrice = supplement.price;
      }
      
      return {
        name: supplement.name,
        dosage: supplement.dosage || supplementInfo.dosage,
        timing: supplement.timing || supplementInfo.timing,
        reasoning: supplement.reasoning || supplementInfo.reasoning,
        affiliateUrl: supplement.affiliateUrl || supplement.amazonUrl,
        commissionRate: 0.08, // 8%
        price: numericPrice,
        imageUrl: supplement.imageUrl,
        brand: supplement.brand,
        amazonProduct: {
          asin: supplement.asin || '',
          rating: supplement.rating,
          reviewCount: supplement.reviewCount,
        },
      };
    });

    // Calculate total monthly cost by summing individual supplement prices
    const totalMonthlyCost = processedSupplements.reduce((total, supplement) => {
      return total + (supplement.price || 0);
    }, 0);

    return {
      id: cachedStack.id || cachedStack.archetypeId,
      name: cachedStack.name,
      supplements: processedSupplements,
      archetype: cachedStack.archetypeId,
      averageRating: cachedStack.averageRating,
      totalReviewCount: cachedStack.totalReviewCount || cachedStack.reviewCount || 0,
      lastUpdated: cachedStack.lastUpdated,
      totalMonthlyCost: totalMonthlyCost
    };
  }

  /**
   * Calculate how well a cached stack matches the user input
   */
  private calculateMatchScore(stack: CachedSupplementStack, input: SupplementAdvisorInput): number {
    let score = 0;
    let maxScore = 0;

    // Budget matching (weight: 35% - HIGHEST PRIORITY)
    maxScore += 35;
    const budgetDiff = Math.abs((input.budget || 100) - stack.totalMonthlyCost);
    if (budgetDiff <= 10) score += 35; // Within $10
    else if (budgetDiff <= 20) score += 25; // Within $20
    else if (budgetDiff <= 40) score += 15; // Within $40
    else if (budgetDiff <= 60) score += 5;  // Within $60
    // If over budget by more than $60, score = 0 for budget

    // Health concerns matching (weight: 25%)
    maxScore += 25;
    const userHealthConcerns = input.healthConcerns || [];
    // This would need to be enhanced with health concern mapping to stacks
    // For now, give partial score if user has specific health concerns
    if (userHealthConcerns.length > 0) {
      score += 15; // Assume some relevance for now
    } else {
      score += 20; // Full score if no specific concerns
    }

    // Goals matching (weight: 20%)
    maxScore += 20;
    const userGoals = Array.isArray(input.fitnessGoals) ? input.fitnessGoals : [input.fitnessGoals];
    // This would require storing goals with the stack for perfect matching
    score += 15; // Simplified for now

    // Age matching (weight: 10%)
    maxScore += 10;
    // Assume reasonable age matching based on stack type
    score += 8;

    // Gender matching (weight: 5%)
    maxScore += 5;
    score += 4; // Assume most stacks work for both genders

    // Activity level matching (weight: 5%)
    maxScore += 5;
    score += 4; // Simplified

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
    console.log('🗑️ Clearing cached stacks...');
    this.cachedStacks = [];
    console.log('✅ Cached stacks cleared. Next request will fetch from Firestore.');
  }
}

export const enhancedAdvisorService = new EnhancedAdvisorService();
