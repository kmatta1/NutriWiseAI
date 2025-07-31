/**
 * Dynamic Product Catalog Service
 * 
 * This service manages a comprehensive supplement product catalog that:
 * 1. Stores verified supplement products with Amazon data
 * 2. Provides AI-driven recommendations based on user profiles
 * 3. Supports real-time price and availability updates
 * 4. Includes scientific evidence and dosing recommendations
 */

import { collection, getDocs, doc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

export interface ProductCatalogItem {
  id: string;
  name: string;
  brand: string;
  category: string; // 'protein', 'creatine', 'vitamins', 'minerals', 'herbs', 'amino-acids', etc.
  subcategory: string; // 'whey-protein', 'fish-oil', 'vitamin-d3', etc.
  
  // Product Details
  description: string;
  servingSize: string;
  servingsPerContainer: number;
  
  // Amazon Integration
  asin: string;
  amazonUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  currentPrice: number;
  primeEligible: boolean;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  
  // Supplement Information
  activeIngredients: Array<{
    name: string;
    amount: string;
    unit: string;
    percentDV?: number;
  }>;
  
  // Dosing & Usage
  recommendedDosage: {
    amount: string;
    frequency: string;
    timing: string; // 'with-meals', 'empty-stomach', 'pre-workout', 'bedtime'
    instructions: string;
  };
  
  // Scientific Evidence
  evidenceLevel: 'high' | 'moderate' | 'limited' | 'preliminary';
  studyCount: number;
  citations: string[];
  
  // Safety & Quality
  qualityFactors: {
    thirdPartyTested: boolean;
    gmpCertified: boolean;
    organicCertified: boolean;
    allergenFree: boolean;
    bioavailableForm: boolean;
    contaminantFree: boolean;
  };
  
  // Target Demographics & Goals
  targetGoals: string[]; // 'muscle-building', 'fat-loss', 'energy', 'recovery', etc.
  targetDemographics: {
    gender: ('male' | 'female' | 'both')[];
    ageRange: [number, number];
    activityLevel: string[];
    experienceLevel: string[];
  };
  
  // Health Considerations
  healthBenefits: string[];
  contraindications: string[];
  drugInteractions: string[];
  sideEffects: string[];
  
  // Business Data
  commissionRate: number;
  costPerServing: number;
  
  // Metadata
  createdAt: Date;
  lastUpdated: Date;
  lastPriceUpdate: Date;
  lastVerified: Date;
  isActive: boolean;
}

export interface SupplementRecommendation {
  product: ProductCatalogItem;
  reasoning: string;
  priority: number; // 1-10, higher = more important
  synergies: string[];
  dosageAdjustment?: {
    adjustedAmount: string;
    reason: string;
  };
}

export interface PersonalizedStack {
  id: string;
  name: string;
  description: string;
  recommendations: SupplementRecommendation[];
  totalMonthlyCost: number;
  expectedResults: {
    timeline: string;
    benefits: string[];
  };
  scientificRationale: string;
  safetyNotes: string[];
  monitoringRecommendations: string[];
}

export class ProductCatalogService {
  private static instance: ProductCatalogService;
  private catalog: ProductCatalogItem[] = [];
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): ProductCatalogService {
    if (!ProductCatalogService.instance) {
      ProductCatalogService.instance = new ProductCatalogService();
    }
    return ProductCatalogService.instance;
  }

  /**
   * Load the entire product catalog from Firestore - Optimized for Firebase Storage images
   */
  async loadCatalog(): Promise<void> {
    try {
      console.log('🔄 Loading optimized catalog from Firestore...');
      const catalogRef = collection(db, 'productCatalog');
      const snapshot = await getDocs(catalogRef);
      
      console.log(`📦 Found ${snapshot.docs.length} products in database`);
      
      this.catalog = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Prioritize Firebase Storage URLs, convert to working format
        const originalImageUrl = data.imageUrl || data.image;
        const optimizedImageUrl = this.getOptimizedImageUrl(data);
        
        // Debug logging for image URLs
        if (originalImageUrl) {
          console.log(`📸 Product: ${data.name || data.productName}`);
          console.log(`   Original URL: ${originalImageUrl.substring(0, 80)}...`);
          console.log(`   Optimized URL: ${optimizedImageUrl || 'null'}`);
        }
        
        // Log URL conversion for debugging
        if (originalImageUrl && optimizedImageUrl !== originalImageUrl) {
          console.log(`🔄 URL Fix for ${data.name}:`);
          console.log(`  ❌ Original: ${originalImageUrl}`);
          console.log(`  ✅ Fixed: ${optimizedImageUrl}`);
        } else if (optimizedImageUrl) {
          console.log(`✅ Good URL for ${data.name}: ${optimizedImageUrl}`);
        }
        
        return {
          id: doc.id,
          ...data,
          imageUrl: optimizedImageUrl, // Optimized Firebase Storage URL
          // Ensure arrays exist and are properly initialized
          targetGoals: Array.isArray(data.targetGoals) ? data.targetGoals : [],
          activeIngredients: Array.isArray(data.activeIngredients) ? data.activeIngredients : [],
          category: Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []),
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
          healthBenefits: Array.isArray(data.healthBenefits) ? data.healthBenefits : [],
          contraindications: Array.isArray(data.contraindications) ? data.contraindications : [],
          drugInteractions: Array.isArray(data.drugInteractions) ? data.drugInteractions : [],
          sideEffects: Array.isArray(data.sideEffects) ? data.sideEffects : [],
          citations: Array.isArray(data.citations) ? data.citations : [],
          // Ensure dates are properly converted
          createdAt: data.createdAt?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          lastPriceUpdate: data.lastPriceUpdate?.toDate() || new Date(),
          lastVerified: data.lastVerified?.toDate() || new Date(),
        } as unknown;
      }) as ProductCatalogItem[];

      this.lastCacheUpdate = new Date();
      console.log(`✅ Loaded ${this.catalog.length} products with optimized Firebase images`);
      
    } catch (error) {
      console.error('❌ Error loading catalog:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL prioritizing Firebase Storage - FIXED for double encoding
   */
  private getOptimizedImageUrl(data: any): string | null {
    const imageUrl = data.imageUrl || data.image;
    
    if (!imageUrl) return null;
    
    // Skip Amazon URLs (they're broken)
    if (imageUrl.includes('amazon.com')) {
      return null;
    }
    
    // If it's already a working Firebase Storage API URL, return it
    if (imageUrl.includes('firebasestorage.googleapis.com') && imageUrl.includes('?alt=media')) {
      return imageUrl;
    }
    
    // Convert storage.googleapis.com URLs to working Firebase Storage API format
    if (imageUrl.includes('storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/')) {
      // Extract the path after the bucket name, stopping at any query parameters
      const pathMatch = imageUrl.match(/storage\.googleapis\.com\/nutriwise-ai-3fmvs\.firebasestorage\.app\/(.+?)(\?|$)/);
      if (pathMatch) {
        const filePath = pathMatch[1];
        console.log(`🔄 Converting Firebase Storage URL. File path: ${filePath}`);
        // Don't double-encode if already encoded
        const encodedPath = filePath.includes('%2F') ? filePath : filePath.replace(/\//g, '%2F');
        const finalUrl = `https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/${encodedPath}?alt=media`;
        console.log(`✅ Converted to: ${finalUrl}`);
        return finalUrl;
      }
    }
    
    // If it's a relative path like "images/supplements/filename.jpg", convert to Firebase Storage API
    if (imageUrl.startsWith('images/supplements/') || imageUrl.includes('/images/supplements/')) {
      let filePath = imageUrl;
      // Remove leading slash if present
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }
      // Extract just the path if it's a full URL
      if (filePath.includes('/images/supplements/')) {
        const match = filePath.match(/images\/supplements\/.+$/);
        if (match) {
          filePath = match[0];
        }
      }
      
      // Proper single encoding - replace slashes with %2F only
      const encodedPath = filePath.replace(/\//g, '%2F');
      return `https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/${encodedPath}?alt=media`;
    }
    
    // If it contains firebasestorage.app but wrong format, try to fix it
    if (imageUrl.includes('firebasestorage.app')) {
      return imageUrl;
    }
    
    // For any other URL format, return as-is
    return imageUrl;
  }

  /**
   * Get ALL products - FIXED to return all 91 products with database images
   */
  async getProducts(): Promise<ProductCatalogItem[]> {
    await this.ensureCatalogLoaded();
    
    // Return ALL active products - no limits, no fallbacks
    const allProducts = this.catalog.filter(p => p.isActive !== false);
    console.log(`Returning ${allProducts.length} products from database`);
    
    return allProducts;
  }

  /**
   * Get products by category with optional filtering
   */
  getProductsByCategory(
    category: string, 
    filters?: {
      minRating?: number;
      maxPrice?: number;
      evidenceLevel?: string[];
      targetGoals?: string[];
    }
  ): ProductCatalogItem[] {
    let products = this.catalog.filter(p => {
      const categoryMatch = Array.isArray(p.category) 
        ? p.category.includes(category)
        : p.category === category;
      return categoryMatch && p.isActive && p.isAvailable;
    });

    if (filters) {
      if (filters.minRating) {
        products = products.filter(p => p.rating >= filters.minRating!);
      }
      if (filters.maxPrice) {
        products = products.filter(p => p.currentPrice <= filters.maxPrice!);
      }
      if (filters.evidenceLevel) {
        products = products.filter(p => filters.evidenceLevel!.includes(p.evidenceLevel));
      }
      if (filters.targetGoals) {
        products = products.filter(p => 
          p.targetGoals && Array.isArray(p.targetGoals) && 
          p.targetGoals.some(goal => filters.targetGoals!.includes(goal))
        );
      }
    }

    return products.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Search products by name, brand, or active ingredients
   */
  searchProducts(query: string): ProductCatalogItem[] {
    const searchTerm = query.toLowerCase();
    
    return this.catalog.filter(product => 
      product.isActive && 
      product.isAvailable && (
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        (Array.isArray(product.category) 
          ? product.category.some(cat => cat.toLowerCase().includes(searchTerm))
          : product.category.toLowerCase().includes(searchTerm)) ||
        (product.activeIngredients && Array.isArray(product.activeIngredients) && 
          product.activeIngredients.some(ingredient => 
            ingredient && ingredient.name && ingredient.name.toLowerCase().includes(searchTerm)
          ))
      )
    ).sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): ProductCatalogItem | null {
    return this.catalog.find(p => p.id === id) || null;
  }

  /**
   * Generate AI-powered supplement recommendations based on user profile
   */
  async generatePersonalizedStack(userProfile: {
    age: number;
    gender: string;
    weight?: number;
    fitnessGoals: string[];
    healthConcerns: string[];
    activityLevel: string;
    diet: string;
    budget: number;
    experienceLevel: string;
    currentSupplements: string[];
  }): Promise<PersonalizedStack> {
    
    await this.ensureCatalogLoaded();
    
    // 1. Core supplements everyone needs
    const coreRecommendations = this.getCoreSupplements(userProfile);
    
    // 2. Goal-specific supplements
    const goalRecommendations = this.getGoalSpecificSupplements(userProfile);
    
    // 3. Health concern supplements  
    const healthRecommendations = this.getHealthConcernSupplements(userProfile);
    
    // 4. Budget optimization
    const allRecommendations = [...coreRecommendations, ...goalRecommendations, ...healthRecommendations];
    const optimizedRecommendations = this.optimizeForBudget(allRecommendations, userProfile.budget);
    
    // 5. Calculate synergies and interactions
    const finalRecommendations = this.calculateSynergies(optimizedRecommendations);
    
    const totalCost = finalRecommendations.reduce((sum, rec) => sum + rec.product.currentPrice, 0);
    
    return {
      id: `stack_${Date.now()}`,
      name: this.generateStackName(userProfile),
      description: this.generateStackDescription(userProfile),
      recommendations: finalRecommendations,
      totalMonthlyCost: totalCost,
      expectedResults: this.generateExpectedResults(finalRecommendations),
      scientificRationale: this.generateScientificRationale(finalRecommendations),
      safetyNotes: this.generateSafetyNotes(finalRecommendations),
      monitoringRecommendations: this.generateMonitoringRecommendations(finalRecommendations)
    };
  }

  private async ensureCatalogLoaded(): Promise<void> {
    if (this.catalog.length === 0 || this.isCacheExpired()) {
      await this.loadCatalog();
    }
  }

  private isCacheExpired(): boolean {
    if (!this.lastCacheUpdate) return true;
    return Date.now() - this.lastCacheUpdate.getTime() > this.CACHE_DURATION;
  }

  private getCoreSupplements(userProfile: any): SupplementRecommendation[] {
    const recommendations: SupplementRecommendation[] = [];
    
    // Personalize core supplements based on user profile
    const age = userProfile.age || 30;
    const goals = userProfile.fitnessGoals || [];
    const concerns = userProfile.healthConcerns || [];
    const budget = userProfile.budget || 100;
    const isVegetarian = userProfile.diet === 'vegetarian' || userProfile.diet === 'vegan';
    
    // Vitamin D3 - Essential for most people, especially if not getting sun
    if (budget > 15) { // Lowered threshold for essential vitamin
      const vitaminProducts = this.getProductsByCategory('vitamins');
      const vitaminD = vitaminProducts.find(p => p.subcategory === 'vitamin-d3');
      
      if (vitaminD) {
        recommendations.push({
          product: vitaminD,
          reasoning: `Essential for bone health, immune function, and mood regulation. Particularly important for ${userProfile.activityLevel} individuals.`,
          priority: 9,
          synergies: ['Enhances calcium absorption', 'Works synergistically with magnesium']
        });
      }
    }

    // Omega-3 - Critical for athletes and older adults
    if ((age > 25 || goals.includes('muscle-building') || goals.includes('endurance')) && budget > 25) {
      const omega3 = this.getProductsByCategory('oils').find(p => p.subcategory === 'fish-oil');
      
      if (omega3 && !isVegetarian) { // Skip fish oil for vegetarians
        recommendations.push({
          product: omega3,
          reasoning: `EPA/DHA for cardiovascular health, brain function, and anti-inflammatory effects. Essential for ${goals.join(' and ')} goals.`,
          priority: 8,
          synergies: ['Enhances vitamin D absorption', 'Supports magnesium utilization']
        });
      }
    }

    // Magnesium - For stress, sleep, and muscle function (prioritize for older adults or stress concerns)
    if (age > 30 || concerns.includes('stress') || concerns.includes('sleep') || goals.includes('strength')) {
      const minerals = this.getProductsByCategory('minerals');
      const magnesium = minerals.find(p => p.name.toLowerCase().includes('magnesium'));
      
      if (magnesium && budget > 35) { // Adjusted threshold
        recommendations.push({
          product: magnesium,
          reasoning: `Critical for muscle function, sleep quality, and stress management. Important for ${userProfile.activityLevel} training recovery.`,
          priority: 7,
          synergies: ['Works with vitamin D for bone health', 'Enhances sleep quality']
        });
      }
    }

    return recommendations;
  }

  private getGoalSpecificSupplements(userProfile: any): SupplementRecommendation[] {
    const recommendations: SupplementRecommendation[] = [];
    
    // Ensure fitnessGoals is an array
    const fitnessGoals = Array.isArray(userProfile.fitnessGoals) 
      ? userProfile.fitnessGoals 
      : userProfile.fitnessGoals 
        ? [userProfile.fitnessGoals] 
        : [];
    
    for (const goal of fitnessGoals) {
      switch (goal) {
        case 'muscle-building':
        case 'strength':
          // Protein powder
          const protein = this.getProductsByCategory('protein', {
            maxPrice: userProfile.budget * 0.4 // Max 40% of budget
          })[0];
          
          if (protein) {
            recommendations.push({
              product: protein,
              reasoning: 'High-quality protein to support muscle protein synthesis and recovery.',
              priority: 9,
              synergies: ['Works synergistically with creatine for muscle building']
            });
          }

          // Creatine
          const creatine = this.getProductsByCategory('amino-acids', {
            targetGoals: ['strength', 'muscle-building']
          }).find(p => p.subcategory === 'creatine-monohydrate');
          
          if (creatine) {
            recommendations.push({
              product: creatine,
              reasoning: 'Most researched supplement for strength and power. Increases muscle ATP production.',
              priority: 8,
              synergies: ['Enhanced by protein intake', 'Improved absorption with carbohydrates']
            });
          }
          break;

        case 'fat-loss':
          // Green tea extract or thermogenic
          const fatBurner = this.getProductsByCategory('herbs', {
            targetGoals: ['fat-loss']
          })[0];
          
          if (fatBurner && userProfile.budget > 50) {
            recommendations.push({
              product: fatBurner,
              reasoning: 'Supports metabolic rate and fat oxidation through natural thermogenesis.',
              priority: 6,
              synergies: ['Enhanced by caffeine', 'Works better with exercise']
            });
          }
          break;

        case 'energy':
          // B-complex or adaptogenic herbs
          const energySupport = this.getProductsByCategory('vitamins', {
            targetGoals: ['energy']
          }).find(p => p.subcategory === 'b-complex');
          
          if (energySupport) {
            recommendations.push({
              product: energySupport,
              reasoning: 'B vitamins are essential for energy metabolism and nervous system function.',
              priority: 7,
              synergies: ['Works with magnesium for energy production']
            });
          }
          break;
      }
    }

    return recommendations;
  }

  private getHealthConcernSupplements(userProfile: any): SupplementRecommendation[] {
    const recommendations: SupplementRecommendation[] = [];
    
    // Ensure healthConcerns is an array
    const healthConcerns = Array.isArray(userProfile.healthConcerns) 
      ? userProfile.healthConcerns 
      : userProfile.healthConcerns 
        ? [userProfile.healthConcerns] 
        : [];
    
    for (const concern of healthConcerns) {
      switch (concern) {
        case 'stress-anxiety':
          const magnesium = this.getProductsByCategory('minerals', {
            targetGoals: ['stress-management']
          }).find(p => p.subcategory === 'magnesium-glycinate');
          
          if (magnesium) {
            recommendations.push({
              product: magnesium,
              reasoning: 'Magnesium glycinate supports nervous system function and stress response.',
              priority: 7,
              synergies: ['Enhanced by vitamin D', 'Supports better sleep quality']
            });
          }
          break;

        case 'poor-digestion':
          const probiotics = this.getProductsByCategory('probiotics', {
            targetGoals: ['digestive-health']
          })[0];
          
          if (probiotics) {
            recommendations.push({
              product: probiotics,
              reasoning: 'Multi-strain probiotics support gut microbiome balance and digestive health.',
              priority: 8,
              synergies: ['Enhanced by prebiotics', 'Supports immune function']
            });
          }
          break;

        case 'sleep-issues':
          const melatonin = this.getProductsByCategory('hormones', {
            targetGoals: ['sleep-support']
          }).find(p => p.subcategory === 'melatonin');
          
          if (melatonin) {
            recommendations.push({
              product: melatonin,
              reasoning: 'Natural sleep hormone to support healthy sleep-wake cycles.',
              priority: 6,
              synergies: ['Enhanced by magnesium', 'Works better with consistent timing'],
              dosageAdjustment: {
                adjustedAmount: '0.5-3mg',
                reason: 'Start with lowest effective dose and adjust as needed'
              }
            });
          }
          break;
      }
    }

    return recommendations;
  }

  private optimizeForBudget(recommendations: SupplementRecommendation[], budget: number): SupplementRecommendation[] {
    // Sort by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);
    
    const optimized: SupplementRecommendation[] = [];
    let remainingBudget = budget;
    
    for (const rec of recommendations) {
      if (rec.product.currentPrice <= remainingBudget) {
        optimized.push(rec);
        remainingBudget -= rec.product.currentPrice;
      }
    }
    
    return optimized;
  }

  private calculateSynergies(recommendations: SupplementRecommendation[]): SupplementRecommendation[] {
    // Add additional synergy information based on supplement combinations
    const productNames = recommendations.map(r => r.product.subcategory);
    
    recommendations.forEach(rec => {
      if (rec.product.subcategory === 'vitamin-d3' && productNames.includes('magnesium-glycinate')) {
        rec.synergies.push('Magnesium enhances vitamin D metabolism and utilization');
      }
      
      if (rec.product.subcategory === 'fish-oil' && productNames.includes('vitamin-d3')) {
        rec.synergies.push('Fat-soluble vitamin D absorption enhanced by omega-3 fats');
      }
      
      if (rec.product.subcategory === 'creatine-monohydrate' && productNames.includes('whey-protein')) {
        rec.synergies.push('Protein and creatine synergistically support muscle growth and recovery');
      }
    });
    
    return recommendations;
  }

  private generateStackName(userProfile: any): string {
    // Handle both fitnessGoals (array) and primaryGoals (array) formats safely
    let primaryGoal = 'wellness';
    
    if (userProfile.fitnessGoals && Array.isArray(userProfile.fitnessGoals) && userProfile.fitnessGoals.length > 0) {
      primaryGoal = userProfile.fitnessGoals[0];
    } else if (userProfile.primaryGoals && Array.isArray(userProfile.primaryGoals) && userProfile.primaryGoals.length > 0) {
      primaryGoal = userProfile.primaryGoals[0];
    } else if (userProfile.fitnessGoals && typeof userProfile.fitnessGoals === 'string') {
      primaryGoal = userProfile.fitnessGoals;
    }
    
    const ageCategory = userProfile.age < 30 ? 'Young' : userProfile.age < 50 ? 'Prime' : 'Mature';
    const gender = userProfile.gender || 'Person';
    
    return `${ageCategory} ${gender.charAt(0).toUpperCase() + gender.slice(1)} ${primaryGoal.charAt(0).toUpperCase() + primaryGoal.slice(1)} Stack`;
  }

  private generateStackDescription(userProfile: any): string {
    // Handle both fitnessGoals (array) and primaryGoals (array) formats safely
    let goalsStr = 'general wellness';
    
    if (userProfile.fitnessGoals && Array.isArray(userProfile.fitnessGoals) && userProfile.fitnessGoals.length > 0) {
      goalsStr = userProfile.fitnessGoals.join(', ');
    } else if (userProfile.primaryGoals && Array.isArray(userProfile.primaryGoals) && userProfile.primaryGoals.length > 0) {
      goalsStr = userProfile.primaryGoals.join(', ');
    } else if (userProfile.fitnessGoals && typeof userProfile.fitnessGoals === 'string') {
      goalsStr = userProfile.fitnessGoals;
    }
    
    const age = userProfile.age || 'adult';
    const gender = userProfile.gender || 'person';
    const activityLevel = userProfile.activityLevel || 'moderate';
    const budget = userProfile.budget || 100;
    
    return `Scientifically-formulated supplement stack designed for ${age}-year-old ${gender} focused on ${goalsStr}. Optimized for ${activityLevel} activity level with a $${budget}/month budget.`;
  }

  private generateExpectedResults(recommendations: SupplementRecommendation[]): { timeline: string; benefits: string[] } {
    const benefits = recommendations
      .flatMap(rec => rec.product.healthBenefits || [])
      .filter(benefit => benefit && benefit.trim() !== '')
      .slice(0, 5);
    
    // Provide default benefits if none found
    const finalBenefits = benefits.length > 0 ? benefits : ['General health support', 'Nutritional supplementation'];
    
    return {
      timeline: 'Initial benefits within 2-4 weeks, optimal results in 8-12 weeks with consistent use',
      benefits: finalBenefits
    };
  }

  private generateScientificRationale(recommendations: SupplementRecommendation[]): string {
    const studyCount = recommendations.reduce((sum, rec) => sum + (rec.product.studyCount || 0), 0);
    return `This stack is backed by ${studyCount}+ scientific studies. Each supplement was selected based on evidence-based research for efficacy, safety, and synergistic interactions.`;
  }

  private generateSafetyNotes(recommendations: SupplementRecommendation[]): string[] {
    const notes = new Set<string>();
    
    recommendations.forEach(rec => {
      if (rec.product.contraindications && Array.isArray(rec.product.contraindications)) {
        rec.product.contraindications.forEach(note => notes.add(note));
      }
      if (rec.product.drugInteractions && Array.isArray(rec.product.drugInteractions) && rec.product.drugInteractions.length > 0) {
        notes.add('Check for medication interactions with your healthcare provider');
      }
    });
    
    notes.add('Start with recommended doses and adjust based on individual response');
    notes.add('Consult with healthcare provider before starting any new supplement regimen');
    
    return Array.from(notes);
  }

  private generateMonitoringRecommendations(_recommendations: SupplementRecommendation[]): string[] {
    return [
      'Track energy levels, sleep quality, and overall well-being',
      'Monitor for any adverse reactions during the first 2 weeks',
      'Assess progress toward fitness goals after 4-6 weeks',
      'Consider blood work to evaluate nutrient status after 3 months',
      'Adjust dosages based on response and lifestyle changes'
    ];
  }

  /**
   * Update product prices (to be called by hourly job)
   */
  async updateProductPrices(products: Partial<ProductCatalogItem>[]): Promise<void> {
    
    for (const update of products) {
      if (update.id) {
        const productRef = doc(db, 'productCatalog', update.id);
        await setDoc(productRef, {
          ...update,
          lastPriceUpdate: new Date()
        }, { merge: true });
      }
    }
    
    // Refresh catalog
    await this.loadCatalog();
  }

  /**
   * Add new product to catalog
   */
  async addProduct(product: Omit<ProductCatalogItem, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
    const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newProduct: ProductCatalogItem = {
      ...product,
      id: productId,
      createdAt: new Date(),
      lastUpdated: new Date(),
      lastPriceUpdate: new Date(),
      lastVerified: new Date()
    };

    const productRef = doc(db, 'productCatalog', productId);
    await setDoc(productRef, newProduct);
    
    // Add to local cache
    this.catalog.push(newProduct);
    
    return productId;
  }

  /**
   * Subscribe to real-time updates for the product catalog
   * @param callback Called with the latest list of ProductCatalogItem
   * @returns Unsubscribe function to stop listening
   */
  subscribeToProducts(callback: (products: ProductCatalogItem[]) => void): Unsubscribe {
    const catalogRef = collection(db, 'productCatalog');
    const unsubscribe = onSnapshot(
      catalogRef,
      snapshot => {
        const products = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          // Map Firestore data to ProductCatalogItem shape
          return {
            id: docSnap.id,
            ...data,
            imageUrl: data.imageUrl || data.image || null,
            targetGoals: Array.isArray(data.targetGoals) ? data.targetGoals : [],
            activeIngredients: Array.isArray(data.activeIngredients) ? data.activeIngredients : [],
            category: Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []),
            healthBenefits: Array.isArray(data.healthBenefits) ? data.healthBenefits : [],
            contraindications: Array.isArray(data.contraindications) ? data.contraindications : [],
            drugInteractions: Array.isArray(data.drugInteractions) ? data.drugInteractions : [],
            sideEffects: Array.isArray(data.sideEffects) ? data.sideEffects : [],
            citations: Array.isArray(data.citations) ? data.citations : [],
            createdAt: data.createdAt?.toDate() || new Date(),
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
            lastPriceUpdate: data.lastPriceUpdate?.toDate() || new Date(),
            lastVerified: data.lastVerified?.toDate() || new Date(),
          } as unknown as ProductCatalogItem;
        });
        callback(products.filter(p => p.isActive !== false));
      },
      error => {
        console.error('Real-time subscription error:', error);
      }
    );
    return unsubscribe;
  }
}

export const productCatalogService = ProductCatalogService.getInstance();
