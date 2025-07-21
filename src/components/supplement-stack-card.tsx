import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
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
  const [resolvedImageUrls, setResolvedImageUrls] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState('supplements');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageError = (supplementName: string) => {
    console.error(`❌ Firebase image failed to load for ${supplementName}`);
    setImageErrors(prev => ({
      ...prev,
      [supplementName]: true
    }));
  };

  // Database ID to image mapping based on Firestore structure
  const getImageForSupplement = (supplement: any, supplementIndex: number) => {
    const supplementName = supplement?.name?.toLowerCase() || '';
    
    // Based on the Firestore database structure shown, map specific supplements to their correct images
    // Looking at the database entry for "Turmeric Curcumin with BioPerine by BioSchwartz" 
    // which has id: "supplement_22" and category: "Joint & Bone Health"
    
    if (supplementName.includes('turmeric') || supplementName.includes('curcumin')) {
      return 'supplement_22'; // Matches the database entry we can see
    }
    
    // Map other supplements based on their database categories and types
    if (supplementName.includes('protein') || supplementName.includes('whey')) {
      return 'supplement_1';
    } else if (supplementName.includes('creatine')) {
      return 'supplement_2';
    } else if (supplementName.includes('pre-workout') || supplementName.includes('pre workout')) {
      return 'supplement_3';
    } else if (supplementName.includes('bcaa') || supplementName.includes('amino')) {
      return 'supplement_4';
    } else if (supplementName.includes('omega') || supplementName.includes('fish oil')) {
      return 'supplement_5';
    } else if (supplementName.includes('vitamin d')) {
      return 'supplement_6';
    } else if (supplementName.includes('magnesium')) {
      return 'supplement_7';
    } else if (supplementName.includes('probiotic')) {
      return 'supplement_8';
    } else if (supplementName.includes('melatonin')) {
      return 'supplement_9';
    } else if (supplementName.includes('multivitamin')) {
      return 'supplement_10';
    } else if (supplementName.includes('glucosamine') || supplementName.includes('joint')) {
      return 'supplement_22'; // Joint & Bone Health category
    } else if (supplementName.includes('green tea')) {
      return 'supplement_11';
    } else if (supplementName.includes('ashwagandha')) {
      return 'supplement_12';
    } else if (supplementName.includes('rhodiola')) {
      return 'supplement_13';
    } else if (supplementName.includes('bacopa')) {
      return 'supplement_14';
    } else if (supplementName.includes('lion\'s mane') || supplementName.includes('lions mane')) {
      return 'supplement_15';
    } else if (supplementName.includes('l-theanine')) {
      return 'supplement_16';
    } else if (supplementName.includes('ginkgo')) {
      return 'supplement_17';
    } else if (supplementName.includes('garcinia')) {
      return 'supplement_18';
    } else if (supplementName.includes('cla')) {
      return 'supplement_19';
    } else if (supplementName.includes('l-carnitine')) {
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
      if (!stack?.supplements) return;
      
      const storage = getStorage();
      const urlMap: {[key: string]: string} = {};
      
      for (const [index, supplement] of (stack.supplements || []).entries()) {
        try {
          // Get the correct image ID based on supplement name and database structure
          const imageId = getImageForSupplement(supplement, index);
          
          // Try to get Firebase Storage URL
          try {
            const firebasePath = `supplement-images/${imageId}.jpg`;
            const imageRef = ref(storage, firebasePath);
            const downloadUrl = await getDownloadURL(imageRef);
            urlMap[supplement.name] = downloadUrl;
            console.log(`✅ Found Firebase image for ${supplement.name}: ${imageId}.jpg`);
          } catch (firebaseError) {
            console.log(`❌ Firebase image not found for ${supplement.name}, trying Amazon fallback`);
            // If Firebase fails, try Amazon URL
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
  }, [stack?.supplements]);

  const handlePurchase = () => {
    onPurchase(stack);
  };

  const handleLearnMore = () => {
    console.log('Learn more about:', stack.name);
  };

  const handleViewProductDetails = (supplementName: string) => {
    const supplement = (stack?.supplements ?? []).find(s => s?.name === supplementName);
    if (supplement?.affiliateUrl) {
      window.open(supplement.affiliateUrl, '_blank');
    }
  };

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
                <span>{Math.round((stack?.userSuccessRate ?? 0) * 100)}% success rate</span>
              </div>
              <div className="flex items-center gap-1">
                <FlaskConical className="w-4 h-4" />
                <span>{stack.scientificBacking?.studyCount ?? 0} studies</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{stack.timeline}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${(stack?.totalMonthlyCost ?? 0)}/month
            </div>
            <div className="text-sm text-muted-foreground">
              vs ${Math.round((stack?.totalMonthlyCost ?? 0) * 1.4)} retail
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
          {(stack?.synergies ?? []).slice(0, 3).map((synergy, index) => (
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

          <TabsContent value="supplements" className="mt-6">
            <div className="space-y-4">
              {(stack?.supplements ?? []).map((supplement, index) => (
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
                              width={100}
                              height={100}
                              className="rounded-lg object-cover border border-border/50 hover:border-primary/30 transition-all duration-300"
                              onError={() => handleImageError(supplement.name)}
                              priority={index < 3}
                              unoptimized={supplement.imageUrl?.includes('placeholder')}
                            />
                          </div>
                        ) : (
                          <div className="w-[100px] h-[100px] bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-lg flex items-center justify-center border border-primary/30 hover:border-primary/50 transition-all duration-300 relative">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
                                <FlaskConical className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-xs font-bold text-foreground">
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
                              {supplement.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{supplement.dosage}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">${supplement.price}/month</div>
                            <div className="text-sm text-muted-foreground">{supplement.timing}</div>
                          </div>
                        </div>
                        <p className="text-sm mb-3 text-muted-foreground">{supplement.reasoning}</p>

                        {supplement.affiliateUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleViewProductDetails(supplement.name)}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            View Product Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tab contents remain the same */}
          <TabsContent value="overview" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              Overview content coming soon...
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              Evidence content coming soon...
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <div className="text-center py-8 text-muted-foreground">
              Results content coming soon...
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
      </CardContent>
    </Card>
  );
}

export default SupplementStackCard;
