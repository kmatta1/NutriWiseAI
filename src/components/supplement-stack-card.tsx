'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, ExternalLink, Clock, Target, Zap, Award, CheckCircle, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SupplementStackCardProps {
  stack: any;
  onPurchase: (stack: any) => void;
  isLoading?: boolean;
}

export function SupplementStackCard({ stack, onPurchase, isLoading = false }: SupplementStackCardProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (supplementName: string) => {
    setImageErrors(prev => new Set([...prev, supplementName]));
  };

  const getImageUrl = (supplement: any): string | null => {
    // Return the raw image URL stored in the database
    console.log(`🖼️ Image URL for ${supplement.name}:`, supplement.imageUrl);
    return supplement.imageUrl ?? null;
  };

  if (!stack || !stack.supplements) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No supplement data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-black text-foreground mb-2">
              {stack.name || "Your Elite Supplement Stack"}
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {stack.description || "Scientifically formulated supplement stack optimized for your goals."}
            </p>
          </div>
          
          {/* Stack Metrics */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Target className="w-4 h-4 mr-1" />
              {stack.supplements?.length || 0} Supplements
            </Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Zap className="w-4 h-4 mr-1" />
              ${stack.totalMonthlyCost?.toFixed(2) || '0.00'}/month
            </Badge>
            {stack.evidenceScore && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Award className="w-4 h-4 mr-1" />
                {stack.evidenceScore}/10 Evidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 lg:p-8">
        {/* Supplements Grid */}
        <div className="grid gap-6 mb-8">
          {stack.supplements.map((supplement: any, index: number) => {
            const imageUrl = getImageUrl(supplement);
            const hasImageError = imageErrors.has(supplement.name);
            
            return (
              <Card key={index} className="border border-border/30 hover:border-primary/30 transition-all duration-200 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image - Only show if imageUrl exists */}
                    {imageUrl && !hasImageError && (
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={supplement.name}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                          onError={() => handleImageError(supplement.name)}
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {supplement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {supplement.brand || 'Premium Brand'}
                        </p>
                      </div>

                      {/* Description */}
                      {supplement.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {supplement.description}
                        </p>
                      )}

                      {/* Dosage & Timing */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">Dosage:</span>
                          <span className="text-muted-foreground">{supplement.dosage || '1 serving'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium">Timing:</span>
                          <span className="text-muted-foreground">{supplement.timing || 'With meals'}</span>
                        </div>
                      </div>

                      {/* Price & Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-primary">
                            {typeof supplement.price === 'string' ? supplement.price : `$${supplement.price?.toFixed(2) || '29.99'}`}
                          </div>
                          {supplement.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{supplement.rating}/5</span>
                              <span className="text-xs text-muted-foreground">
                                ({supplement.reviewCount || '1000'} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick Purchase Button */}
                        {supplement.affiliateUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(supplement.affiliateUrl, '_blank')}
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Amazon
                          </Button>
                        )}
                      </div>

                      {/* Scientific Evidence */}
                      {supplement.evidenceLevel && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm">Scientific Evidence</span>
                            <Badge variant="outline" className="text-xs">
                              {supplement.evidenceLevel} level
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {supplement.reasoning || 'Backed by scientific research for safety and efficacy.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-8" />

        {/* Stack Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Expected Results */}
          {stack.expectedResults && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Expected Results
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Timeline:</strong> {stack.timeline || stack.expectedResults.timeline || 'Results typically seen within 2-8 weeks'}
                </p>
                {stack.expectedResults.benefits && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {stack.expectedResults.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {stack.safetyNotes && stack.safetyNotes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Safety Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                {stack.safetyNotes.slice(0, 3).map((note: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Scientific Rationale */}
        {stack.scientificRationale && (
          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Scientific Foundation
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {stack.scientificRationale}
            </p>
          </div>
        )}

        {/* Purchase Actions */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Ready to Transform Your Performance?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            This scientifically-optimized stack is personalized for your goals and backed by research.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => onPurchase(stack)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add Complete Stack to Cart
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold text-primary">
                Total: ${stack.totalMonthlyCost?.toFixed(2) || '0.00'}/month
              </div>
              <div>Free shipping on orders over $35</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplementStackCard;
