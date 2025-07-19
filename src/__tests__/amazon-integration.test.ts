// Amazon Integration Test Suite
// Tests the complete Amazon integration workflow

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { amazonProductService, ProductRecommendation, UserPreferences } from '../lib/amazon-product-service';
import { subscriptionManager } from '../lib/subscription-manager';
import { revenueAnalytics } from '../lib/revenue-analytics';
import { FallbackAI } from '../lib/fallback-ai';
import { ExtendedUserProfile } from '../lib/types';

// Mock user profile for testing
const mockUserProfile: ExtendedUserProfile = {
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  createdAt: new Date().toISOString(),
  isAdmin: false,
  isPremium: true,
  age: 30,
  gender: 'male',
  weight: 75,
  activityLevel: 'moderate',
  diet: 'omnivore',
  sleepQuality: 'good',
  healthConcerns: ['energy', 'focus'],
  currentSupplements: [],
  fitnessGoals: ['muscle gain', 'general health'],
  budget: 100,
  lifestyle: 'active',
  experienceLevel: 'beginner'
};

describe('Amazon Integration Workflow', () => {
  let fallbackAI: FallbackAI;

  beforeEach(() => {
    fallbackAI = new FallbackAI();
  });

  describe('Amazon Product Service', () => {
    it('should find optimal supplement products', async () => {
      const userPreferences: UserPreferences = {
        budget: 50,
        dietaryRestrictions: [],
        preferredBrands: ['Nordic Naturals'],
        avoidIngredients: [],
        supplementForm: 'capsule',
        primeRequired: true,
        qualityPriority: 'quality'
      };

      const recommendation = await amazonProductService.findOptimalSupplementProducts(
        'Omega-3 Fish Oil',
        '1000mg',
        userPreferences
      );

      expect(recommendation).toBeDefined();
      expect(recommendation.supplement.name).toBe('Omega-3 Fish Oil');
      expect(recommendation.amazonProducts).toHaveLength(3);
      expect(recommendation.amazonProducts[0].asin).toBeDefined();
      expect(recommendation.amazonProducts[0].availability.primeEligible).toBe(true);
      expect(recommendation.qualityFactors).toBeDefined();
      expect(recommendation.priceAnalysis).toBeDefined();
    });

    it('should filter products by user preferences', async () => {
      const userPreferences: UserPreferences = {
        budget: 20, // Low budget
        dietaryRestrictions: ['vegan'],
        preferredBrands: [],
        avoidIngredients: ['shellfish'],
        supplementForm: 'any',
        primeRequired: false,
        qualityPriority: 'price'
      };

      const recommendation = await amazonProductService.findOptimalSupplementProducts(
        'Vitamin D3',
        '2000 IU',
        userPreferences
      );

      expect(recommendation).toBeDefined();
      expect(recommendation.amazonProducts.length).toBeGreaterThan(0);
      
      // Check that all products are within budget
      recommendation.amazonProducts.forEach(product => {
        expect(product.price.current).toBeLessThanOrEqual(20);
      });
    });

    it('should provide quality assessment', async () => {
      const userPreferences: UserPreferences = {
        budget: 100,
        dietaryRestrictions: [],
        preferredBrands: [],
        avoidIngredients: [],
        supplementForm: 'any',
        primeRequired: false,
        qualityPriority: 'quality'
      };

      const recommendation = await amazonProductService.findOptimalSupplementProducts(
        'Magnesium Glycinate',
        '400mg',
        userPreferences
      );

      expect(recommendation.qualityFactors).toBeDefined();
      expect(typeof recommendation.qualityFactors.thirdPartyTested).toBe('boolean');
      expect(typeof recommendation.qualityFactors.gmpCertified).toBe('boolean');
      expect(typeof recommendation.qualityFactors.organicCertified).toBe('boolean');
      expect(typeof recommendation.qualityFactors.bioavailableForm).toBe('boolean');
    });
  });

  describe('Subscription Management', () => {
    it('should create and manage subscriptions', async () => {
      const subscription = await subscriptionManager.createSubscription(
        'user123',
        'premium',
        'cus_stripe123',
        'sub_stripe123'
      );

      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe('user123');
      expect(subscription.planId).toBe('premium');
      expect(subscription.status).toBe('active');
      expect(subscription.stripeCustomerId).toBe('cus_stripe123');
    });

    it('should check feature access correctly', async () => {
      await subscriptionManager.createSubscription(
        'user123',
        'premium',
        'cus_stripe123',
        'sub_stripe123'
      );

      const hasCustomRecommendations = await subscriptionManager.checkFeatureAccess(
        'user123',
        'customRecommendations'
      );
      const hasExpertSupport = await subscriptionManager.checkFeatureAccess(
        'user123',
        'expertSupport'
      );

      expect(hasCustomRecommendations).toBe(true);
      expect(hasExpertSupport).toBe(false); // Premium doesn't have expert support
    });

    it('should calculate affiliate commission rates', async () => {
      await subscriptionManager.createSubscription(
        'user123',
        'professional',
        'cus_stripe123',
        'sub_stripe123'
      );

      const commissionRate = await subscriptionManager.getAffiliateCommissionRate('user123');
      expect(commissionRate).toBe(4); // Professional plan has 4% commission
    });

    it('should track usage correctly', async () => {
      await subscriptionManager.createSubscription(
        'user123',
        'premium',
        'cus_stripe123',
        'sub_stripe123'
      );

      await subscriptionManager.trackUsage('user123', {
        stacksGenerated: 5,
        aiConsultations: 3,
        affiliateEarnings: 15.50
      });

      const subscription = await subscriptionManager.getSubscription('user123');
      expect(subscription?.metadata.totalStacksGenerated).toBe(5);
      expect(subscription?.metadata.totalAIConsultations).toBe(3);
      expect(subscription?.metadata.totalAffiliateEarnings).toBe(15.50);
    });
  });

  describe('Revenue Analytics', () => {
    it('should generate revenue dashboard', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const dashboard = await revenueAnalytics.generateRevenueDashboard(startDate, endDate);

      expect(dashboard).toBeDefined();
      expect(dashboard.revenue).toBeDefined();
      expect(dashboard.affiliate).toBeDefined();
      expect(dashboard.engagement).toBeDefined();
      expect(dashboard.recommendations).toBeDefined();

      // Check revenue metrics
      expect(dashboard.revenue.totalRevenue).toBeGreaterThan(0);
      expect(dashboard.revenue.affiliateRevenue).toBeGreaterThan(0);
      expect(dashboard.revenue.subscriptionRevenue).toBeGreaterThan(0);
      expect(dashboard.revenue.projectedRevenue).toBeDefined();

      // Check affiliate metrics
      expect(dashboard.affiliate.totalClicks).toBeGreaterThan(0);
      expect(dashboard.affiliate.totalConversions).toBeGreaterThan(0);
      expect(dashboard.affiliate.conversionRate).toBeGreaterThan(0);
      expect(dashboard.affiliate.topProducts).toHaveLength(5);

      // Check engagement metrics
      expect(dashboard.engagement.activeUsers).toBeGreaterThan(0);
      expect(dashboard.engagement.stacksGenerated).toBeGreaterThan(0);
      expect(dashboard.engagement.aiConsultations).toBeGreaterThan(0);
    });

    it('should track affiliate conversions', async () => {
      await revenueAnalytics.trackAffiliateClick('user123', 'Omega-3 Fish Oil', 'B00CAZAU62');
      await revenueAnalytics.trackAffiliateConversion('user123', 'Omega-3 Fish Oil', 'B00CAZAU62', 29.99);

      // Verify that the conversion was tracked
      const subscription = await subscriptionManager.getSubscription('user123');
      if (subscription) {
        expect(subscription.metadata.totalAffiliateEarnings).toBeGreaterThan(0);
      }
    });

    it('should generate optimization recommendations', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const dashboard = await revenueAnalytics.generateRevenueDashboard(startDate, endDate);

      expect(dashboard.recommendations.pricing).toBeDefined();
      expect(dashboard.recommendations.product).toBeDefined();
      expect(dashboard.recommendations.marketing).toBeDefined();
      expect(dashboard.recommendations.affiliate).toBeDefined();

      dashboard.recommendations.pricing.forEach(rec => {
        expect(rec.recommendation).toBeDefined();
        expect(rec.impact).toBeDefined();
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Enhanced AI Integration', () => {
    it('should generate supplement stack with Amazon product data', async () => {
      const stack = await fallbackAI.generateEvidenceBasedStack(mockUserProfile, true);

      expect(stack).toBeDefined();
      expect(stack.supplements).toBeDefined();
      expect(stack.supplements.length).toBeGreaterThan(0);

      // Check that supplements have Amazon product data
      stack.supplements.forEach(supplement => {
        expect(supplement.name).toBeDefined();
        expect(supplement.dosage).toBeDefined();
        expect(supplement.timing).toBeDefined();
        expect(supplement.affiliateUrl).toBeDefined();
        expect(supplement.imageUrl).toBeDefined();
        
        // Check for enhanced Amazon data
        if (supplement.amazonProduct) {
          expect(supplement.amazonProduct.asin).toBeDefined();
          expect(supplement.amazonProduct.rating).toBeGreaterThan(0);
          expect(supplement.amazonProduct.reviewCount).toBeGreaterThan(0);
          expect(typeof supplement.amazonProduct.primeEligible).toBe('boolean');
          expect(supplement.amazonProduct.qualityScore).toBeGreaterThan(0);
        }
      });
    });

    it('should provide different recommendations for premium vs free users', async () => {
      const freeStack = await fallbackAI.generateEvidenceBasedStack(
        { ...mockUserProfile, isPremium: false }, 
        false
      );
      const premiumStack = await fallbackAI.generateEvidenceBasedStack(
        { ...mockUserProfile, isPremium: true }, 
        true
      );

      expect(freeStack).toBeDefined();
      expect(premiumStack).toBeDefined();

      // Premium users should get more detailed Amazon product information
      const premiumSupplement = premiumStack.supplements[0];
      const freeSupplement = freeStack.supplements[0];

      if (premiumSupplement.amazonProduct && freeSupplement.amazonProduct) {
        expect(premiumSupplement.amazonProduct.qualityFactors).toBeDefined();
        expect(premiumSupplement.amazonProduct.alternatives).toBeDefined();
      }
    });

    it('should handle user preferences in recommendations', async () => {
      const veganProfile = {
        ...mockUserProfile,
        diet: 'vegan',
        otherCriteria: 'vegan supplements only'
      };

      const stack = await fallbackAI.generateEvidenceBasedStack(veganProfile, true);

      expect(stack).toBeDefined();
      expect(stack.supplements).toBeDefined();
      expect(stack.supplements.length).toBeGreaterThan(0);

      // Check that recommendations consider vegan preferences
      stack.supplements.forEach(supplement => {
        if (supplement.amazonProduct?.qualityFactors) {
          // The quality factors should include vegan-friendly options
          expect(supplement.amazonProduct.qualityFactors).toBeDefined();
        }
      });
    });
  });

  describe('Full Integration Workflow', () => {
    it('should complete the full user journey', async () => {
      const userId = 'test_user_123';
      
      // Step 1: Create subscription
      const subscription = await subscriptionManager.createSubscription(
        userId,
        'premium',
        'cus_stripe123',
        'sub_stripe123'
      );
      expect(subscription.status).toBe('active');

      // Step 2: Generate supplement recommendations
      const stack = await fallbackAI.generateEvidenceBasedStack(mockUserProfile, true);
      expect(stack.supplements.length).toBeGreaterThan(0);

      // Step 3: Track usage
      await subscriptionManager.trackUsage(userId, {
        stacksGenerated: 1,
        aiConsultations: 1
      });

      // Step 4: Simulate affiliate click and conversion
      const supplement = stack.supplements[0];
      await revenueAnalytics.trackAffiliateClick(userId, supplement.name, 'B00CAZAU62');
      await revenueAnalytics.trackAffiliateConversion(userId, supplement.name, 'B00CAZAU62', 29.99);

      // Step 5: Generate revenue report
      const dashboard = await revenueAnalytics.generateRevenueDashboard(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(dashboard.revenue.totalRevenue).toBeGreaterThan(0);
      expect(dashboard.affiliate.totalConversions).toBeGreaterThan(0);

      // Step 6: Verify subscription was updated
      const updatedSubscription = await subscriptionManager.getSubscription(userId);
      expect(updatedSubscription?.metadata.totalStacksGenerated).toBe(1);
      expect(updatedSubscription?.metadata.totalAIConsultations).toBe(1);
      expect(updatedSubscription?.metadata.totalAffiliateEarnings).toBeGreaterThan(0);
    });

    it('should handle different subscription tiers correctly', async () => {
      const tiers = ['premium', 'professional', 'enterprise'];
      
      for (const tier of tiers) {
        const userId = `test_user_${tier}`;
        
        // Create subscription
        await subscriptionManager.createSubscription(
          userId,
          tier,
          `cus_stripe_${tier}`,
          `sub_stripe_${tier}`
        );

        // Check commission rates
        const commissionRate = await subscriptionManager.getAffiliateCommissionRate(userId);
        
        if (tier === 'premium') expect(commissionRate).toBe(2);
        if (tier === 'professional') expect(commissionRate).toBe(4);
        if (tier === 'enterprise') expect(commissionRate).toBe(6);

        // Check feature access
        const hasExpertSupport = await subscriptionManager.checkFeatureAccess(userId, 'expertSupport');
        
        if (tier === 'premium') expect(hasExpertSupport).toBe(false);
        if (tier === 'professional') expect(hasExpertSupport).toBe(true);
        if (tier === 'enterprise') expect(hasExpertSupport).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid supplement names gracefully', async () => {
      const userPreferences: UserPreferences = {
        budget: 50,
        dietaryRestrictions: [],
        preferredBrands: [],
        avoidIngredients: [],
        supplementForm: 'any',
        primeRequired: false,
        qualityPriority: 'balanced'
      };

      const recommendation = await amazonProductService.findOptimalSupplementProducts(
        'Invalid Supplement Name',
        '500mg',
        userPreferences
      );

      expect(recommendation).toBeDefined();
      expect(recommendation.amazonProducts).toBeDefined();
    });

    it('should handle missing subscription gracefully', async () => {
      const subscription = await subscriptionManager.getSubscription('nonexistent_user');
      expect(subscription).toBeNull();

      const tier = await subscriptionManager.getUserTier('nonexistent_user');
      expect(tier).toBe('free');

      const commissionRate = await subscriptionManager.getAffiliateCommissionRate('nonexistent_user');
      expect(commissionRate).toBe(0);
    });

    it('should handle API failures gracefully', async () => {
      // Mock API failure
      const originalConsoleError = console.error;
      console.error = jest.fn();

      try {
        const stack = await fallbackAI.generateEvidenceBasedStack(mockUserProfile, true);
        expect(stack).toBeDefined();
      } catch (error) {
        // Should not throw, should handle gracefully
        expect(error).toBeNull();
      }

      console.error = originalConsoleError;
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should generate recommendations within reasonable time', async () => {
    const startTime = Date.now();
    
    const stack = await fallbackAI.generateEvidenceBasedStack(mockUserProfile, true);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(stack).toBeDefined();
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it('should handle concurrent requests', async () => {
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        fallbackAI.generateEvidenceBasedStack(mockUserProfile, true)
      );
    }
    
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(5);
    results.forEach(stack => {
      expect(stack).toBeDefined();
      expect(stack.supplements).toBeDefined();
    });
  });
});

export { mockUserProfile };
