import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { sampleStudies, sampleUserOutcomes, sampleAffiliateProducts } from './sample-data';
import { workingAmazonService } from './working-amazon-service';

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
    brand?: string;
    // Enhanced Amazon integration
    amazonProduct?: {
      asin: string;
      rating: number;
      reviewCount: number;
      primeEligible: boolean;
      qualityScore: number;
      alternatives?: {
        bestValue: any;
        premium: any;
        budget: any;
      };
      qualityFactors?: {
        thirdPartyTested: boolean;
        gmpCertified: boolean;
        organicCertified: boolean;
        allergenFree: boolean;
        bioavailableForm: boolean;
      };
    };
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
  userId?: string;
  age: number;
  gender: string;
  fitnessGoals: string[];
  dietaryRestrictions: string[];
  currentSupplements: string[];
  healthConcerns: string[];
  budget: number;
  experienceLevel: string;
  lifestyle: string;
  activityLevel: string;
  diet: string;
  sleepQuality: string;
  otherCriteria?: string;
  race?: string;
  weight?: number;
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// Temporarily disabled for debugging
// const amazonService = new AmazonIntegrationService();

export class FallbackAI {
  async generateEvidenceBasedStack(userProfile: UserProfile, isPremium: boolean = false): Promise<SupplementStack> {
    try {
      console.log(`🎯 generateEvidenceBasedStack called with isPremium: ${isPremium}`);
      console.log(`🤖 OpenAI available: ${!!openai}`);
      
      if (openai) {
        // Use OpenAI for enhanced recommendations
        const relevantStudies = this.findRelevantStudies(userProfile);
        const similarUsers = this.findSimilarUsers(userProfile);
        const availableProducts = this.findRelevantProducts(userProfile);

        const recommendation = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert supplement scientist creating synergistic stacks.
                       
                       FOCUS ON:
                       1. Supplements that work together (synergy)
                       2. Scientific evidence backing
                       3. User safety and realistic expectations
                       4. Cost-effectiveness within budget
                       
                       Create a JSON response with the exact SupplementStack structure.`
            },
            {
              role: "user",
              content: `
                Create a SCIENTIFICALLY-BACKED supplement stack for this user:
                
                User Profile:
                - Age: ${userProfile.age} years
                - Gender: ${userProfile.gender}
                - Race/Ethnicity: ${userProfile.race || 'Not specified'}
                - Fitness Goals: ${Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals.join(', ') : userProfile.fitnessGoals || 'General health'}
                - Activity Level: ${userProfile.activityLevel || userProfile.experienceLevel}
                - Diet Type: ${userProfile.diet || 'Not specified'}
                - Sleep Quality: ${userProfile.sleepQuality || 'Not specified'}
                - Weight: ${userProfile.weight}kg
                - Budget: $${userProfile.budget}/month
                - Health Concerns: ${Array.isArray(userProfile.healthConcerns) ? userProfile.healthConcerns.join(', ') : 'None specified'}
                - Current Supplements: ${Array.isArray(userProfile.currentSupplements) ? userProfile.currentSupplements.join(', ') : 'None'}
                - Other Criteria: ${userProfile.otherCriteria || 'None'}
                
                Available Products: ${JSON.stringify(availableProducts.slice(0, 3))}
                
                Relevant Studies: ${JSON.stringify(relevantStudies.slice(0, 2))}
                
                Similar User Outcomes: ${JSON.stringify(similarUsers.slice(0, 2))}
                
                Requirements:
                1. Consider age-specific needs (younger vs older nutritional requirements)
                2. Gender-specific considerations (iron, calcium, hormones)
                3. Race/ethnicity considerations (vitamin D, lactose tolerance, genetic variations)
                4. Activity level matching (sedentary vs athlete needs)
                5. Diet-specific needs (vegan, keto, restrictions)
                6. Sleep quality considerations (magnesium, melatonin support)
                7. Health concern targeting (joint pain, energy, stress management)
                8. Synergistic combinations that enhance each other
                9. Proper dosing and timing for maximum bioavailability
                10. Stay within budget constraints
                
                IMPORTANT: Base recommendations on REAL scientific evidence and user demographics.
                
                Return as JSON with this exact structure:
                {
                  "id": "stack_[random_id]",
                  "name": "Descriptive Stack Name",
                  "supplements": [
                    {
                      "name": "supplement name",
                      "dosage": "specific dosage",
                      "timing": "when to take",
                      "reasoning": "why this supplement and dosage",
                      "price": 0,
                      "affiliateUrl": null
                    }
                  ],
                  "totalMonthlyCost": 0,
                  "estimatedCommission": 0,
                  "evidenceScore": 0,
                  "userSuccessRate": 0,
                  "timeline": "expected_results_timeline",
                  "synergies": ["synergy1", "synergy2"],
                  "contraindications": ["warning1", "warning2"],
                  "scientificBacking": {
                    "studyCount": 0,
                    "qualityScore": 0,
                    "citations": ["citation1", "citation2"]
                  }
                }`
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        });

        const content = recommendation.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content received from OpenAI');
        }

        const stack = JSON.parse(content);
        
        // Enhance with persuasive content
        const enhancedStack = await this.enhanceWithContent(stack, userProfile);
        
        // Add appropriate images based on premium status
        const stackWithImages = await this.addProductImages(enhancedStack, isPremium);
        
        return stackWithImages;
      } else {
        // Return fallback stack if OpenAI is not available
        console.log('OpenAI not available, using fallback stack');
        return await this.getFallbackStack(isPremium);
      }

    } catch (error) {
      console.error('Error generating stack:', error);
      
      // Return fallback stack if AI fails
      return await this.getFallbackStack(isPremium);
    }
  }

  async generateChatResponse(message: string, context?: string): Promise<string> {
    try {
      if (openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are NutriWise AI, a helpful supplement advisor. ${context ? `Context: ${context}` : ''}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
      } else {
        // Simple fallback responses
        const fallbackResponses = [
          "Thank you for your question! I'm here to help you with supplement advice.",
          "That's a great question about nutrition and supplements. Let me help you with that.",
          "I understand you're looking for guidance on supplements. Here's what I can suggest...",
          "Based on your inquiry, I'd be happy to provide some supplement recommendations."
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }
    } catch (error) {
      console.error('Error generating chat response:', error);
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
    }
  }

  private findRelevantStudies(userProfile: UserProfile) {
    // Simple keyword matching for development
    const keywords = [...userProfile.fitnessGoals, userProfile.lifestyle];
    return sampleStudies.filter(study => 
      keywords.some(keyword => 
        study.outcomes.some(outcome => outcome.toLowerCase().includes(keyword.toLowerCase()))
      )
    ).slice(0, 3);
  }

  private findSimilarUsers(userProfile: UserProfile) {
    // Simple similarity based on age and goals
    return sampleUserOutcomes.filter(user => 
      Math.abs(user.demographics.age - userProfile.age) < 10 &&
      user.demographics.goals.some((goal: string) => userProfile.fitnessGoals.includes(goal))
    ).slice(0, 2);
  }

  private findRelevantProducts(userProfile: UserProfile) {
    // Filter products by budget
    return sampleAffiliateProducts.filter(product => 
      product.price <= userProfile.budget * 0.4
    ).slice(0, 5);
  }

  private async enhanceWithContent(stack: SupplementStack, userProfile: UserProfile) {
    try {
      if (anthropic) {
        const persuasiveContent = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `Write a persuasive description for this supplement stack: ${stack.name}. 
                       Focus on the benefits for someone with goals: ${Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals.join(', ') : userProfile.fitnessGoals || 'general health'}.
                       Keep it under 100 words and focus on results and scientific backing.`
            }
          ]
        });

        return {
          ...stack,
          persuasiveDescription: persuasiveContent.content[0].type === 'text' ? persuasiveContent.content[0].text : '',
          enhancedAt: new Date().toISOString()
        };
      } else {
        // Return original stack if Anthropic is not available
        return stack;
      }
    } catch (error) {
      console.error('Error enhancing with content:', error);
      return stack;
    }
  }

  private async getFallbackStack(isPremium: boolean = false): Promise<SupplementStack> {
    console.log('🔥 Using fallback stack generator.');
    const basicStack: SupplementStack = {
      id: `fallback_${new Date().getTime()}`,
      name: 'Essential Wellness Stack',
      supplements: [
        { name: 'Vitamin D3', dosage: '2000 IU', timing: 'With breakfast', reasoning: 'Supports immune function and bone health.', price: 12.99, brand: 'NOW Foods' },
        { name: 'Omega-3 Fish Oil', dosage: '1000mg EPA+DHA', timing: 'With any meal', reasoning: 'Reduces inflammation and supports cardiovascular health.', price: 25.99, brand: 'Nordic Naturals' },
        { name: 'Magnesium Glycinate', dosage: '200mg', timing: 'Before bedtime', reasoning: 'Improves sleep quality and reduces muscle tension.', price: 18.99, brand: "Doctor's Best" },
      ],
      totalMonthlyCost: 57.97,
      estimatedCommission: 4.64,
      evidenceScore: 8,
      userSuccessRate: 88,
      timeline: 'Initial benefits within 4-6 weeks, full effects in 3 months.',
      synergies: ['Vitamin D3 and Omega-3 for enhanced absorption and anti-inflammatory effects.'],
      contraindications: ['Consult a doctor if you are on blood thinners before taking Omega-3.'],
      scientificBacking: {
        studyCount: 150,
        qualityScore: 9,
        citations: [
          'https://pubmed.ncbi.nlm.nih.gov/28768407/',
          'https://pubmed.ncbi.nlm.nih.gov/29080614/'
        ]
      }
    };

    // Add images to the fallback stack
    const stackWithImages = await this.addProductImages(basicStack, isPremium);
    return stackWithImages;
  }

  private async addProductImages(stack: SupplementStack, isPremium: boolean = false): Promise<SupplementStack> {
    console.log(`🖼️ [Image Service] Fetching product images for ${stack.supplements.length} supplements. Premium: ${isPremium}`);

    const supplementsWithImages = await Promise.all(stack.supplements.map(async (supplement) => {
      // Use the centralized workingAmazonService to get product data
      const amazonProduct = workingAmazonService.getRealProduct(supplement.name);

      if (amazonProduct && amazonProduct.imageUrl) {
        // If a real product is found, use its data
        console.log(`[Image Service] ✅ Found real Amazon image for: ${supplement.name}`);
        return {
          ...supplement,
          imageUrl: amazonProduct.imageUrl,
          affiliateUrl: amazonProduct.affiliateUrl,
          brand: amazonProduct.brand,
          amazonProduct: {
            asin: amazonProduct.asin,
            rating: amazonProduct.rating,
            reviewCount: amazonProduct.reviewCount,
            primeEligible: amazonProduct.primeEligible,
            qualityScore: 0.9, // Placeholder
            qualityFactors: {
              thirdPartyTested: true,
              gmpCertified: true,
              organicCertified: false,
              allergenFree: true,
              bioavailableForm: true,
            },
          },
        };
      } else {
        // Fallback for supplements not in our working service
        console.log(`[Image Service] ❌ No real image for: ${supplement.name}. Using placeholder.`);
        return {
          ...supplement,
          imageUrl: `https://placehold.co/100x100.png?text=${supplement.name.split(' ').map(w => w[0]).join('')}`,
          brand: this.getBrandForSupplement(supplement.name),
        };
      }
    }));

    return {
      ...stack,
      supplements: supplementsWithImages,
    };
  }

  private getBrandForSupplement(supplementName: string): string {
    const brandMapping: { [key: string]: string } = {
      // Omega-3 & Fish Oil
      'Omega 3 Fish Oil': 'Nordic Naturals',
      'Omega-3 Fish Oil': 'Nordic Naturals', 
      'Fish Oil': 'Nordic Naturals',
      
      // Magnesium
      'Magnesium Glycinate': "Doctor's Best",
      'Magnesium': "Doctor's Best",
      
      // Creatine
      'Creatine Monohydrate': 'Optimum Nutrition',
      'Creatine': 'Optimum Nutrition',
      
      // Whey Protein
      'Whey Protein Isolate': 'Dymatize',
      'Whey Protein': 'Dymatize',
      
      // Energy
      'CoQ10 Ubiquinol': 'Qunol',
      'CoQ10': 'Qunol',
      
      // Cognitive
      'Lions Mane Mushroom': 'Host Defense',
      "Lion's Mane": 'Host Defense',
      
      // Minerals
      'Zinc Bisglycinate': 'Thorne',
      'Zinc': 'Thorne',
      'Iron Bisglycinate': 'Thorne',
      'Iron': 'Thorne',
      
      // B Vitamins
      'B12 Methylcobalamin': 'Thorne',
      'B12': 'Thorne',
      
      // Default fallback
      'Vitamin D3': 'NOW Foods',
      'Probiotics': 'Garden of Life',
      'Multivitamin': 'Garden of Life'
    };

    return brandMapping[supplementName] || 'Premium Brand';
  }

}

export const fallbackAI = new FallbackAI();
