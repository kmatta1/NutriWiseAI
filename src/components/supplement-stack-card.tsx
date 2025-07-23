import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { 
  FlaskConical, 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap,
  DollarSign,
  BookOpen,
  Award,
  Star,
  CheckCircle
} from 'lucide-react';
import { SupplementStack } from '@/lib/fallback-ai';
import { findSupplementByName, getSupplementImagePath } from '@/services/firestore-supplements';
import { enhanceSupplementStack, generateTabContent } from '@/lib/product-data-loader';
import { useCart, CartItem } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

interface SupplementStackCardProps {
  stack: SupplementStack;
  onPurchase: (stack: SupplementStack) => void;
  isLoading?: boolean;
}

export function SupplementStackCard({ stack, onPurchase, isLoading }: SupplementStackCardProps) {
  const [resolvedImageUrls, setResolvedImageUrls] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState('supplements');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [enhancedStack, setEnhancedStack] = useState<SupplementStack>(stack);
  const [tabContent, setTabContent] = useState<any>(null);
  const { dispatch } = useCart();
  const { toast } = useToast();

  // Enhance stack with real product data
  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        const enhanced = await enhanceSupplementStack(stack);
        setEnhancedStack(enhanced);
        const content = generateTabContent(enhanced);
        setTabContent(content);
      } catch (error) {
        console.error('Error enhancing stack data:', error);
        setEnhancedStack(stack);
      }
    };
    
    loadEnhancedData();
  }, [stack]);

  const handleImageError = (supplementName: string) => {
    console.error(`❌ Firebase image failed to load for ${supplementName}`);
    setImageErrors(prev => ({
      ...prev,
      [supplementName]: true
    }));
  };

  // Use enhanced stack data
  const displayStack = enhancedStack;

  // Database ID to image mapping based on Firestore structure
  const getImageForSupplement = (supplement: any, supplementIndex: number) => {
    // If the supplement has a database ID field, use it directly
    if (supplement?.id && supplement.id.startsWith('supplement_')) {
      return supplement.id; // Use the database ID directly (e.g., supplement_22)
    }
    
    // If no ID, try to match by name to known database entries
    const supplementName = supplement?.name?.toLowerCase() || '';
    
    // Known database mappings
    if (supplementName.includes('turmeric') || supplementName.includes('curcumin')) {
      return 'supplement_22';
    } else if (supplementName.includes('whey') || supplementName.includes('protein')) {
      return 'supplement_1';
    } else if (supplementName.includes('creatine')) {
      return 'supplement_2';
    } else if (supplementName.includes('ashwagandha')) {
      return 'supplement_3';
    } else if (supplementName.includes('omega') || supplementName.includes('fish oil')) {
      return 'supplement_4';
    } else if (supplementName.includes('vitamin d')) {
      return 'supplement_5';
    } else if (supplementName.includes('magnesium')) {
      return 'supplement_6';
    } else if (supplementName.includes('probiotics')) {
      return 'supplement_7';
    } else if (supplementName.includes('melatonin')) {
      return 'supplement_8';
    } else if (supplementName.includes('bcaa')) {
      return 'supplement_9';
    } else if (supplementName.includes('pre-workout') || supplementName.includes('pre workout')) {
      return 'supplement_10';
    } else if (supplementName.includes('multivitamin')) {
      return 'supplement_11';
    } else if (supplementName.includes('vitamin c')) {
      return 'supplement_12';
    } else if (supplementName.includes('zinc')) {
      return 'supplement_13';
    } else if (supplementName.includes('iron')) {
      return 'supplement_14';
    } else if (supplementName.includes('calcium')) {
      return 'supplement_15';
    } else if (supplementName.includes('b12') || supplementName.includes('vitamin b')) {
      return 'supplement_16';
    } else if (supplementName.includes('glucosamine')) {
      return 'supplement_17';
    } else if (supplementName.includes('green tea')) {
      return 'supplement_18';
    } else if (supplementName.includes('ginkgo')) {
      return 'supplement_19';
    } else if (supplementName.includes('rhodiola')) {
      return 'supplement_20';
    } else if (supplementName.includes('collagen')) {
      return 'supplement_21';
    } else if (supplementName.includes('msm')) {
      return 'supplement_23';
    } else if (supplementName.includes('pulse') || supplementName.includes('legion')) {
      return 'supplement_24';
    } else {
      // Default distribution for unknown supplements
      return `supplement_${(supplementIndex % 25) + 1}`;
    }
  };

  // Resolve Firebase Storage URLs on mount
  useEffect(() => {
    const fetchImageUrls = async () => {
      if (!displayStack?.supplements) return;
      
      const urlMap: {[key: string]: string} = {};
      
      for (const [index, supplement] of (displayStack.supplements || []).entries()) {
        try {
          // First, try to find the supplement in the database
          const databaseMatch = await findSupplementByName(supplement.name);
          
          if (databaseMatch) {
            // Use the database ID for the image
            const imagePath = getSupplementImagePath(databaseMatch);
            try {
              const imageRef = ref(storage, imagePath);
              const downloadUrl = await getDownloadURL(imageRef);
              urlMap[supplement.name] = downloadUrl;
              console.log(`✅ Found database match for ${supplement.name}: ${databaseMatch.id} → ${imagePath}`);
              continue;
            } catch (firebaseError) {
              console.log(`❌ Firebase image not found for database match ${databaseMatch.id}, trying fallback`);
            }
          }
          
          // Fallback: Use the original logic
          const imageId = getImageForSupplement(supplement, index);
          
          try {
            const firebasePath = `supplement-images/${imageId}.jpg`;
            const imageRef = ref(storage, firebasePath);
            const downloadUrl = await getDownloadURL(imageRef);
            urlMap[supplement.name] = downloadUrl;
            console.log(`✅ Found fallback Firebase image for ${supplement.name}: ${imageId}.jpg`);
          } catch (firebaseError) {
            console.log(`❌ Firebase image not found for ${supplement.name}, trying Amazon fallback`);
            // If all fails, try Amazon URL
            if (supplement?.imageUrl && supplement.imageUrl.startsWith('https://')) {
              urlMap[supplement.name] = supplement.imageUrl;
              console.log(`🔄 Using Amazon fallback for ${supplement.name}:`, supplement.imageUrl);
            }
          }
          
        } catch (error) {
          console.error(`❌ Failed to resolve image for ${supplement.name}:`, error);
          // If all fails, try Amazon URL
          if (supplement?.imageUrl && supplement.imageUrl.startsWith('https://')) {
            urlMap[supplement.name] = supplement.imageUrl;
            console.log(`🔄 Using Amazon fallback after error for ${supplement.name}:`, supplement.imageUrl);
          }
        }
      }
      
      setResolvedImageUrls(urlMap);
    };

    fetchImageUrls();
  }, [displayStack?.supplements]);

  const handlePurchase = () => {
    // Add entire stack to cart
    const supplements = displayStack?.supplements || [];
    
    if (supplements.length === 0) {
      console.log('No supplements to add to cart');
      return;
    }
    
    // Add each supplement to cart
    supplements.forEach((supplement) => {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          supplementName: supplement.name,
          name: supplement.name,
          brand: supplement.brand,
          dosage: supplement.dosage,
          timing: supplement.timing,
          reasoning: supplement.reasoning,
          price: supplement.price,
          imageUrl: supplement.imageUrl,
          affiliateUrl: supplement.affiliateUrl,
          quantity: 1
        } as CartItem
      });
    });
    
    toast({
      title: "Added to Cart",
      description: `Added ${supplements.length} supplements to your cart`,
    });
    
    // Also call the original onPurchase if it exists
    if (onPurchase) {
      onPurchase(displayStack);
    }
  };

  const handleLearnMore = () => {
    console.log('Learn more about:', displayStack.name);
  };

  const handleViewProductDetails = (supplementName: string) => {
    const supplement = (displayStack?.supplements ?? []).find(s => s?.name === supplementName);
    if (supplement?.affiliateUrl) {
      window.open(supplement.affiliateUrl, '_blank');
    }
  };

  const handleAddToCart = (supplementName: string) => {
    const supplement = (displayStack?.supplements ?? []).find(s => s?.name === supplementName);
    if (supplement) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          supplementName: supplement.name,
          name: supplement.name,
          brand: supplement.brand,
          dosage: supplement.dosage,
          timing: supplement.timing,
          reasoning: supplement.reasoning,
          price: supplement.price,
          imageUrl: supplement.imageUrl,
          affiliateUrl: supplement.affiliateUrl,
          quantity: 1
        } as CartItem
      });
      
      toast({
        title: "Added to Cart",
        description: `${supplement.name} added to your cart`,
      });
    }
  };

  // Helper function to format price properly
  const formatPrice = (price: any): string => {
    if (typeof price === 'number') {
      return price.toFixed(2);
    }
    if (typeof price === 'string') {
      // Remove any existing $ signs and parse
      const cleanPrice = price.replace(/\$/g, '');
      const numPrice = parseFloat(cleanPrice);
      if (!isNaN(numPrice)) {
        return numPrice.toFixed(2);
      }
    }
    return '0.00';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {displayStack.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{Math.round((displayStack?.userSuccessRate ?? 0) * 100)}% success rate</span>
              </div>
              <div className="flex items-center gap-1">
                <FlaskConical className="w-4 h-4" />
                <span>{displayStack.scientificBacking?.studyCount ?? 0} studies</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{displayStack.timeline}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${formatPrice(displayStack?.totalMonthlyCost ?? 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total monthly cost
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              *Excludes tax & shipping from Amazon
            </div>
          </div>
        </div>

        {/* Evidence Score Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Evidence Quality Score</span>
            <span className="text-sm font-bold text-primary">
              {displayStack.evidenceScore}/10
            </span>
          </div>
          <Progress value={displayStack.evidenceScore * 10} className="h-2" />
        </div>

        {/* Key Benefits */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(displayStack?.synergies ?? []).slice(0, 3).map((synergy, index) => (
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
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="supplements" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Supplements</TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Overview</TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Scientific Evidence</TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Expected Results</TabsTrigger>
          </TabsList>

          <TabsContent value="supplements" className="mt-6">
            <div className="space-y-4">
              {(displayStack?.supplements ?? []).map((supplement, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {resolvedImageUrls[supplement.name] && !imageErrors[supplement.name] ? (
                          <div className="relative group">
                            <Image
                              src={resolvedImageUrls[supplement.name]}
                              alt={supplement.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover border-2 border-border/20 group-hover:border-primary/50 transition-colors"
                              onError={() => handleImageError(supplement.name)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-muted/50 rounded-lg border-2 border-dashed border-border/30 flex items-center justify-center">
                            <span className="text-2xl">💊</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{supplement.name}</h3>
                            <p className="text-sm text-muted-foreground">{supplement.dosage}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">
                              ${formatPrice(supplement.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">per bottle*</div>
                            <div className="text-sm text-muted-foreground">{supplement.timing}</div>
                          </div>
                        </div>
                        <p className="text-sm mb-3 text-muted-foreground">{supplement.reasoning}</p>

                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddToCart(supplement.name)}
                            className="flex-1 text-xs"
                          >
                            Add to Cart
                          </Button>
                          {supplement.affiliateUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProductDetails(supplement.name)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <DollarSign className="w-3 h-3" />
                              Amazon
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {tabContent?.overview ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      About This Stack
                    </h3>
                    <p className="text-muted-foreground mb-4">{tabContent.overview.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Benefits</h4>
                    <ul className="space-y-2">
                      {tabContent.overview.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{tabContent.overview.successRate}</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{tabContent.overview.timeline}</div>
                        <div className="text-xs text-muted-foreground">Timeline</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">${formatPrice(tabContent.overview.totalCost)}</div>
                        <div className="text-xs text-muted-foreground">Total Cost*</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{displayStack.supplements.length}</div>
                        <div className="text-xs text-muted-foreground">Supplements</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading overview content...</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Scientific Evidence Tab */}
          <TabsContent value="evidence" className="mt-6">
            <div className="space-y-6">
              {tabContent?.scientificEvidence ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Research Foundation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{tabContent.scientificEvidence.studyCount}</div>
                        <div className="text-sm text-muted-foreground">Clinical Studies</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{tabContent.scientificEvidence.qualityScore}/10</div>
                        <div className="text-sm text-muted-foreground">Evidence Quality</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Research Findings</h4>
                    <ul className="space-y-2">
                      {tabContent.scientificEvidence.keyFindings.map((finding: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Recent Citations</h4>
                    <ul className="space-y-1">
                      {tabContent.scientificEvidence.citations.map((citation: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground italic">
                          • {citation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading scientific evidence...</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Expected Results Tab */}
          <TabsContent value="results" className="mt-6">
            <div className="space-y-6">
              {tabContent?.expectedResults ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Timeline & Results
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Short Term (1-2 weeks)</h4>
                        <p className="text-blue-800 text-sm">{tabContent.expectedResults.shortTerm}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Medium Term (4-6 weeks)</h4>
                        <p className="text-green-800 text-sm">{tabContent.expectedResults.mediumTerm}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Long Term (8-12 weeks)</h4>
                        <p className="text-purple-800 text-sm">{tabContent.expectedResults.longTerm}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Detailed Timeline</h4>
                    <div className="space-y-3">
                      {tabContent.expectedResults.timeline.map((phase: any, index: number) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-medium min-w-fit">
                            {phase.period}
                          </div>
                          <div className="text-sm text-muted-foreground">{phase.effect}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Individual Variation</h4>
                    <p className="text-yellow-800 text-sm">{tabContent.expectedResults.individualVariation}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading expected results...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        
        {/* Pricing Disclaimer */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            *Pricing based on typical 30-day supply per bottle. Final prices, tax, and shipping calculated at Amazon checkout. 
            Prices subject to change.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? 'Loading...' : 'Add Stack to Cart'}
          </Button>
          <Button
            onClick={handleLearnMore}
            variant="outline"
            size="lg"
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplementStackCard;
