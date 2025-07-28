// Fallback AI Service - Evidence-Based Version
// Simplified fallback that uses our evidence-based AI without external dependencies

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
  activityLevel?: string;
  diet?: string;
  sleepQuality?: string;
  otherCriteria?: string;
  race?: string;
  weight?: number;
}

export class FallbackAI {
  private evidenceBasedAI = new EvidenceBasedAI();

  async generateEvidenceBasedStack(userProfile: UserProfile): Promise<SupplementStack> {
    try {
      console.log('Fallback AI: Using evidence-based supplement selection');
      console.log(`Goals: ${Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals.join(', ') : userProfile.fitnessGoals}`);
      
      // Use our evidence-based AI service
      const stack = await this.evidenceBasedAI.generateEvidenceBasedStack(userProfile);
      
      console.log(`Fallback AI: Generated ${stack.supplements.length} supplement stack`);
      console.log(`Evidence score: ${stack.evidenceScore}%, Success rate: ${stack.userSuccessRate}%`);
      
      return stack;
      
    } catch (error) {
      console.error('Fallback AI error:', error);
      
      // Ultimate fallback with basic muscle building stack
      return this.getBasicMuscleStack(userProfile);
    }
  }

  private getBasicMuscleStack(userProfile: UserProfile): SupplementStack {
    // Basic fallback with proven muscle building essentials
    return {
      id: `fallback_${Date.now()}`,
      name: 'Basic Muscle Building Stack',
      description: 'Essential supplements for muscle building with scientific backing',
      supplements: [
        {
          id: 'whey-protein-optimum',
          name: 'Optimum Nutrition Gold Standard 100% Whey Protein Powder - Vanilla',
          brand: 'Optimum Nutrition',
          category: 'protein',
          dosage: '1 scoop (30g)',
          timing: 'Post-workout',
          reasoning: 'High-quality complete protein providing all essential amino acids for muscle protein synthesis. 24g protein per serving with optimal leucine content.',
          price: 54.99,
          amazonUrl: 'https://www.amazon.com/dp/B000QSNYGI',
          affiliateUrl: 'https://www.amazon.com/dp/B000QSNYGI?tag=nutriwiseai-20',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/product-images%2Foptimum-nutrition-gold-standard-100-whey-protein-powder-vanilla.jpg?alt=media',
          asin: 'B000QSNYGI',
          rating: 4.5,
          reviewCount: 50000,
          isAvailable: true,
          primeEligible: true,
          evidenceLevel: 'very_high',
          studyCount: 127
        },
        {
          id: 'creatine-monohydrate',
          name: 'Pure Micronized Creatine Monohydrate Powder',
          brand: 'BulkSupplements',
          category: 'performance',
          dosage: '5g',
          timing: 'Post-workout or anytime',
          reasoning: 'Most researched supplement for strength and power. Increases muscle phosphocreatine stores enabling greater power output.',
          price: 27.99,
          amazonUrl: 'https://www.amazon.com/dp/B00E9M4XEE',
          affiliateUrl: 'https://www.amazon.com/dp/B00E9M4XEE?tag=nutriwiseai-20',
          imageUrl: 'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/product-images%2Fpure-micronized-creatine-monohydrate-powder.jpg?alt=media',
          asin: 'B00E9M4XEE',
          rating: 4.6,
          reviewCount: 25000,
          isAvailable: true,
          primeEligible: true,
          evidenceLevel: 'very_high',
          studyCount: 500
        }
      ],
      userProfile: {
        age: userProfile.age,
        gender: userProfile.gender,
        fitnessGoals: Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals : [userProfile.fitnessGoals],
        budget: userProfile.budget,
        dietaryRestrictions: userProfile.dietaryRestrictions || [],
        currentSupplements: userProfile.currentSupplements || []
      },
      totalMonthlyCost: 82.98,
      estimatedCommission: 6.64,
      evidenceScore: 95,
      userSuccessRate: 88,
      timeline: 'Initial energy boost: 1-2 weeks, strength gains: 2-4 weeks, muscle growth: 4-8 weeks, optimal results: 8-12 weeks',
      synergies: [
        'Protein + creatine: Enhanced muscle protein synthesis and strength gains (25% greater effect than either alone)'
      ],
      contraindications: [
        'Ensure adequate hydration when using creatine (3-4L water daily)',
        'Not suitable for those with severe lactose intolerance or dairy allergies',
        'Consult healthcare provider before starting, especially if pregnant, nursing, or taking medications'
      ],
      scientificBacking: {
        studyCount: 627,
        qualityScore: 95,
        citations: [
          'https://pubmed.ncbi.nlm.nih.gov/28642676/ - Whey protein and muscle protein synthesis',
          'https://pubmed.ncbi.nlm.nih.gov/28615987/ - Creatine monohydrate for strength and power'
        ]
      }
    };
  }

  private getHealthConcernAnalysis(healthConcerns: string[]): string {
    const concernMap: { [key: string]: string } = {
      'joint-pain': 'Anti-inflammatory, collagen, omega-3 priority',
      'low-energy': 'B-vitamins, iron, CoQ10, mitochondrial support',
      'stress-anxiety': 'Adaptogenic herbs, magnesium, GABA support',
      'poor-digestion': 'Probiotics, digestive enzymes, gut health',
      'focus-memory': 'Nootropics, omega-3, B-vitamins for cognitive health',
      'sleep-issues': 'Magnesium, melatonin, relaxation support'
    };
    
    return healthConcerns.map(concern => concernMap[concern] || concern).join('; ');
  }

  private getBudgetCategory(budget: number): string {
    if (budget < 30) return "Very Limited - Focus on essentials only";
    if (budget < 60) return "Modest - Core supplements prioritized";
    if (budget < 100) return "Moderate - Good foundation possible";
    if (budget < 150) return "Comfortable - Comprehensive stack achievable";
    return "Premium - Advanced optimization possible";
  }

  private getBudgetStrategy(budget: number): string {
    if (budget < 50) {
      return "Focus on 2-3 high-impact supplements: multivitamin, omega-3, one targeted supplement";
    } else if (budget < 100) {
      return "Build foundation: multivitamin, omega-3, protein, 1-2 targeted supplements";
    } else {
      return "Comprehensive approach: foundational supplements + targeted interventions + performance enhancers";
    }
  }

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
              content: `You are Dr. NutriWise, a world-renowned supplement scientist and nutritional biochemist with 20+ years of experience in personalized nutrition. You have published over 200 peer-reviewed studies and have helped over 50,000 individuals optimize their health through evidence-based supplementation.

CORE PRINCIPLES:
1. Evidence-based recommendations backed by peer-reviewed research
2. Personalization based on individual demographics, health status, and lifestyle
3. Safety first - always consider contraindications and interactions
4. Budget optimization - maximum value within financial constraints
5. Synergistic combinations that enhance bioavailability and effectiveness
6. Realistic expectations with clear timelines for results

CRITICAL ANALYSIS FRAMEWORK:
- Age-specific nutritional needs and absorption rates
- Gender-specific hormonal and physiological considerations  
- Race/ethnicity genetic variations affecting supplement metabolism
- Health condition targeting with evidence-based dosing
- Activity level matching for performance and recovery needs
- Diet-specific nutrient gaps and requirements
- Budget-constrained optimization for maximum impact

You must create scientifically sound, personalized supplement stacks that prioritize safety, efficacy, and cost-effectiveness.`
            },
            {
              role: "user",
              content: `
Create a COMPREHENSIVE, EVIDENCE-BASED supplement stack for this individual:

=== USER PROFILE ===
Demographics:
- Age: ${userProfile.age} years (${this.getAgeCategory(userProfile.age)})
- Gender: ${userProfile.gender} (${this.getGenderSpecificNeeds(userProfile.gender)})
- Race/Ethnicity: ${userProfile.race || 'Not specified'} (${this.getRaceSpecificConsiderations(userProfile.race)})
- Weight: ${userProfile.weight || 'Not specified'}kg
- Activity Level: ${userProfile.activityLevel || 'moderate'} (${this.getActivityLevelNeeds(userProfile.activityLevel)})

Health & Lifestyle:
- Primary Goals: ${Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals.join(', ') : userProfile.fitnessGoals || 'General health'}
- Diet Type: ${userProfile.diet || 'Mixed'} (${this.getDietSpecificNeeds(userProfile.diet)})
- Sleep Quality: ${userProfile.sleepQuality || 'Average'}/10 (${this.getSleepQualityImplications(userProfile.sleepQuality)})
- Health Concerns: ${Array.isArray(userProfile.healthConcerns) ? userProfile.healthConcerns.join(', ') : 'None specified'} (${this.getHealthConcernTargeting(userProfile.healthConcerns)})
- Current Supplements: ${Array.isArray(userProfile.currentSupplements) ? userProfile.currentSupplements.join(', ') : 'None'}
- Additional Criteria: ${userProfile.otherCriteria || 'None'}

Budget Constraints:
- Monthly Budget: $${userProfile.budget} USD (${this.getBudgetCategory(userProfile.budget)})
- Budget Allocation Strategy: ${this.getBudgetStrategy(userProfile.budget)}

=== SCIENTIFIC DATA ===
Relevant Research: ${JSON.stringify(relevantStudies.slice(0, 3))}
Similar User Outcomes: ${JSON.stringify(similarUsers.slice(0, 2))}
Available Products: ${JSON.stringify(availableProducts.slice(0, 5))}

=== ANALYSIS REQUIREMENTS ===

1. PERSONALIZED ASSESSMENT:
   - Analyze age-specific metabolic changes and absorption rates
   - Consider gender-specific hormonal needs (iron, calcium, omega-3s)
   - Factor in race/ethnicity genetic variations (vitamin D, B12, folate metabolism)
   - Address specific health concerns with targeted interventions

2. EVIDENCE-BASED SELECTION:
   - Choose supplements with strong scientific backing (minimum 3+ quality studies)
   - Prioritize forms with highest bioavailability (methylfolate vs folic acid, etc.)
   - Consider timing and food interactions for optimal absorption
   - Account for synergistic combinations (vitamin D + K2, magnesium + vitamin D)

3. BUDGET OPTIMIZATION:
   - Stay STRICTLY within $${userProfile.budget} monthly budget
   - Prioritize supplements by impact/cost ratio
   - Suggest high-impact, cost-effective options first
   - Consider subscription savings and bulk pricing

4. SAFETY & INTERACTIONS:
   - Check for contraindications with health conditions
   - Consider potential drug interactions
   - Provide appropriate warnings and precautions
   - Recommend conservative dosing for beginners

5. REALISTIC EXPECTATIONS:
   - Provide evidence-based timelines for expected benefits
   - Explain mechanism of action for each supplement
   - Set realistic expectations based on individual factors

MANDATORY OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure (no additional text):

{
  "id": "stack_${Date.now()}",
  "name": "[Personalized Stack Name based on goals]",
  "supplements": [
    {
      "name": "[Specific supplement name with form]",
      "dosage": "[Evidence-based dosage with units]",
      "timing": "[Optimal timing for absorption]",
      "reasoning": "[Scientific rationale: Why this supplement, this dose, this timing - include study references]",
      "price": [Estimated monthly cost in USD],
      "affiliateUrl": null,
      "bioavailabilityNotes": "[Form-specific absorption notes]",
      "safetyNotes": "[Any warnings or contraindications]"
    }
  ],
  "totalMonthlyCost": [Sum of all supplement costs - MUST be ≤ ${userProfile.budget}],
  "estimatedCommission": [totalMonthlyCost * 0.08],
  "evidenceScore": [0-100 based on research quality],
  "userSuccessRate": [Estimated % based on similar profiles],
  "timeline": "[Realistic expectations: 2-4 weeks for X, 2-3 months for Y]",
  "synergies": ["[Supplement A] + [Supplement B] = [Enhanced effect]"],
  "contraindications": ["[Specific warnings for this user's profile]"],
  "scientificBacking": {
    "studyCount": [Number of supporting studies],
    "qualityScore": [0-100 research quality score],
    "citations": ["[Key study citations with specific findings]"]
  },
  "budgetBreakdown": {
    "highPriority": [Cost of essential supplements],
    "mediumPriority": [Cost of beneficial additions],
    "upgradeOptions": ["[If budget were higher, consider adding...]"]
  },
  "personalizedNotes": "[Specific advice for this individual's unique situation]"
}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        });

        const content = recommendation.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content received from OpenAI');
        }

        const stack = JSON.parse(content);
        
        // Validate and enforce budget constraints
        const budgetValidatedStack = this.validateAndAdjustBudget(stack, userProfile.budget);
        
        // Enhance with persuasive content
        const enhancedStack = await this.enhanceWithContent(budgetValidatedStack, userProfile);
        
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

  private validateAndAdjustBudget(stack: SupplementStack, userBudget: number): SupplementStack {
    // Calculate current total cost
    const currentTotal = stack.supplements.reduce((total, supp) => total + (supp.price || 0), 0);
    
    // If within budget, return as-is
    if (currentTotal <= userBudget) {
      stack.totalMonthlyCost = currentTotal;
      return stack;
    }
    
    console.log(`⚠️ Stack over budget: $${currentTotal} > $${userBudget}. Optimizing...`);
    
    // Sort supplements by priority/value ratio
      const prioritizedSupplements = stack.supplements
      .map(supp => ({
        ...supp,
        valueScore: this.calculateSupplementValue(supp)
      }))
      .sort((a, b) => b.valueScore - a.valueScore);    // Build optimized stack within budget
    const optimizedSupplements = [];
    let runningTotal = 0;
    
    for (const supplement of prioritizedSupplements) {
      if (runningTotal + supplement.price <= userBudget) {
        optimizedSupplements.push(supplement);
        runningTotal += supplement.price;
      }
    }
    
    // Update stack with budget-compliant supplements
    return {
      ...stack,
      supplements: optimizedSupplements,
      totalMonthlyCost: runningTotal,
      name: stack.name + " (Budget Optimized)",
      contraindications: [
        ...stack.contraindications,
        `Optimized to fit $${userBudget} monthly budget`
      ]
    };
  }

  private calculateSupplementValue(supplement: any): number {
    // Base value on price vs expected impact
    const baseValue = 50; // Default value
    const priceWeight = supplement.price > 0 ? 100 / supplement.price : 100;
    
    // Adjust based on supplement type importance
    let importanceMultiplier = 1;
    
    if (supplement.name.toLowerCase().includes('multivitamin')) importanceMultiplier = 1.5;
    if (supplement.name.toLowerCase().includes('omega')) importanceMultiplier = 1.4;
    if (supplement.name.toLowerCase().includes('vitamin d')) importanceMultiplier = 1.3;
    if (supplement.name.toLowerCase().includes('protein')) importanceMultiplier = 1.2;
    
    return baseValue * priceWeight * importanceMultiplier;
  }

  private findRelevantProducts(userProfile: UserProfile) {
    // Enhanced product filtering based on comprehensive user profile
    const maxBudgetPerSupplement = userProfile.budget * 0.3; // Max 30% of budget per supplement
    const minBudgetPerSupplement = userProfile.budget * 0.05; // Min 5% of budget per supplement
    
    return sampleAffiliateProducts.filter(product => {
      // Strict budget filtering
      if (product.price > maxBudgetPerSupplement || product.price < minBudgetPerSupplement) {
        return false;
      }
      
      // Basic filtering by category and goals
      const userGoals = Array.isArray(userProfile.fitnessGoals) ? userProfile.fitnessGoals : [userProfile.fitnessGoals];
      
      // Simple keyword matching for relevance
      const productName = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      
      // Check for goal-related keywords
      const hasGoalMatch = userGoals.some(goal => {
        const goalKeywords = goal.toLowerCase();
        return productName.includes(goalKeywords) || 
               category.includes(goalKeywords) ||
               product.keyBenefits.some(benefit => benefit.toLowerCase().includes(goalKeywords));
      });
      
      // Check for health concern keywords if specified
      if (userProfile.healthConcerns && userProfile.healthConcerns.length > 0) {
        const hasHealthMatch = userProfile.healthConcerns.some(concern => {
          const concernKeywords = concern.toLowerCase().replace('-', ' ');
          return productName.includes(concernKeywords) ||
                 product.keyBenefits.some(benefit => benefit.toLowerCase().includes(concernKeywords));
        });
        
        return hasGoalMatch || hasHealthMatch;
      }
      
      return hasGoalMatch;
    })
    .sort((a, b) => {
      // Sort by value proposition (rating / price)
      const aValue = a.rating / a.price;
      const bValue = b.rating / b.price;
      return bValue - aValue;
    })
    .slice(0, 8); // Return top 8 most relevant products
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
