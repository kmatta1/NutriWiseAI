// Revenue-optimized AI service for supplement recommendations
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export interface SupplementStack {
  id: string;
  name: string;
  supplements: {
    name: string;
    dosage: string;
    timing: string;
    reasoning: string;
    affiliateUrl?: string;
    commissionRate?: number;
    price: number;
    imageUrl?: string;
  }[];
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
  fitnessGoals: string[];
  dietaryRestrictions: string[];
  currentSupplements: string[];
  healthConcerns: string[];
  budget: number;
  experienceLevel: string;
  lifestyle: string;
}

export class RevenueOptimizedAI {
  private scientificIndex = pinecone.index('scientific-studies');
  private userOutcomesIndex = pinecone.index('user-outcomes');
  private productIndex = pinecone.index('affiliate-products');

  async generateEvidenceBasedStack(userProfile: UserProfile, isPremium: boolean = false): Promise<SupplementStack> {
    try {
      // 1. Find similar successful users (collaborative filtering)
      const similarUsers = await this.findSimilarSuccessfulUsers(userProfile);
      
      // 2. Get their most effective stacks
      const topPerformingStacks = await this.getTopPerformingStacks(similarUsers);
      
      // 3. Find relevant scientific evidence
      const scientificEvidence = await this.getScientificEvidence(
        topPerformingStacks,
        userProfile.fitnessGoals
      );
      
      // 4. Find high-commission affiliate products
      const affiliateProducts = await this.findOptimalAffiliateProducts(
        topPerformingStacks,
        userProfile.budget
      );
      
      // 5. Generate AI recommendation balancing efficacy and revenue
      const recommendation = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert supplement scientist focused on creating synergistic stacks.
                     
                     PRIORITIES (in order):
                     1. User safety and efficacy
                     2. Scientific evidence backing
                     3. Revenue optimization through affiliate commissions
                     4. User satisfaction and retention
                     
                     Create stacks that work together synergistically, not just individual supplements.
                     Always provide scientific rationale for combinations.
                     Consider timing, dosages, and interactions.
                     Prioritize products with higher commission rates when efficacy is equal.`
          },
          {
            role: "user",
            content: `
              User Profile: ${JSON.stringify(userProfile)}
              
              Similar Successful Users: ${JSON.stringify(similarUsers)}
              
              Top Performing Stacks: ${JSON.stringify(topPerformingStacks)}
              
              Scientific Evidence: ${JSON.stringify(scientificEvidence)}
              
              Affiliate Products: ${JSON.stringify(affiliateProducts)}
              
              Generate a supplement stack that:
              1. Has strong scientific backing for synergistic effects
              2. Matches successful user patterns
              3. Fits within budget: $${userProfile.budget}/month
              4. Maximizes affiliate revenue while maintaining efficacy
              5. Provides clear timeline for results
              
              Format as detailed SupplementStack object with all fields.
            `
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const stack = JSON.parse(recommendation.choices[0].message.content || '{}') as SupplementStack;
      
      // 6. Enhance with persuasive content using Claude
      const enhancedStack = await this.enhanceWithPersuasiveContent(stack, userProfile);
      
      // 7. Add product images to supplements
      const stackWithImages = await this.addProductImages(enhancedStack, isPremium);
      
      // 8. Track for continuous improvement
      await this.trackRecommendation(userProfile, stackWithImages);
      
      return stackWithImages;
      
    } catch (error) {
      console.error('Error generating evidence-based stack:', error);
      throw new Error('Failed to generate supplement recommendation');
    }
  }

  private async findSimilarSuccessfulUsers(userProfile: UserProfile) {
    const profileEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: `${userProfile.age} ${userProfile.gender} ${Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals.join(' ') : userProfile.fitnessGoals || 'general health'} ${userProfile.lifestyle}`
    });

    const similarUsers = await this.userOutcomesIndex.query({
      vector: profileEmbedding.data[0].embedding,
      topK: 50,
      filter: {
        successRate: { $gte: 0.7 }, // Only successful users
        goals: { $in: userProfile.fitnessGoals }
      }
    });

    return similarUsers.matches.map(m => m.metadata);
  }

  private async getTopPerformingStacks(similarUsers: any[]) {
    // Extract stacks from similar users, ranked by success rate
    const stackPerformance = new Map();
    
    similarUsers.forEach(user => {
      user.stacks?.forEach((stack: any) => {
        const key = stack.supplements.map((s: any) => s.name).sort().join('+');
        if (!stackPerformance.has(key)) {
          stackPerformance.set(key, {
            stack,
            users: [],
            totalSuccessRate: 0
          });
        }
        stackPerformance.get(key).users.push(user);
        stackPerformance.get(key).totalSuccessRate += user.successRate;
      });
    });

    // Return top 10 performing stacks
    return Array.from(stackPerformance.values())
      .sort((a, b) => b.totalSuccessRate - a.totalSuccessRate)
      .slice(0, 10);
  }

  private async getScientificEvidence(stacks: any[], goals: string[]) {
    const supplements = [...new Set(stacks.flatMap(s => s.stack.supplements.map((sup: any) => sup.name)))];
    
    // Search for studies on these supplement combinations
    const evidenceQueries = supplements.map(async (supplement) => {
      const query = `${supplement} efficacy ${goals.join(' ')} clinical trial`;
      const queryEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: query
      });

      return this.scientificIndex.query({
        vector: queryEmbedding.data[0].embedding,
        topK: 5,
        filter: {
          studyType: { $in: ['RCT', 'meta-analysis', 'systematic-review'] },
          qualityScore: { $gte: 7 }
        }
      });
    });

    const evidenceResults = await Promise.all(evidenceQueries);
    return evidenceResults.flatMap(r => r.matches.map(m => m.metadata));
  }

  private async findOptimalAffiliateProducts(stacks: any[], budget: number) {
    const supplements = [...new Set(stacks.flatMap(s => s.stack.supplements.map((sup: any) => sup.name)))];
    
    const productQueries = supplements.map(async (supplement) => {
      const queryEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: supplement
      });

      return this.productIndex.query({
        vector: queryEmbedding.data[0].embedding,
        topK: 10,
        filter: {
          price: { $lte: budget * 0.4 }, // Max 40% of budget per supplement
          rating: { $gte: 4.0 },
          commissionRate: { $gte: 0.05 } // Minimum 5% commission
        }
      });
    });

    const productResults = await Promise.all(productQueries);
    
    // Sort by commission rate * user rating for revenue optimization
    return productResults.flatMap(r => r.matches.map(m => m.metadata))
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const aScore = (Number(a.commissionRate) || 0) * (Number(a.rating) || 0);
        const bScore = (Number(b.commissionRate) || 0) * (Number(b.rating) || 0);
        return bScore - aScore;
      });
  }

  private async enhanceWithPersuasiveContent(stack: SupplementStack, userProfile: UserProfile) {
    const persuasiveContent = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a health and wellness expert writing compelling, evidence-based content.
                   
                   Create persuasive but accurate descriptions for this supplement stack:
                   ${JSON.stringify(stack)}
                   
                   For user profile: ${JSON.stringify(userProfile)}
                   
                   Focus on:
                   1. How supplements work together synergistically
                   2. Timeline for expected results
                   3. Why this combination beats individual supplements
                   4. Success stories from similar users
                   5. Scientific backing without being overly technical
                   
                   Make it compelling but honest. Avoid unrealistic claims.
                   Include specific benefits relevant to their goals.`
        }
      ]
    });

    return {
      ...stack,
      persuasiveDescription: persuasiveContent.content[0].type === 'text' ? persuasiveContent.content[0].text : 'Enhanced description available',
      enhancedAt: new Date().toISOString()
    };
  }

  private async trackRecommendation(userProfile: UserProfile, stack: SupplementStack) {
    // Track recommendation for continuous improvement
    const trackingData = {
      stackId: stack.id,
      timestamp: new Date().toISOString(),
      userProfile: userProfile,
      estimatedRevenue: stack.estimatedCommission,
      conversionProbability: await this.calculateConversionProbability(userProfile, stack)
    };

    // Store for analytics and improvement
    console.log('Tracking recommendation:', trackingData);
  }

  private async calculateConversionProbability(userProfile: UserProfile, stack: SupplementStack) {
    // Simple conversion probability based on price sensitivity and past data
    const priceRatio = stack.totalMonthlyCost / userProfile.budget;
    const evidenceScore = stack.evidenceScore / 10;
    const successScore = stack.userSuccessRate;
    
    return (evidenceScore * 0.4) + (successScore * 0.4) + ((1 - priceRatio) * 0.2);
  }

  private async addProductImages(stack: SupplementStack, isPremium: boolean = false): Promise<SupplementStack> {
    try {
      // Generate product images for each supplement
      const supplementsWithImages = await Promise.all(
        stack.supplements.map(async (supplement) => {
          if (isPremium) {
            // For premium users, try to get real product images
            const realProductImage = this.getRealProductImage(supplement.name);
            if (realProductImage) {
              return {
                ...supplement,
                imageUrl: realProductImage
              };
            }
          }
          
          // For non-premium users or when real product image is not available,
          // use generic supplement type images
          const genericImage = this.getGenericSupplementImage(supplement.name);
          
          return {
            ...supplement,
            imageUrl: genericImage
          };
        })
      );

      return {
        ...stack,
        supplements: supplementsWithImages
      };
    } catch (error) {
      console.error('Error adding product images:', error);
      // Return original stack if image generation fails
      return stack;
    }
  }

  private getRealProductImage(supplementName: string): string | null {
    // Map supplement names to placeholder images until we have working Amazon URLs
    const productMap: { [key: string]: string } = {
      'Whey Protein Isolate': 'https://via.placeholder.com/300x300/4f46e5/white?text=Whey+Protein',
      'Creatine Monohydrate': 'https://via.placeholder.com/300x300/ef4444/white?text=Creatine',
      'Magnesium Glycinate': 'https://via.placeholder.com/300x300/10b981/white?text=Magnesium',
      'Beta-Alanine': 'https://via.placeholder.com/300x300/f59e0b/white?text=Beta-Alanine',
      'Zinc Bisglycinate': 'https://via.placeholder.com/300x300/8b5cf6/white?text=Zinc'
    };

    // Try exact match first
    if (productMap[supplementName]) {
      return productMap[supplementName];
    }

    // Try partial matches
    const lowerName = supplementName.toLowerCase();
    for (const [key, value] of Object.entries(productMap)) {
      if (lowerName.includes(key.toLowerCase().split(' ')[0])) {
        return value;
      }
    }

    return null;
  }

  private getGenericSupplementImage(supplementName: string): string {
    // Map supplement names to generic supplement type images
    const lowerName = supplementName.toLowerCase();
    if (lowerName.includes('protein') || lowerName.includes('whey')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Qcm90ZWluPC90ZXh0Pgo8L3N2Zz4K";
    } else if (lowerName.includes('creatine')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5DcmVhdGluZTwvdGV4dD4KPHN2Zz4K";
    } else if (lowerName.includes('magnesium') || lowerName.includes('vitamin')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5WaXRhbWluczwvdGV4dD4KPHN2Zz4K";
    } else if (lowerName.includes('omega') || lowerName.includes('fish oil')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5GaXNoIE9pbDwvdGV4dD4KPHN2Zz4K";
    } else if (lowerName.includes('pre-workout') || lowerName.includes('beta-alanine')) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5QcmUgV29ya291dDwvdGV4dD4KPHN2Zz4K";
    } else {
      // Default supplement bottle image
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5TdXBwbGVtZW50PC90ZXh0Pgo8L3N2Zz4K";
    }
  }
}

export const revenueOptimizedAI = new RevenueOptimizedAI();
