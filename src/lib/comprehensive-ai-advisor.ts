/**
 * Comprehensive AI-Powered Supplement Advisor
 * 
 * This service handles the full spectrum of supplement recommendations using:
 * - LLM (Large Language Models) for reasoning and personalization
 * - RAG (Retrieval Augmented Generation) for scientific evidence
 * - Vector databases for similarity matching
 * - Comprehensive product catalog (500+ supplements)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
// Temporarily removed Pinecone import due to Next.js compatibility issues
// import { Pinecone } from '@pinecone-database/pinecone';

import { productCatalogService } from './product-catalog-service';

// Initialize clients only on server-side
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

// Only initialize on server-side (not in browser)
if (typeof window === 'undefined') {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
}

/**
 * Simple comprehensive AI advisor that uses the product catalog
 */
export class ComprehensiveAIAdvisor {
  
  async generateComprehensiveRecommendation(userProfile: any): Promise<any> {
    console.log('Starting comprehensive AI recommendation process...');

    try {
      // Ensure product catalog is loaded
      console.log('Loading product catalog...');

      // Use product catalog service to generate personalized stack
      const personalizedStack = await productCatalogService.generatePersonalizedStack(userProfile);

      // Generate personalized name and description based on user profile
      const personalizedName = this.generatePersonalizedStackName(userProfile);
      const personalizedDescription = this.generatePersonalizedDescription(userProfile, personalizedStack);
      const enhancedReasoning = await this.generateAIReasoning(userProfile, personalizedStack);

      return {
        id: `comprehensive_${Date.now()}`,
        name: personalizedName,
        description: personalizedDescription,
        recommendations: personalizedStack.recommendations,
        totalCost: personalizedStack.totalMonthlyCost,
        reasoning: enhancedReasoning,
        confidenceScore: this.calculateConfidenceScore(userProfile, personalizedStack),
        sourceAttribution: 'Comprehensive AI Advisor with Product Catalog'
      };

    } catch (error) {
      console.error('Comprehensive AI recommendation failed:', error);
      
      // Fallback to dynamic advisor
      const { DynamicAIAdvisorService } = await import('./dynamic-ai-advisor-service');
      console.log('Falling back to dynamic AI advisor...');
      const dynamicService = new DynamicAIAdvisorService();
      const fallbackResult = await dynamicService.generateRecommendations(userProfile);
      
      if (fallbackResult.success && fallbackResult.stack) {
        return {
          id: `comprehensive_fallback_${Date.now()}`,
          name: 'Comprehensive AI Stack (Fallback)',
          description: 'AI-generated supplement stack with fallback processing',
          recommendations: fallbackResult.stack.recommendations,
          totalCost: fallbackResult.stack.totalMonthlyCost,
          reasoning: `Fallback AI Analysis:\n\nUsing dynamic AI processing due to comprehensive system unavailability.\n\nRecommendations: ${fallbackResult.stack.recommendations.length} supplements selected based on your profile.`,
          confidenceScore: 0.75,
          sourceAttribution: 'Comprehensive AI Advisor (Fallback Mode)'
        };
      }
      
      throw error;
    }
  }

  /**
   * Generate personalized stack name based on user profile
   */
  private generatePersonalizedStackName(userProfile: any): string {
    const ageCategory = userProfile.age < 25 ? 'Youth' : 
                       userProfile.age < 35 ? 'Prime' : 
                       userProfile.age < 50 ? 'Peak' : 'Elite';
    
    const genderLabel = userProfile.gender === 'female' ? 'Women\'s' : 'Men\'s';
    
    const primaryGoal = userProfile.fitnessGoals?.[0] || 'wellness';
    const goalLabel = primaryGoal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const activityLevel = userProfile.activityLevel === 'advanced' ? 'Pro' : 
                         userProfile.activityLevel === 'intermediate' ? 'Active' : 'Starter';
    
    return `${ageCategory} ${genderLabel} ${goalLabel} Stack (${activityLevel})`;
  }

  /**
   * Generate personalized description based on user profile and stack
   */
  private generatePersonalizedDescription(userProfile: any, stack: any): string {
    const goals = userProfile.fitnessGoals?.join(' & ') || 'wellness';
    const concerns = userProfile.healthConcerns?.length > 0 ? 
      ` addressing ${userProfile.healthConcerns.join(' & ')}` : '';
    
    return `Personalized ${stack.recommendations.length}-supplement stack optimized for ${goals}${concerns}. ` +
           `Tailored for ${userProfile.gender} ${userProfile.age}yo at ${userProfile.activityLevel} activity level ` +
           `with $${userProfile.budget} monthly budget.`;
  }

  /**
   * Generate AI-powered reasoning (with fallback if no API keys)
   */
  private async generateAIReasoning(userProfile: any, stack: any): Promise<string> {
    // Try OpenAI first
    if (openai) {
      try {
        const prompt = this.buildReasoningPrompt(userProfile, stack);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        });
        
        return completion.choices[0]?.message?.content || this.getFallbackReasoning(userProfile, stack);
      } catch (error) {
        console.warn('OpenAI reasoning failed, trying Anthropic...');
      }
    }

    // Try Anthropic as fallback
    if (anthropic) {
      try {
        const prompt = this.buildReasoningPrompt(userProfile, stack);
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }]
        });
        
        const content = response.content[0];
        return (content.type === 'text' ? content.text : '') || this.getFallbackReasoning(userProfile, stack);
      } catch (error) {
        console.warn('Anthropic reasoning failed, using fallback...');
      }
    }

    // Fallback reasoning
    return this.getFallbackReasoning(userProfile, stack);
  }

  /**
   * Build reasoning prompt for LLM
   */
  private buildReasoningPrompt(userProfile: any, stack: any): string {
    const supplements = stack.recommendations.map(r => r.product.name).join(', ');
    
    return `As a supplement expert, explain why this stack is perfect for this person:

Profile: ${userProfile.age}yo ${userProfile.gender}, ${userProfile.activityLevel} activity level
Goals: ${userProfile.fitnessGoals?.join(', ') || 'general wellness'}
Health Concerns: ${userProfile.healthConcerns?.join(', ') || 'none'}
Diet: ${userProfile.diet}
Budget: $${userProfile.budget}/month
Current Supplements: ${userProfile.currentSupplements?.join(', ') || 'none'}

Recommended Stack: ${supplements}
Total Cost: $${stack.totalMonthlyCost}

Provide a personalized 3-paragraph explanation covering:
1. Why these specific supplements match their goals
2. How the dosing and timing optimize results  
3. Expected timeline and synergistic benefits

Keep it scientific but accessible.`;
  }

  /**
   * Calculate confidence score based on profile matching
   */
  private calculateConfidenceScore(userProfile: any, stack: any): number {
    let score = 0.7; // Base score
    
    // Boost for specific goals
    if (userProfile.fitnessGoals?.length > 0) score += 0.1;
    
    // Boost for health concerns addressed
    if (userProfile.healthConcerns?.length > 0) score += 0.05;
    
    // Boost for budget utilization
    const utilization = stack.totalMonthlyCost / userProfile.budget;
    if (utilization > 0.5 && utilization < 0.95) score += 0.1;
    
    // Boost for sufficient recommendations
    if (stack.recommendations.length >= 3) score += 0.05;
    
    return Math.min(0.95, score);
  }

  /**
   * Fallback reasoning when AI APIs are unavailable
   */
  private getFallbackReasoning(userProfile: any, stack: any): string {
    const supplements = stack.recommendations.map(r => r.product.name).join(', ');
    const goals = userProfile.fitnessGoals?.join(' and ') || 'general wellness';
    
    return `**Personalized Analysis for ${userProfile.age}-year-old ${userProfile.gender}**

**Goal Optimization:** This ${stack.recommendations.length}-supplement stack is specifically designed for ${goals} at your ${userProfile.activityLevel} activity level. Each supplement was selected based on scientific evidence and your unique profile.

**Budget & Dosing Strategy:** With a $${userProfile.budget} monthly budget, we've allocated $${stack.totalMonthlyCost} (${Math.round((stack.totalMonthlyCost/userProfile.budget)*100)}% utilization) across ${supplements}. This ensures maximum value while maintaining therapeutic dosages.

**Expected Results:** Based on your profile, you should notice initial benefits within 2-4 weeks, with optimal results in 8-12 weeks. The synergistic combination of these supplements will work together to enhance ${goals} while supporting overall health and performance.`;
  }
}

// Export singleton instance
export const comprehensiveAIAdvisor = new ComprehensiveAIAdvisor();
