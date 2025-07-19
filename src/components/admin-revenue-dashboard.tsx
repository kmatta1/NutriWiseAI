'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Target, 
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw
} from 'lucide-react';

interface RevenueMetrics {
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

interface AffiliateMetrics {
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

interface UserEngagementMetrics {
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

interface RevenueOptimizationRecommendations {
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

interface DashboardData {
  revenue: RevenueMetrics;
  affiliate: AffiliateMetrics;
  engagement: UserEngagementMetrics;
  recommendations: RevenueOptimizationRecommendations;
}

export default function AdminRevenueDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in production, this would fetch from your revenue analytics service
      const mockData: DashboardData = {
        revenue: {
          totalRevenue: 45750,
          monthlyRecurringRevenue: 33250,
          affiliateRevenue: 12500,
          subscriptionRevenue: 33250,
          avgRevenuePerUser: 53.82,
          customerLifetimeValue: 645.84,
          churnRate: 7.2,
          growthRate: 15.5,
          projectedRevenue: {
            next30Days: 52800,
            next90Days: 71200,
            nextYear: 156800
          },
          topPerformingSupplements: [
            { name: 'Omega-3 Fish Oil', revenue: 3200, commissionRate: 0.08, conversions: 145 },
            { name: 'Vitamin D3', revenue: 2800, commissionRate: 0.06, conversions: 167 },
            { name: 'Magnesium Glycinate', revenue: 2400, commissionRate: 0.07, conversions: 134 },
            { name: 'Probiotics', revenue: 2100, commissionRate: 0.09, conversions: 89 },
            { name: 'Whey Protein', revenue: 1950, commissionRate: 0.05, conversions: 98 }
          ]
        },
        affiliate: {
          totalClicks: 15650,
          totalConversions: 423,
          conversionRate: 2.7,
          totalCommissions: 12500,
          avgOrderValue: 42.50,
          topProducts: [
            { name: 'Omega-3 Fish Oil', asin: 'B00CAZAU62', clicks: 1245, conversions: 89, revenue: 3200, commissionRate: 0.08 },
            { name: 'Vitamin D3', asin: 'B000FGDIAI', clicks: 1156, conversions: 67, revenue: 2800, commissionRate: 0.06 },
            { name: 'Magnesium Glycinate', asin: 'B00YQZQH32', clicks: 987, conversions: 56, revenue: 2400, commissionRate: 0.07 },
            { name: 'Probiotics', asin: 'B00JEKYNZA', clicks: 834, conversions: 45, revenue: 2100, commissionRate: 0.09 },
            { name: 'Whey Protein', asin: 'B000QSNYGI', clicks: 756, conversions: 34, revenue: 1950, commissionRate: 0.05 }
          ],
          revenueByCategory: [
            { category: 'Vitamins & Minerals', revenue: 8500, percentage: 40.5 },
            { category: 'Proteins & Fitness', revenue: 5200, percentage: 24.8 },
            { category: 'Digestive Health', revenue: 3800, percentage: 18.1 },
            { category: 'Immune Support', revenue: 2100, percentage: 10.0 },
            { category: 'Cognitive Health', revenue: 1400, percentage: 6.6 }
          ]
        },
        engagement: {
          activeUsers: 2145,
          newSignups: 287,
          retentionRate: 73.5,
          avgSessionDuration: 420,
          stacksGenerated: 1567,
          aiConsultations: 3456,
          upgradeRate: 8.5,
          mostPopularFeatures: [
            { feature: 'Supplement Stack Generation', usage: 1567, conversionImpact: 0.85 },
            { feature: 'AI Consultation', usage: 1234, conversionImpact: 0.78 },
            { feature: 'Amazon Product Recommendations', usage: 987, conversionImpact: 0.65 },
            { feature: 'Progress Tracking', usage: 654, conversionImpact: 0.72 },
            { feature: 'Expert Support', usage: 432, conversionImpact: 0.92 }
          ]
        },
        recommendations: {
          pricing: [
            {
              recommendation: 'Consider introducing a lower-tier plan at $9.99/month to reduce churn',
              impact: 'Could reduce churn by 15-20% and increase total revenue by 8-12%',
              confidence: 0.85
            },
            {
              recommendation: 'Implement usage-based pricing tiers to encourage upgrades',
              impact: 'Could increase upgrade rate to 12-15% and boost ARPU by 25%',
              confidence: 0.75
            }
          ],
          product: [
            {
              recommendation: 'Improve product recommendation algorithm to increase affiliate conversions',
              impact: 'Could increase affiliate revenue by 40-60%',
              confidence: 0.90
            },
            {
              recommendation: 'Introduce private label supplements with higher margins',
              impact: 'Could add $50,000-100,000/month in additional revenue',
              confidence: 0.65
            }
          ],
          marketing: [
            {
              recommendation: 'Implement email drip campaigns for user onboarding and retention',
              impact: 'Could improve retention by 15-25%',
              confidence: 0.80
            },
            {
              recommendation: 'Launch referral program with affiliate commission sharing',
              impact: 'Could increase new signups by 20-30%',
              confidence: 0.85
            }
          ],
          affiliate: [
            {
              recommendation: 'Optimize product pages with better descriptions and reviews',
              impact: 'Could increase conversion rate by 30-50%',
              confidence: 0.85
            },
            {
              recommendation: 'Negotiate higher commission rates with top-performing brands',
              impact: 'Could increase affiliate revenue by 15-25%',
              confidence: 0.75
            }
          ]
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen bg-gray-50 p-6">Error loading data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics Dashboard</h1>
              <p className="text-gray-600">Real-time insights and optimization recommendations</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <Button onClick={loadDashboardData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {['overview', 'revenue', 'affiliate', 'engagement', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.revenue.totalRevenue)}</div>
                  <div className={`text-xs ${getGrowthColor(data.revenue.growthRate)}`}>
                    +{data.revenue.growthRate}% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.revenue.monthlyRecurringRevenue)}</div>
                  <div className="text-xs text-gray-600">
                    {Math.round((data.revenue.subscriptionRevenue / data.revenue.totalRevenue) * 100)}% of total revenue
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.engagement.activeUsers.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    +{data.engagement.newSignups} new this month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.affiliate.conversionRate}%</div>
                  <div className="text-xs text-gray-600">
                    {data.affiliate.totalConversions} conversions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Subscriptions</span>
                      <span className="text-sm font-bold">{formatCurrency(data.revenue.subscriptionRevenue)}</span>
                    </div>
                    <Progress value={(data.revenue.subscriptionRevenue / data.revenue.totalRevenue) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Affiliate Commissions</span>
                      <span className="text-sm font-bold">{formatCurrency(data.revenue.affiliateRevenue)}</span>
                    </div>
                    <Progress value={(data.revenue.affiliateRevenue / data.revenue.totalRevenue) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Key Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Lifetime Value</span>
                      <span className="text-sm font-bold">{formatCurrency(data.revenue.customerLifetimeValue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Revenue Per User</span>
                      <span className="text-sm font-bold">{formatCurrency(data.revenue.avgRevenuePerUser)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Churn Rate</span>
                      <span className="text-sm font-bold">{data.revenue.churnRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retention Rate</span>
                      <span className="text-sm font-bold">{data.engagement.retentionRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Top Performing Supplements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.revenue.topPerformingSupplements.map((supplement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{supplement.name}</div>
                          <div className="text-sm text-gray-600">{supplement.conversions} conversions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(supplement.revenue)}</div>
                        <div className="text-sm text-gray-600">{(supplement.commissionRate * 100).toFixed(1)}% commission</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pricing Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recommendations.pricing.map((rec, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="font-medium text-sm">{rec.recommendation}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.impact}</div>
                        <Badge className={`mt-2 ${getConfidenceColor(rec.confidence)}`}>
                          {(rec.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Product Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recommendations.product.map((rec, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="font-medium text-sm">{rec.recommendation}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.impact}</div>
                        <Badge className={`mt-2 ${getConfidenceColor(rec.confidence)}`}>
                          {(rec.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Marketing Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recommendations.marketing.map((rec, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="font-medium text-sm">{rec.recommendation}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.impact}</div>
                        <Badge className={`mt-2 ${getConfidenceColor(rec.confidence)}`}>
                          {(rec.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Affiliate Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recommendations.affiliate.map((rec, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                        <div className="font-medium text-sm">{rec.recommendation}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.impact}</div>
                        <Badge className={`mt-2 ${getConfidenceColor(rec.confidence)}`}>
                          {(rec.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
