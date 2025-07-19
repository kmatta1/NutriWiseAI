// Revenue Analytics Dashboard
// Real-time revenue tracking and optimization

import { subscriptionManager, SubscriptionMetrics, UserSubscription } from './subscription-manager';
import { amazonProductService } from './amazon-product-service';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  affiliateRevenue: number;
  subscriptionRevenue: number;
  avgRevenuePerUser: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  projectedRevenue: {
    next30Days: number;
    next90Days: number;
    nextYear: number;
  };
  topPerformingSupplements: {
    name: string;
    revenue: number;
    commissionRate: number;
    conversions: number;
  }[];
}

export interface AffiliateMetrics {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommissions: number;
  avgOrderValue: number;
  topProducts: {
    name: string;
    asin: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commissionRate: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
}

export interface UserEngagementMetrics {
  activeUsers: number;
  newSignups: number;
  retentionRate: number;
  avgSessionDuration: number;
  stacksGenerated: number;
  aiConsultations: number;
  upgradeRate: number;
  mostPopularFeatures: {
    feature: string;
    usage: number;
    conversionImpact: number;
  }[];
}

export interface RevenueOptimizationRecommendations {
  pricing: {
    recommendation: string;
    impact: string;
    confidence: number;
  }[];
  product: {
    recommendation: string;
    impact: string;
    confidence: number;
  }[];
  marketing: {
    recommendation: string;
    impact: string;
    confidence: number;
  }[];
  affiliate: {
    recommendation: string;
    impact: string;
    confidence: number;
  }[];
}

export class RevenueAnalytics {
  private clickTrackingData: Map<string, any> = new Map();
  private conversionData: Map<string, any> = new Map();
  private userEngagementData: Map<string, any> = new Map();

  constructor() {
    this.initializeTestData();
  }

  async generateRevenueDashboard(startDate: Date, endDate: Date): Promise<{
    revenue: RevenueMetrics;
    affiliate: AffiliateMetrics;
    engagement: UserEngagementMetrics;
    recommendations: RevenueOptimizationRecommendations;
  }> {
    const [revenue, affiliate, engagement, recommendations] = await Promise.all([
      this.calculateRevenueMetrics(startDate, endDate),
      this.calculateAffiliateMetrics(startDate, endDate),
      this.calculateEngagementMetrics(startDate, endDate),
      this.generateOptimizationRecommendations(startDate, endDate)
    ]);

    return {
      revenue,
      affiliate,
      engagement,
      recommendations
    };
  }

  private async calculateRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetrics> {
    const subscriptionMetrics = await subscriptionManager.generateRevenueReport(startDate, endDate);
    
    // Calculate affiliate revenue
    const affiliateRevenue = this.calculateAffiliateRevenue(startDate, endDate);
    
    const totalRevenue = subscriptionMetrics.totalRevenue + affiliateRevenue;
    
    return {
      totalRevenue,
      monthlyRecurringRevenue: subscriptionMetrics.monthlyRecurringRevenue,
      affiliateRevenue,
      subscriptionRevenue: subscriptionMetrics.totalRevenue,
      avgRevenuePerUser: this.calculateAvgRevenuePerUser(totalRevenue),
      customerLifetimeValue: subscriptionMetrics.lifetimeValue,
      churnRate: subscriptionMetrics.churnRate,
      growthRate: this.calculateGrowthRate(startDate, endDate),
      projectedRevenue: this.calculateProjectedRevenue(totalRevenue),
      topPerformingSupplements: this.getTopPerformingSupplements()
    };
  }

  private async calculateAffiliateMetrics(startDate: Date, endDate: Date): Promise<AffiliateMetrics> {
    const totalClicks = this.getTotalClicks(startDate, endDate);
    const totalConversions = this.getTotalConversions(startDate, endDate);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    return {
      totalClicks,
      totalConversions,
      conversionRate,
      totalCommissions: this.calculateAffiliateRevenue(startDate, endDate),
      avgOrderValue: this.calculateAvgOrderValue(startDate, endDate),
      topProducts: this.getTopAffiliateProducts(),
      revenueByCategory: this.getRevenueByCategory()
    };
  }

  private async calculateEngagementMetrics(startDate: Date, endDate: Date): Promise<UserEngagementMetrics> {
    return {
      activeUsers: this.getActiveUsers(startDate, endDate),
      newSignups: this.getNewSignups(startDate, endDate),
      retentionRate: this.calculateRetentionRate(startDate, endDate),
      avgSessionDuration: this.calculateAvgSessionDuration(startDate, endDate),
      stacksGenerated: this.getTotalStacksGenerated(startDate, endDate),
      aiConsultations: this.getTotalAIConsultations(startDate, endDate),
      upgradeRate: this.calculateUpgradeRate(startDate, endDate),
      mostPopularFeatures: this.getMostPopularFeatures()
    };
  }

  private async generateOptimizationRecommendations(startDate: Date, endDate: Date): Promise<RevenueOptimizationRecommendations> {
    const revenue = await this.calculateRevenueMetrics(startDate, endDate);
    const affiliate = await this.calculateAffiliateMetrics(startDate, endDate);
    const engagement = await this.calculateEngagementMetrics(startDate, endDate);

    return {
      pricing: this.generatePricingRecommendations(revenue, engagement),
      product: this.generateProductRecommendations(revenue, affiliate),
      marketing: this.generateMarketingRecommendations(engagement),
      affiliate: this.generateAffiliateRecommendations(affiliate)
    };
  }

  private generatePricingRecommendations(revenue: RevenueMetrics, engagement: UserEngagementMetrics): RevenueOptimizationRecommendations['pricing'] {
    const recommendations = [];

    if (revenue.churnRate > 10) {
      recommendations.push({
        recommendation: 'Consider introducing a lower-tier plan at $9.99/month to reduce churn',
        impact: 'Could reduce churn by 15-20% and increase total revenue by 8-12%',
        confidence: 0.85
      });
    }

    if (engagement.upgradeRate < 5) {
      recommendations.push({
        recommendation: 'Implement usage-based pricing tiers to encourage upgrades',
        impact: 'Could increase upgrade rate to 12-15% and boost ARPU by 25%',
        confidence: 0.75
      });
    }

    if (revenue.avgRevenuePerUser < 30) {
      recommendations.push({
        recommendation: 'Bundle complementary services (meal planning, fitness tracking) to increase ARPU',
        impact: 'Could increase ARPU by $8-12/month per user',
        confidence: 0.80
      });
    }

    return recommendations;
  }

  private generateProductRecommendations(revenue: RevenueMetrics, affiliate: AffiliateMetrics): RevenueOptimizationRecommendations['product'] {
    const recommendations = [];

    if (affiliate.conversionRate < 3) {
      recommendations.push({
        recommendation: 'Improve product recommendation algorithm to increase affiliate conversions',
        impact: 'Could increase affiliate revenue by 40-60%',
        confidence: 0.90
      });
    }

    recommendations.push({
      recommendation: 'Introduce private label supplements with higher margins',
      impact: 'Could add $50,000-100,000/month in additional revenue',
      confidence: 0.65
    });

    if (revenue.topPerformingSupplements.length < 5) {
      recommendations.push({
        recommendation: 'Expand supplement database to include more niche products',
        impact: 'Could increase affiliate revenue by 25-35%',
        confidence: 0.75
      });
    }

    return recommendations;
  }

  private generateMarketingRecommendations(engagement: UserEngagementMetrics): RevenueOptimizationRecommendations['marketing'] {
    const recommendations = [];

    if (engagement.retentionRate < 70) {
      recommendations.push({
        recommendation: 'Implement email drip campaigns for user onboarding and retention',
        impact: 'Could improve retention by 15-25%',
        confidence: 0.80
      });
    }

    if (engagement.avgSessionDuration < 300) { // 5 minutes
      recommendations.push({
        recommendation: 'Gamify the supplement recommendation process to increase engagement',
        impact: 'Could increase session duration by 50-75%',
        confidence: 0.70
      });
    }

    recommendations.push({
      recommendation: 'Launch referral program with affiliate commission sharing',
      impact: 'Could increase new signups by 20-30%',
      confidence: 0.85
    });

    return recommendations;
  }

  private generateAffiliateRecommendations(affiliate: AffiliateMetrics): RevenueOptimizationRecommendations['affiliate'] {
    const recommendations = [];

    if (affiliate.conversionRate < 2.5) {
      recommendations.push({
        recommendation: 'Optimize product pages with better descriptions and reviews',
        impact: 'Could increase conversion rate by 30-50%',
        confidence: 0.85
      });
    }

    recommendations.push({
      recommendation: 'Negotiate higher commission rates with top-performing brands',
      impact: 'Could increase affiliate revenue by 15-25%',
      confidence: 0.75
    });

    if (affiliate.avgOrderValue < 35) {
      recommendations.push({
        recommendation: 'Implement bundle recommendations to increase average order value',
        impact: 'Could increase AOV by $8-15 per order',
        confidence: 0.80
      });
    }

    return recommendations;
  }

  // Helper methods with mock data for demonstration
  private calculateAffiliateRevenue(startDate: Date, endDate: Date): number {
    // Mock calculation - in production, this would query real affiliate data
    return 12500; // $12,500 monthly affiliate revenue
  }

  private calculateAvgRevenuePerUser(totalRevenue: number): number {
    const activeUsers = 850; // Mock active users
    return totalRevenue / activeUsers;
  }

  private calculateGrowthRate(startDate: Date, endDate: Date): number {
    // Mock growth rate calculation
    return 15.5; // 15.5% month-over-month growth
  }

  private calculateProjectedRevenue(currentRevenue: number): RevenueMetrics['projectedRevenue'] {
    const growthRate = 0.155; // 15.5% monthly growth
    
    return {
      next30Days: currentRevenue * (1 + growthRate),
      next90Days: currentRevenue * Math.pow(1 + growthRate, 3),
      nextYear: currentRevenue * Math.pow(1 + growthRate, 12)
    };
  }

  private getTopPerformingSupplements(): RevenueMetrics['topPerformingSupplements'] {
    return [
      { name: 'Omega-3 Fish Oil', revenue: 3200, commissionRate: 0.08, conversions: 145 },
      { name: 'Vitamin D3', revenue: 2800, commissionRate: 0.06, conversions: 167 },
      { name: 'Magnesium Glycinate', revenue: 2400, commissionRate: 0.07, conversions: 134 },
      { name: 'Probiotics', revenue: 2100, commissionRate: 0.09, conversions: 89 },
      { name: 'Whey Protein', revenue: 1950, commissionRate: 0.05, conversions: 98 }
    ];
  }

  private getTotalClicks(startDate: Date, endDate: Date): number {
    return 15650; // Mock click data
  }

  private getTotalConversions(startDate: Date, endDate: Date): number {
    return 423; // Mock conversion data
  }

  private calculateAvgOrderValue(startDate: Date, endDate: Date): number {
    return 42.50; // Mock AOV
  }

  private getTopAffiliateProducts(): AffiliateMetrics['topProducts'] {
    return [
      { name: 'Omega-3 Fish Oil', asin: 'B00CAZAU62', clicks: 1245, conversions: 89, revenue: 3200, commissionRate: 0.08 },
      { name: 'Vitamin D3', asin: 'B000FGDIAI', clicks: 1156, conversions: 67, revenue: 2800, commissionRate: 0.06 },
      { name: 'Magnesium Glycinate', asin: 'B00YQZQH32', clicks: 987, conversions: 56, revenue: 2400, commissionRate: 0.07 },
      { name: 'Probiotics', asin: 'B00JEKYNZA', clicks: 834, conversions: 45, revenue: 2100, commissionRate: 0.09 },
      { name: 'Whey Protein', asin: 'B000QSNYGI', clicks: 756, conversions: 34, revenue: 1950, commissionRate: 0.05 }
    ];
  }

  private getRevenueByCategory(): AffiliateMetrics['revenueByCategory'] {
    return [
      { category: 'Vitamins & Minerals', revenue: 8500, percentage: 40.5 },
      { category: 'Proteins & Fitness', revenue: 5200, percentage: 24.8 },
      { category: 'Digestive Health', revenue: 3800, percentage: 18.1 },
      { category: 'Immune Support', revenue: 2100, percentage: 10.0 },
      { category: 'Cognitive Health', revenue: 1400, percentage: 6.6 }
    ];
  }

  private getActiveUsers(startDate: Date, endDate: Date): number {
    return 2145; // Mock active users
  }

  private getNewSignups(startDate: Date, endDate: Date): number {
    return 287; // Mock new signups
  }

  private calculateRetentionRate(startDate: Date, endDate: Date): number {
    return 73.5; // Mock retention rate
  }

  private calculateAvgSessionDuration(startDate: Date, endDate: Date): number {
    return 420; // Mock session duration in seconds (7 minutes)
  }

  private getTotalStacksGenerated(startDate: Date, endDate: Date): number {
    return 1567; // Mock stacks generated
  }

  private getTotalAIConsultations(startDate: Date, endDate: Date): number {
    return 3456; // Mock AI consultations
  }

  private calculateUpgradeRate(startDate: Date, endDate: Date): number {
    return 8.5; // Mock upgrade rate
  }

  private getMostPopularFeatures(): UserEngagementMetrics['mostPopularFeatures'] {
    return [
      { feature: 'Supplement Stack Generation', usage: 1567, conversionImpact: 0.85 },
      { feature: 'AI Consultation', usage: 1234, conversionImpact: 0.78 },
      { feature: 'Amazon Product Recommendations', usage: 987, conversionImpact: 0.65 },
      { feature: 'Progress Tracking', usage: 654, conversionImpact: 0.72 },
      { feature: 'Expert Support', usage: 432, conversionImpact: 0.92 }
    ];
  }

  private initializeTestData(): void {
    // Initialize with some test data for demonstration
    // In production, this would be populated from actual user interactions
  }

  // Real-time tracking methods
  async trackAffiliateClick(userId: string, productName: string, asin: string): Promise<void> {
    const clickData = {
      userId,
      productName,
      asin,
      timestamp: new Date(),
      sessionId: `session_${Date.now()}`
    };

    this.clickTrackingData.set(`${userId}_${asin}_${Date.now()}`, clickData);
  }

  async trackAffiliateConversion(userId: string, productName: string, asin: string, orderValue: number): Promise<void> {
    const conversionData = {
      userId,
      productName,
      asin,
      orderValue,
      timestamp: new Date(),
      commission: orderValue * 0.06 // 6% commission
    };

    this.conversionData.set(`${userId}_${asin}_${Date.now()}`, conversionData);
    
    // Update subscription earnings
    await subscriptionManager.trackUsage(userId, {
      affiliateEarnings: conversionData.commission
    });
  }

  async trackUserEngagement(userId: string, action: string, metadata?: any): Promise<void> {
    const engagementData = {
      userId,
      action,
      metadata,
      timestamp: new Date()
    };

    this.userEngagementData.set(`${userId}_${Date.now()}`, engagementData);
  }

  // Export methods for reports
  async exportRevenueReport(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): Promise<string> {
    const dashboard = await this.generateRevenueDashboard(startDate, endDate);
    
    if (format === 'json') {
      return JSON.stringify(dashboard, null, 2);
    } else {
      // Convert to CSV format
      return this.convertToCSV(dashboard);
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const rows = [];
    rows.push('Metric,Value');
    rows.push(`Total Revenue,${data.revenue.totalRevenue}`);
    rows.push(`Monthly Recurring Revenue,${data.revenue.monthlyRecurringRevenue}`);
    rows.push(`Affiliate Revenue,${data.revenue.affiliateRevenue}`);
    rows.push(`Churn Rate,${data.revenue.churnRate}%`);
    rows.push(`Growth Rate,${data.revenue.growthRate}%`);
    
    return rows.join('\n');
  }
}

export const revenueAnalytics = new RevenueAnalytics();
