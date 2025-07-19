'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Shield,
  Zap,
  DollarSign,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular: boolean;
  description: string;
  icon: React.ReactNode;
  color: string;
  savings?: string;
}

interface SubscriptionUpgradeProps {
  currentPlan?: string;
  onUpgrade: (planId: string) => void;
  onClose?: () => void;
}

export default function SubscriptionUpgrade({ 
  currentPlan = 'free', 
  onUpgrade, 
  onClose 
}: SubscriptionUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isAnnual, setIsAnnual] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'premium',
      name: 'Premium',
      price: isAnnual ? 199 : 19.99,
      currency: 'USD',
      interval: isAnnual ? 'year' : 'month',
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
      popular: true,
      description: 'Perfect for individuals serious about their health optimization',
      icon: <Crown className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-500',
      savings: isAnnual ? 'Save $40/year' : undefined
    },
    {
      id: 'professional',
      name: 'Professional',
      price: isAnnual ? 399 : 39.99,
      currency: 'USD',
      interval: isAnnual ? 'year' : 'month',
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
      popular: false,
      description: 'For health professionals and serious biohackers',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      savings: isAnnual ? 'Save $80/year' : undefined
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: isAnnual ? 799 : 79.99,
      currency: 'USD',
      interval: isAnnual ? 'year' : 'month',
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
      popular: false,
      description: 'For organizations and large-scale implementations',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500',
      savings: isAnnual ? 'Save $160/year' : undefined
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Crown className="h-5 w-5 text-blue-500" />;
      case 'professional':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'enterprise':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Your Health Potential
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Choose the perfect plan for your supplement optimization journey
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Current Plan Status */}
        {currentPlan !== 'free' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              {getPlanIcon(currentPlan)}
              <div>
                <h3 className="font-medium text-blue-900">
                  Current Plan: {plans.find(p => p.id === currentPlan)?.name || 'Free'}
                </h3>
                <p className="text-sm text-blue-700">
                  Upgrade to unlock more features and better recommendations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                  : 'hover:scale-105'
              } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(plan.price)}
                  <span className="text-base font-normal text-gray-600">
                    /{plan.interval}
                  </span>
                </div>
                {plan.savings && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {plan.savings}
                  </Badge>
                )}
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full mt-6 ${
                    selectedPlan === plan.id
                      ? `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Upgrade?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Earn Affiliate Commissions</h3>
              <p className="text-gray-600">
                Earn 2-6% commission on every supplement purchase through our recommendations
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced AI Recommendations</h3>
              <p className="text-gray-600">
                Get personalized supplement stacks based on real Amazon products and reviews
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Star className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Support</h3>
              <p className="text-gray-600">
                Get priority access to our health experts and advanced analytics
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
          >
            Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose} className="px-8 py-3 text-lg">
              Maybe Later
            </Button>
          )}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">30-day money-back guarantee</span>
          </div>
          <p>Cancel anytime. No questions asked.</p>
        </div>
      </div>
    </div>
  );
}
