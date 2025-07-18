"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FlaskConical, 
  Users, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  DollarSign,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SupplementStack } from '@/lib/fallback-ai';

interface SupplementStackCardProps {
  stack: SupplementStack;
  onPurchase: (stack: SupplementStack) => void;
  isLoading?: boolean;
}

export function SupplementStackCard({ stack, onPurchase, isLoading }: SupplementStackCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handlePurchase = () => {
    onPurchase(stack);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {stack.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{Math.round(stack.userSuccessRate * 100)}% success rate</span>
              </div>
              <div className="flex items-center gap-1">
                <FlaskConical className="w-4 h-4" />
                <span>{stack.scientificBacking.studyCount} studies</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{stack.timeline}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${stack.totalMonthlyCost}/month
            </div>
            <div className="text-sm text-muted-foreground">
              vs ${Math.round(stack.totalMonthlyCost * 1.4)} retail
            </div>
          </div>
        </div>

        {/* Evidence Score Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Evidence Quality Score</span>
            <span className="text-sm font-bold text-primary">
              {stack.evidenceScore}/10
            </span>
          </div>
          <Progress value={stack.evidenceScore * 10} className="h-2" />
        </div>

        {/* Key Benefits */}
        <div className="flex flex-wrap gap-2 mt-4">
          {stack.synergies.slice(0, 3).map((synergy, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {synergy}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            <Award className="w-3 h-3 mr-1" />
            Science-Backed
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="supplements">Stack Details</TabsTrigger>
            <TabsTrigger value="evidence">Scientific Evidence</TabsTrigger>
            <TabsTrigger value="results">Expected Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Why This Stack Works
                </h3>
                <div className="space-y-3 text-sm">
                  {stack.synergies.map((synergy, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{synergy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Safety & Considerations
                </h3>
                <div className="space-y-3 text-sm">
                  {stack.contraindications.length > 0 ? (
                    stack.contraindications.map((contraindication, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{contraindication}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>No known contraindications for healthy adults</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="supplements" className="mt-6">
            <div className="space-y-4">
              {stack.supplements.map((supplement, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{supplement.name}</h4>
                        <p className="text-sm text-muted-foreground">{supplement.dosage}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${supplement.price}/month</div>
                        <div className="text-sm text-muted-foreground">{supplement.timing}</div>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{supplement.reasoning}</p>
                    {supplement.affiliateUrl && (
                      <Button variant="outline" size="sm" className="w-full">
                        <DollarSign className="w-4 h-4 mr-2" />
                        View Product Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stack.scientificBacking.studyCount}</div>
                  <div className="text-sm text-muted-foreground">Scientific Studies</div>
                </Card>
                <Card className="p-4 text-center">
                  <FlaskConical className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stack.scientificBacking.qualityScore}/10</div>
                  <div className="text-sm text-muted-foreground">Quality Score</div>
                </Card>
                <Card className="p-4 text-center">
                  <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{Math.round(stack.userSuccessRate * 100)}%</div>
                  <div className="text-sm text-muted-foreground">User Success Rate</div>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Key Research Findings</h3>
                <div className="space-y-2">
                  {stack.scientificBacking.citations.slice(0, 3).map((citation, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      <span className="font-medium">Study #{index + 1}:</span> {citation}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Expected Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">1W</span>
                    </div>
                    <div>
                      <div className="font-medium">Week 1</div>
                      <div className="text-sm text-muted-foreground">Initial adaptation, possible mild effects</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">2W</span>
                    </div>
                    <div>
                      <div className="font-medium">Week 2-4</div>
                      <div className="text-sm text-muted-foreground">Noticeable improvements in energy and focus</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">8W</span>
                    </div>
                    <div>
                      <div className="font-medium">Week 8+</div>
                      <div className="text-sm text-muted-foreground">Peak benefits, measurable results</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">What Users Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-400 mb-1">
                      Most Common Benefits
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Increased sustained energy</li>
                      <li>• Better workout performance</li>
                      <li>• Improved focus and clarity</li>
                      <li>• Enhanced recovery</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                      Success Factors
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>• Consistent daily routine</li>
                      <li>• Proper timing with meals</li>
                      <li>• Adequate sleep (7+ hours)</li>
                      <li>• Regular exercise</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-4">
          <Button 
            onClick={handlePurchase}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 mr-2" />
                Get This Stack - ${stack.totalMonthlyCost}/month
              </>
            )}
          </Button>
          <Button variant="outline" size="lg">
            <BookOpen className="w-5 h-5 mr-2" />
            Learn More
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 inline mr-1" />
          30-day money-back guarantee • Free shipping • Cancel anytime
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplementStackCard;
