// Enhanced AI Service with Amazon Integration
// Advanced RAG-Powered Supplement Intelligence

import { OpenAI } from 'openai';
import { AmazonIntegrationService } from './amazon-integration.ts';
import { ExtendedUserProfile, SupplementStack } from './types.ts';

interface ResearchData {
  pubmedStudies: Study[];
  supplementFacts: SupplementFact[];
  interactionWarnings: Interaction[];
  qualityStandards: QualityStandard[];
}

interface Study {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  relevanceScore: number;
  findings: string[];
}

interface SupplementFact {
  ingredient: string;
  optimalDosage: string;
  bioavailability: string;
  absorption: string;
  contraindications: string[];
  synergies: string[];
  qualityMarkers: string[];
}

interface Interaction {
  supplement: string;
  interactsWith: string;
  severity: 'low' | 'moderate' | 'high';
  description: string;
  recommendation: string;
}

interface QualityStandard {
  certification: string;
  requirements: string[];
  trustScore: number;
}

export class EnhancedAIService {
  private openai: OpenAI;
  private amazonService: AmazonIntegrationService;
  private knowledgeBase: Map<string, SupplementFact>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.amazonService = new AmazonIntegrationService();
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  async generateAdvancedRecommendations(
    userProfile: ExtendedUserProfile,
    isPremium: boolean = false
  ): Promise<AdvancedSupplementStack> {
    
    // Step 1: Analyze user profile with AI
    const profileAnalysis = await this.analyzeUserProfile(userProfile);
    
    // Step 2: Research latest scientific evidence
    const researchData = await this.gatherResearchData(profileAnalysis.primaryConcerns);
    
    // Step 3: Generate evidence-based recommendations
    const recommendations = await this.generateEvidenceBasedRecommendations(
      profileAnalysis,
      researchData,
      userProfile
    );
    
    // Step 4: Find optimal Amazon products for each recommendation
    const amazonProducts = await this.findOptimalProducts(recommendations, userProfile);
    
    // Step 5: Validate for interactions and contraindications
    const validatedStack = await this.validateRecommendations(
      amazonProducts,
      userProfile,
      researchData
    );
    
    // Step 6: Generate personalized guidance
    const personalizedGuidance = await this.generatePersonalizedGuidance(
      validatedStack,
      userProfile,
      researchData
    );

    return {
      ...validatedStack,
      guidance: personalizedGuidance,
      researchBacking: researchData,
      confidenceScore: this.calculateConfidenceScore(validatedStack, researchData),
      lastUpdated: new Date().toISOString(),
      isPremium
    };
  }

  private async analyzeUserProfile(userProfile: ExtendedUserProfile): Promise<ProfileAnalysis> {
    const analysisPrompt = `
      Analyze this user profile for supplement recommendations:
      
      Demographics:
      - Age: ${userProfile.age}
      - Gender: ${userProfile.gender}
      - Race/Ethnicity: ${userProfile.race}
      - Weight: ${userProfile.weight}kg
      - Activity Level: ${userProfile.activityLevel}
      
      Health Information:
      - Sleep Quality: ${userProfile.sleepQuality}
      - Diet: ${userProfile.diet}
      - Health Concerns: ${userProfile.healthConcerns}
      - Current Supplements: ${userProfile.currentSupplements}
      - Medical Conditions: ${userProfile.otherCriteria}
      
      Goals:
      - Fitness Goals: ${userProfile.fitnessGoals}
      - Budget: $${userProfile.budget}/month
      
      Provide a comprehensive analysis including:
      1. Primary health concerns (ranked by priority)
      2. Nutritional deficiency risks
      3. Metabolic considerations
      4. Lifestyle factors
      5. Supplement priorities
      6. Interaction risks
      7. Personalization factors
      
      Format as JSON with detailed explanations.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert nutritionist and supplement scientist. 
                   Analyze user profiles with scientific rigor and provide evidence-based insights.
                   Consider genetic factors, metabolic individuality, and lifestyle interactions.`
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private async gatherResearchData(primaryConcerns: string[]): Promise<ResearchData> {
    // Simulate research data gathering
    // In production, this would integrate with PubMed API, supplement databases, etc.
    
    const researchPrompt = `
      Gather the latest research evidence for these health concerns: ${primaryConcerns.join(', ')}
      
      For each concern, provide:
      1. Latest clinical studies (2020-2025)
      2. Optimal supplement interventions
      3. Dosage recommendations from research
      4. Bioavailability considerations
      5. Known interactions
      6. Quality markers to look for
      7. Contraindications
      
      Focus on evidence-based recommendations with study citations.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a research scientist specializing in nutritional supplements.
                   Provide evidence-based information with specific study references.
                   Focus on clinical efficacy, safety, and quality standards.`
        },
        {
          role: "user",
          content: researchPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    // Parse and structure research data
    const rawData = response.choices[0].message.content || '';
    
    return this.parseResearchData(rawData);
  }

  private async generateEvidenceBasedRecommendations(
    profileAnalysis: ProfileAnalysis,
    researchData: ResearchData,
    userProfile: UserProfile
  ): Promise<SupplementRecommendation[]> {
    
    const recommendations: SupplementRecommendation[] = [];
    
    // Process each primary concern
    for (const concern of profileAnalysis.primaryConcerns) {
      const relevantResearch = researchData.supplementFacts.filter(
        fact => fact.ingredient.toLowerCase().includes(concern.toLowerCase())
      );
      
      if (relevantResearch.length > 0) {
        const bestSupplementFact = relevantResearch[0]; // Top research-backed option
        
        recommendations.push({
          supplement: {
            name: bestSupplementFact.ingredient,
            dosage: bestSupplementFact.optimalDosage,
            form: this.determineBestForm(bestSupplementFact, userProfile),
            timing: this.getOptimalTiming(bestSupplementFact),
            reasoning: this.generateEvidenceReasoning(bestSupplementFact, concern)
          },
          healthConcern: concern,
          evidenceLevel: 'high',
          studyCount: relevantResearch.length,
          safetyProfile: this.assessSafetyProfile(bestSupplementFact),
          qualityRequirements: bestSupplementFact.qualityMarkers
        });
      }
    }
    
    return recommendations;
  }

  private async findOptimalProducts(
    recommendations: SupplementRecommendation[],
    userProfile: UserProfile
  ): Promise<EnhancedSupplementStack> {
    
    const stackWithProducts = await Promise.all(
      recommendations.map(async (rec) => {
        const amazonRecommendation = await this.amazonService.findOptimalSupplementProducts(
          rec.supplement.name,
          rec.supplement.dosage,
          this.mapToUserPreferences(userProfile)
        );
        
        return {
          ...rec,
          amazonProducts: amazonRecommendation.amazonProducts,
          priceAnalysis: amazonRecommendation.priceAnalysis,
          qualityFactors: amazonRecommendation.qualityFactors
        };
      })
    );
    
    // Calculate total cost and optimize for budget
    const totalCost = stackWithProducts.reduce((sum, item) => 
      sum + (item.priceAnalysis?.bestValue?.price?.current || 0), 0
    );
    
    const optimizedStack = totalCost > userProfile.budget 
      ? this.optimizeForBudget(stackWithProducts, userProfile.budget)
      : stackWithProducts;
    
    return {
      id: `enhanced_${Date.now()}`,
      name: this.generateStackName(userProfile, optimizedStack),
      supplements: optimizedStack,
      totalMonthlyCost: this.calculateTotalCost(optimizedStack),
      estimatedCommission: this.calculateCommission(optimizedStack),
      timeline: this.generateTimeline(optimizedStack),
      synergies: this.analyzeSynergies(optimizedStack),
      warnings: this.generateWarnings(optimizedStack)
    };
  }

  private async validateRecommendations(
    stack: EnhancedSupplementStack,
    userProfile: UserProfile,
    researchData: ResearchData
  ): Promise<EnhancedSupplementStack> {
    
    // Check for interactions
    const interactions = this.checkInteractions(stack.supplements, researchData.interactionWarnings);
    
    // Validate dosages
    const dosageValidation = this.validateDosages(stack.supplements, userProfile);
    
    // Check contraindications
    const contraindications = this.checkContraindications(stack.supplements, userProfile);
    
    // Filter out problematic supplements
    const validatedSupplements = stack.supplements.filter(supp => {
      const hasInteraction = interactions.some(int => 
        int.supplement === supp.supplement.name && int.severity === 'high'
      );
      
      const hasContradication = contraindications.some(contra => 
        contra.supplement === supp.supplement.name
      );
      
      return !hasInteraction && !hasContradication;
    });
    
    return {
      ...stack,
      supplements: validatedSupplements,
      interactions: interactions,
      contraindications: contraindications,
      validationScore: this.calculateValidationScore(validatedSupplements, interactions, contraindications)
    };
  }

  private async generatePersonalizedGuidance(
    stack: EnhancedSupplementStack,
    userProfile: UserProfile,
    researchData: ResearchData
  ): Promise<PersonalizedGuidance> {
    
    const guidancePrompt = `
      Create comprehensive personalized guidance for this supplement stack:
      
      User Profile: ${JSON.stringify(userProfile)}
      Supplement Stack: ${JSON.stringify(stack.supplements.map(s => s.supplement))}
      
      Provide guidance on:
      1. Optimal timing and sequencing
      2. Food interactions (with/without food)
      3. Expected timeline for results
      4. Monitoring recommendations
      5. Adjustment strategies
      6. Lifestyle optimization tips
      7. Warning signs to watch for
      8. When to consult healthcare providers
      
      Make it practical and actionable.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a clinical nutritionist providing personalized supplement guidance.
                   Focus on practical, safe, and effective implementation strategies.`
        },
        {
          role: "user",
          content: guidancePrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1000
    });

    return this.parseGuidanceResponse(response.choices[0].message.content || '');
  }

  private initializeKnowledgeBase(): void {
    // Initialize with comprehensive supplement knowledge
    const supplements = [
      {
        ingredient: 'Omega-3 EPA/DHA',
        optimalDosage: '1000-2000mg EPA/DHA daily',
        bioavailability: 'Triglyceride form > Ethyl ester form',
        absorption: 'Take with fat-containing meal',
        contraindications: ['blood thinning medications', 'fish allergy'],
        synergies: ['Vitamin E', 'Astaxanthin'],
        qualityMarkers: ['Third-party tested', 'IFOS certified', 'Molecularly distilled']
      },
      {
        ingredient: 'Magnesium Glycinate',
        optimalDosage: '200-400mg elemental magnesium',
        bioavailability: 'Glycinate form has superior absorption',
        absorption: 'Take on empty stomach or with light meal',
        contraindications: ['kidney disease', 'severe heart block'],
        synergies: ['Vitamin D', 'Calcium', 'Zinc'],
        qualityMarkers: ['Chelated form', 'Third-party tested', 'USP verified']
      },
      {
        ingredient: 'Vitamin D3',
        optimalDosage: '1000-4000 IU daily',
        bioavailability: 'D3 > D2 for raising blood levels',
        absorption: 'Take with fat-containing meal',
        contraindications: ['hypercalcemia', 'kidney stones'],
        synergies: ['Magnesium', 'Vitamin K2', 'Calcium'],
        qualityMarkers: ['Third-party tested', 'USP verified', 'Cholecalciferol form']
      }
    ];

    supplements.forEach(supp => {
      this.knowledgeBase.set(supp.ingredient, supp);
    });
  }

  private mapToUserPreferences(userProfile: UserProfile): any {
    return {
      budget: userProfile.budget,
      dietaryRestrictions: this.extractDietaryRestrictions(userProfile),
      preferredBrands: [],
      avoidIngredients: this.extractAvoidIngredients(userProfile),
      supplementForm: 'any',
      primeRequired: false
    };
  }

  private extractDietaryRestrictions(userProfile: UserProfile): string[] {
    const restrictions = [];
    
    if (userProfile.diet === 'vegetarian') restrictions.push('vegetarian');
    if (userProfile.diet === 'vegan') restrictions.push('vegan');
    if (userProfile.otherCriteria?.includes('gluten')) restrictions.push('gluten-free');
    if (userProfile.otherCriteria?.includes('dairy')) restrictions.push('dairy-free');
    
    return restrictions;
  }

  private extractAvoidIngredients(userProfile: UserProfile): string[] {
    const avoid = [];
    
    if (userProfile.otherCriteria?.includes('shellfish')) avoid.push('shellfish');
    if (userProfile.otherCriteria?.includes('soy')) avoid.push('soy');
    if (userProfile.otherCriteria?.includes('nuts')) avoid.push('nuts');
    
    return avoid;
  }

  private calculateConfidenceScore(stack: EnhancedSupplementStack, research: ResearchData): number {
    let score = 0;
    
    // Research backing weight (40%)
    const researchScore = stack.supplements.reduce((sum, supp) => {
      const hasStrongEvidence = research.supplementFacts.some(fact => 
        fact.ingredient === supp.supplement.name
      );
      return sum + (hasStrongEvidence ? 1 : 0);
    }, 0) / stack.supplements.length;
    
    score += researchScore * 0.4;
    
    // Product quality weight (30%)
    const qualityScore = stack.supplements.reduce((sum, supp) => {
      const qualityCount = Object.values(supp.qualityFactors || {}).filter(Boolean).length;
      return sum + (qualityCount / 5); // Normalize to 0-1
    }, 0) / stack.supplements.length;
    
    score += qualityScore * 0.3;
    
    // Safety validation weight (30%)
    const safetyScore = stack.validationScore || 0.8;
    score += safetyScore * 0.3;
    
    return Math.round(score * 100);
  }

  // Additional helper methods would be implemented here...
  private parseResearchData(rawData: string): ResearchData {
    // Parse AI response into structured research data
    return {
      pubmedStudies: [],
      supplementFacts: [],
      interactionWarnings: [],
      qualityStandards: []
    };
  }

  private generateStackName(userProfile: UserProfile, stack: any[]): string {
    const primaryConcern = stack[0]?.healthConcern || 'wellness';
    const gender = userProfile.gender === 'male' ? 'Men\'s' : 'Women\'s';
    return `${gender} ${primaryConcern} Optimization Stack`;
  }

  // ... Additional helper methods
}

// Type definitions for enhanced features
interface ProfileAnalysis {
  primaryConcerns: string[];
  nutritionalRisks: string[];
  metabolicFactors: string[];
  lifestyleConsiderations: string[];
  supplementPriorities: string[];
}

interface SupplementRecommendation {
  supplement: {
    name: string;
    dosage: string;
    form: string;
    timing: string;
    reasoning: string;
  };
  healthConcern: string;
  evidenceLevel: 'high' | 'moderate' | 'low';
  studyCount: number;
  safetyProfile: any;
  qualityRequirements: string[];
  amazonProducts?: any[];
  priceAnalysis?: any;
  qualityFactors?: any;
}

interface EnhancedSupplementStack {
  id: string;
  name: string;
  supplements: SupplementRecommendation[];
  totalMonthlyCost: number;
  estimatedCommission: number;
  timeline: string;
  synergies: string[];
  warnings: string[];
  interactions?: any[];
  contraindications?: any[];
  validationScore?: number;
}

interface AdvancedSupplementStack extends EnhancedSupplementStack {
  guidance: PersonalizedGuidance;
  researchBacking: ResearchData;
  confidenceScore: number;
  lastUpdated: string;
}

interface PersonalizedGuidance {
  timingInstructions: string;
  foodInteractions: string;
  expectedTimeline: string;
  monitoringRecommendations: string;
  adjustmentStrategies: string;
  lifestyleOptimization: string;
  warnings: string[];
}

export default EnhancedAIService;
