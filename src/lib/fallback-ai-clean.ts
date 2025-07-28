// Clean Fallback AI Service - Evidence-Based Version
// Ultra-simple fallback using evidence-based science without external dependencies

import { EvidenceBasedAI } from './evidence-based-ai-service';

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
  userId?: string;
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

export class FallbackAIClean {
  private evidenceBasedAI = new EvidenceBasedAI();

  async generateEvidenceBasedStack(userProfile: UserProfile): Promise<SupplementStack> {
    try {
      console.log('Clean Fallback AI: Using evidence-based system');
      
      // Direct evidence-based AI call
      const stack = await this.evidenceBasedAI.generateEvidenceBasedStack(userProfile);
      
      console.log(`Clean Fallback: Success - ${stack.supplements.length} supplements, $${stack.totalMonthlyCost}`);
      
      return stack;
      
    } catch (error) {
      console.error('Clean Fallback AI error:', error);
      throw error;
    }
  }
}

export const fallbackAIClean = new FallbackAIClean();

export class FallbackAI {
  async generateEvidenceBasedStack(userProfile: UserProfile): Promise<SupplementStack> {
    try {
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
                Create a supplement stack for this user:
                
                User Profile:
                - Age: ${userProfile.age}
                - Gender: ${userProfile.gender}
                - Goals: ${userProfile.fitnessGoals.join(', ')}
                - Budget: $${userProfile.budget}
                - Health concerns: ${userProfile.healthConcerns.join(', ')}
                - Experience: ${userProfile.experienceLevel}
                - Lifestyle: ${userProfile.lifestyle}
                
                Available Products: ${JSON.stringify(availableProducts.slice(0, 3))}
                
                Relevant Studies: ${JSON.stringify(relevantStudies.slice(0, 2))}
                
                Similar User Outcomes: ${JSON.stringify(similarUsers.slice(0, 2))}
                
                Requirements:
                1. Max 3-5 supplements that work synergistically
                2. Stay within budget
                3. Includes specific dosages and timing
                4. Provides scientific rationale
                5. Estimates timeline for results
                
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
        
        return enhancedStack;
      } else {
        // Return fallback stack if OpenAI is not available
        console.log('OpenAI not available, using fallback stack');
        return this.getFallbackStack(userProfile);
      }

    } catch (error) {
      console.error('Error generating stack:', error);
      
      // Return fallback stack if AI fails
      return this.getFallbackStack(userProfile);
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
                       Focus on the benefits for someone with goals: ${userProfile.fitnessGoals.join(', ')}.
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

  private getFallbackStack(userProfile: UserProfile): SupplementStack {
    // Basic fallback stack based on common recommendations
    const baseSupplements = [
      {
        name: "Whey Protein Isolate",
        dosage: "25g",
        timing: "Post-workout",
        reasoning: "High-quality protein for muscle protein synthesis and recovery",
        price: 54.99,
        affiliateUrl: "https://example.com/whey-protein"
      },
      {
        name: "Creatine Monohydrate",
        dosage: "5g",
        timing: "Daily, any time",
        reasoning: "Proven to increase power output and muscle volumization",
        price: 29.99,
        affiliateUrl: "https://example.com/creatine"
      },
      {
        name: "Magnesium Glycinate",
        dosage: "400mg",
        timing: "Before bed",
        reasoning: "Supports sleep quality and muscle relaxation",
        price: 19.99,
        affiliateUrl: "https://example.com/magnesium"
      }
    ];

    const totalCost = baseSupplements.reduce((sum, sup) => sum + sup.price, 0);

    return {
      id: `fallback_${Date.now()}`,
      name: "Essential Foundation Stack",
      supplements: baseSupplements,
      totalMonthlyCost: totalCost,
      estimatedCommission: totalCost * 0.1,
      evidenceScore: 8.5,
      userSuccessRate: 0.85,
      timeline: "4-6 weeks for noticeable results",
      synergies: [
        "Protein and creatine work together for muscle growth",
        "Magnesium improves sleep quality for better recovery"
      ],
      contraindications: [
        "Consult doctor if you have kidney issues before taking creatine",
        "Start with lower magnesium dose if you experience digestive issues"
      ],
      scientificBacking: {
        studyCount: 150,
        qualityScore: 9.2,
        citations: [
          "Kreider et al. (2023). International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation.",
          "Devries & Phillips (2015). Supplemental protein in support of muscle mass and health."
        ]
      }
    };
  }
}
