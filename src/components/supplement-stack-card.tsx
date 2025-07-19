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
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageError = (supplementName: string) => {
    console.log(`Image error for ${supplementName}:`, stack.supplements.find(s => s.name === supplementName)?.imageUrl);
    setImageErrors(prev => ({
      ...prev,
      [supplementName]: true
    }));
  };

  const handlePurchase = () => {
    onPurchase(stack);
  };

  const handleLearnMore = () => {
    // Open detailed supplement information in advisor
    window.open(`/advisor?stack=${encodeURIComponent(stack.id)}`, '_blank');
  };

  const handleViewProductDetails = (supplementName: string) => {
    const supplement = stack.supplements.find(s => s.name === supplementName);
    if (supplement?.affiliateUrl) {
      // Track affiliate click for analytics
      console.log(`Amazon affiliate click: ${supplementName}`, {
        asin: supplement.amazonProduct?.asin,
        price: supplement.price,
        url: supplement.affiliateUrl
      });
      
      // Open affiliate URL in new tab
      window.open(supplement.affiliateUrl, '_blank');
    } else {
      // Fallback to Amazon search with tracking ID
      const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(supplementName + ' supplement')}&tag=nutriwiseai-20`;
      console.log(`Amazon search fallback: ${supplementName} -> ${amazonUrl}`);
      window.open(amazonUrl, '_blank');
    }
  };

  // Debug: Log image URLs
  console.log('Stack supplements with images:', stack.supplements.map(s => ({ name: s.name, imageUrl: s.imageUrl })));

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30">
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

      <CardContent className="bg-card/30">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-border/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
            <TabsTrigger value="supplements" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Stack Details</TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Scientific Evidence</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Expected Results</TabsTrigger>
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
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {supplement.imageUrl && !imageErrors[supplement.name] ? (
                          <div className="relative">
                            <img
                              src={supplement.imageUrl}
                              alt={supplement.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover border border-border/50"
                              onError={() => handleImageError(supplement.name)}
                            />
                            {/* Show premium badge for real product images */}
                            {supplement.imageUrl.includes('media-amazon') && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
                                REAL
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                            <div className="text-center">
                              <FlaskConical className="w-6 h-6 text-primary mx-auto mb-1" />
                              <div className="text-xs font-bold text-primary">
                                {supplement.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">
                              {supplement.amazonProduct?.asin ? 
                                `${supplement.name} - ${supplement.amazonProduct.rating.toFixed(1)}⭐ (${supplement.amazonProduct.reviewCount} reviews)` :
                                supplement.name
                              }
                            </h4>
                            <p className="text-sm text-muted-foreground">{supplement.dosage}</p>
                            {supplement.amazonProduct?.primeEligible && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Prime Eligible
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">${supplement.price}/month</div>
                            <div className="text-sm text-muted-foreground">{supplement.timing}</div>
                            {supplement.amazonProduct && (
                              <div className="text-xs text-green-600 font-medium">
                                Quality Score: {Math.round((supplement.amazonProduct.qualityScore || 0) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3 text-muted-foreground">{supplement.reasoning}</p>
                        
                        {/* Amazon Product Quality Indicators */}
                        {supplement.amazonProduct?.qualityFactors && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {supplement.amazonProduct.qualityFactors.thirdPartyTested && (
                              <Badge variant="outline" className="text-xs">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                3rd Party Tested
                              </Badge>
                            )}
                            {supplement.amazonProduct.qualityFactors.gmpCertified && (
                              <Badge variant="outline" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                GMP Certified
                              </Badge>
                            )}
                            {supplement.amazonProduct.qualityFactors.organicCertified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Organic
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {supplement.affiliateUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleViewProductDetails(supplement.name)}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            {supplement.amazonProduct?.asin ? 
                              `Buy on Amazon - ${supplement.amazonProduct.primeEligible ? 'Prime Eligible' : 'Standard Shipping'}` :
                              'View Product Details'
                            }
                          </Button>
                        )}
                      </div>
                    </div>
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
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleLearnMore}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Learn More
          </Button>
        </div>

        <div className="mt-4 flex gap-4 border-t border-border/30 pt-6">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => {
              // Add to My Plans functionality
              onPurchase(stack);
            }}
            className="flex-1 bg-muted/50 border border-border/50 hover:bg-muted/70"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Add to My Plans
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              // Refresh/Find another stack
              window.location.reload();
            }}
            className="flex-1 border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Find Another Stack
          </Button>
        </div>


      </CardContent>
    </Card>
  );
}

export default SupplementStackCard;
