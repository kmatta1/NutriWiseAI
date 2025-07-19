// Subscription Management System
// Handles Premium ($19.99), Professional ($39.99), and Enterprise ($79.99) tiers

import { ExtendedUserProfile } from './types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    supplementStacks: number;
    aiConsultations: number;
    expertSupport: boolean;
    advancedAnalytics: boolean;
    customRecommendations: boolean;
    prioritySupport: boolean;
    affiliateCommission: number; // percentage
    bulkOrdering: boolean;
    customBranding: boolean;
  };
  stripePriceId: string;
  popular: boolean;
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
  trialEnd?: Date;
  metadata: {
    totalStacksGenerated: number;
    totalAIConsultations: number;
    totalAffiliateEarnings: number;
    lastActivityDate: Date;
    customizationPreferences: {
      preferredBrands: string[];
      budgetRange: [number, number];
      qualityTier: 'budget' | 'mid-range' | 'premium';
      deliveryPreferences: string[];
    };
  };
}

export interface SubscriptionMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  lifetimeValue: number;
  conversionRate: number;
  planDistribution: {
    [planId: string]: {
      subscribers: number;
      revenue: number;
      percentage: number;
    };
  };
  revenueBreakdown: {
    subscriptions: number;
    affiliateCommissions: number;
    oneTimePayments: number;
  };
}

export class SubscriptionManager {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private userSubscriptions: Map<string, UserSubscription> = new Map();

  constructor() {
    this.initializePlans();
  }

  private initializePlans(): void {
    const plans: SubscriptionPlan[] = [
      {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited supplement stacks',
          'Real Amazon product recommendations',
          'Advanced AI consultations',
          'Premium product images',
          'Affiliate commission sharing (2%)',
          'Email support',
          'Basic analytics dashboard',
          'Export recommendations to PDF'
        ],
        limits: {
          supplementStacks: -1, // unlimited
          aiConsultations: 50,
          expertSupport: false,
          advancedAnalytics: false,
          customRecommendations: true,
          prioritySupport: false,
          affiliateCommission: 2,
          bulkOrdering: false,
          customBranding: false
        },
        stripePriceId: 'price_premium_monthly',
        popular: true,
        description: 'Perfect for individuals serious about their health optimization'
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 39.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Everything in Premium',
          'Expert support (24/7)',
          'Advanced analytics & tracking',
          'Bulk ordering discounts',
          'Custom supplement protocols',
          'Priority customer support',
          'Affiliate commission sharing (4%)',
          'White-label options',
          'API access',
          'Advanced meal planning integration'
        ],
        limits: {
          supplementStacks: -1,
          aiConsultations: 200,
          expertSupport: true,
          advancedAnalytics: true,
          customRecommendations: true,
          prioritySupport: true,
          affiliateCommission: 4,
          bulkOrdering: true,
          customBranding: true
        },
        stripePriceId: 'price_professional_monthly',
        popular: false,
        description: 'For health professionals and serious biohackers'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 79.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Everything in Professional',
          'Dedicated account manager',
          'Custom integration support',
          'Advanced reporting & analytics',
          'Team management features',
          'Bulk user management',
          'Affiliate commission sharing (6%)',
          'Custom branding & white-label',
          'Priority development requests',
          'SLA guarantees',
          'Custom API endpoints'
        ],
        limits: {
          supplementStacks: -1,
          aiConsultations: -1,
          expertSupport: true,
          advancedAnalytics: true,
          customRecommendations: true,
          prioritySupport: true,
          affiliateCommission: 6,
          bulkOrdering: true,
          customBranding: true
        },
        stripePriceId: 'price_enterprise_monthly',
        popular: false,
        description: 'For organizations and large-scale implementations'
      }
    ];

    plans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });
  }

  async createSubscription(
    userId: string,
    planId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string
  ): Promise<UserSubscription> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      stripeSubscriptionId,
      stripeCustomerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalStacksGenerated: 0,
        totalAIConsultations: 0,
        totalAffiliateEarnings: 0,
        lastActivityDate: new Date(),
        customizationPreferences: {
          preferredBrands: [],
          budgetRange: [20, 100],
          qualityTier: 'mid-range',
          deliveryPreferences: ['prime']
        }
      }
    };

    this.userSubscriptions.set(userId, subscription);
    return subscription;
  }

  async getSubscription(userId: string): Promise<UserSubscription | null> {
    return this.userSubscriptions.get(userId) || null;
  }

  async updateSubscriptionStatus(
    userId: string,
    status: UserSubscription['status'],
    metadata?: Partial<UserSubscription['metadata']>
  ): Promise<UserSubscription> {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) {
      throw new Error(`Subscription not found for user ${userId}`);
    }

    const updatedSubscription = {
      ...subscription,
      status,
      updatedAt: new Date(),
      metadata: metadata ? { ...subscription.metadata, ...metadata } : subscription.metadata
    };

    this.userSubscriptions.set(userId, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<UserSubscription> {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) {
      throw new Error(`Subscription not found for user ${userId}`);
    }

    const updatedSubscription = {
      ...subscription,
      cancelAtPeriodEnd,
      status: cancelAtPeriodEnd ? subscription.status : 'canceled' as const,
      updatedAt: new Date()
    };

    this.userSubscriptions.set(userId, updatedSubscription);
    return updatedSubscription;
  }

  async trackUsage(
    userId: string,
    usage: {
      stacksGenerated?: number;
      aiConsultations?: number;
      affiliateEarnings?: number;
    }
  ): Promise<void> {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) {
      return;
    }

    const updatedMetadata = {
      ...subscription.metadata,
      totalStacksGenerated: subscription.metadata.totalStacksGenerated + (usage.stacksGenerated || 0),
      totalAIConsultations: subscription.metadata.totalAIConsultations + (usage.aiConsultations || 0),
      totalAffiliateEarnings: subscription.metadata.totalAffiliateEarnings + (usage.affiliateEarnings || 0),
      lastActivityDate: new Date()
    };

    await this.updateSubscriptionStatus(userId, subscription.status, updatedMetadata);
  }

  async checkFeatureAccess(userId: string, feature: keyof SubscriptionPlan['limits']): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = this.plans.get(subscription.planId);
    if (!plan) {
      return false;
    }

    const limit = plan.limits[feature];
    if (typeof limit === 'boolean') {
      return limit;
    }

    if (typeof limit === 'number') {
      if (limit === -1) return true; // unlimited
      
      // Check usage against limits
      switch (feature) {
        case 'supplementStacks':
          return subscription.metadata.totalStacksGenerated < limit;
        case 'aiConsultations':
          return subscription.metadata.totalAIConsultations < limit;
        default:
          return true;
      }
    }

    return false;
  }

  async getAffiliateCommissionRate(userId: string): Promise<number> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return 0;
    }

    const plan = this.plans.get(subscription.planId);
    return plan?.limits.affiliateCommission || 0;
  }

  async getUserTier(userId: string): Promise<'free' | 'premium' | 'professional' | 'enterprise'> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }

    return subscription.planId as 'premium' | 'professional' | 'enterprise';
  }

  async generateRevenueReport(startDate: Date, endDate: Date): Promise<SubscriptionMetrics> {
    const activeSubscriptions = Array.from(this.userSubscriptions.values())
      .filter(sub => sub.status === 'active');

    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = this.plans.get(sub.planId);
      return sum + (plan?.price || 0);
    }, 0);

    const monthlyRecurringRevenue = totalRevenue; // Simplified for demo

    const planDistribution = this.calculatePlanDistribution(activeSubscriptions);

    return {
      totalRevenue,
      monthlyRecurringRevenue,
      churnRate: this.calculateChurnRate(startDate, endDate),
      lifetimeValue: this.calculateLifetimeValue(),
      conversionRate: this.calculateConversionRate(startDate, endDate),
      planDistribution,
      revenueBreakdown: {
        subscriptions: totalRevenue * 0.8, // 80% from subscriptions
        affiliateCommissions: totalRevenue * 0.15, // 15% from affiliate
        oneTimePayments: totalRevenue * 0.05 // 5% from one-time
      }
    };
  }

  private calculatePlanDistribution(subscriptions: UserSubscription[]): SubscriptionMetrics['planDistribution'] {
    const distribution: SubscriptionMetrics['planDistribution'] = {};
    const total = subscriptions.length;

    subscriptions.forEach(sub => {
      const plan = this.plans.get(sub.planId);
      if (plan) {
        if (!distribution[sub.planId]) {
          distribution[sub.planId] = {
            subscribers: 0,
            revenue: 0,
            percentage: 0
          };
        }

        distribution[sub.planId].subscribers++;
        distribution[sub.planId].revenue += plan.price;
      }
    });

    // Calculate percentages
    Object.keys(distribution).forEach(planId => {
      distribution[planId].percentage = (distribution[planId].subscribers / total) * 100;
    });

    return distribution;
  }

  private calculateChurnRate(startDate: Date, endDate: Date): number {
    // Simplified churn calculation
    const activeStart = Array.from(this.userSubscriptions.values())
      .filter(sub => sub.createdAt <= startDate && sub.status === 'active').length;

    const canceled = Array.from(this.userSubscriptions.values())
      .filter(sub => 
        sub.status === 'canceled' && 
        sub.updatedAt >= startDate && 
        sub.updatedAt <= endDate
      ).length;

    return activeStart > 0 ? (canceled / activeStart) * 100 : 0;
  }

  private calculateLifetimeValue(): number {
    const activeSubscriptions = Array.from(this.userSubscriptions.values())
      .filter(sub => sub.status === 'active');

    if (activeSubscriptions.length === 0) return 0;

    const averageRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = this.plans.get(sub.planId);
      return sum + (plan?.price || 0);
    }, 0) / activeSubscriptions.length;

    // Simplified LTV calculation: Average revenue * 12 months
    return averageRevenue * 12;
  }

  private calculateConversionRate(startDate: Date, endDate: Date): number {
    // This would typically require tracking trial users and conversions
    // For demo purposes, using a simplified calculation
    return 15.5; // 15.5% conversion rate
  }

  getAllPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  // Integration with user profile for enhanced recommendations
  async getEnhancedUserProfile(userId: string, baseProfile: ExtendedUserProfile): Promise<ExtendedUserProfile & { subscriptionTier: string; premiumFeatures: boolean }> {
    const subscription = await this.getSubscription(userId);
    const tier = await this.getUserTier(userId);
    
    return {
      ...baseProfile,
      subscriptionTier: tier,
      premiumFeatures: tier !== 'free',
      customizationPreferences: subscription?.metadata.customizationPreferences || {
        preferredBrands: [],
        budgetRange: [20, 100],
        qualityTier: 'mid-range',
        deliveryPreferences: ['prime']
      }
    };
  }
}

export const subscriptionManager = new SubscriptionManager();
