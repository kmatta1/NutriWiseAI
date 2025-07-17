
"use client";

import type { SupplementAdvisorOutput, SupplementSuggestion } from "@/lib/types";
import { useAppContext } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Lock, MessageSquarePlus, Sparkles, ShoppingCart, Crown, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

const proFeatures = [
    "Specific brand and product recommendations",
    "Precise dosage and timing schedule",
    "Detailed scientific data & user reviews",
    "Affiliate links for easy purchasing",
    "Full access to AI Chatbot for follow-up questions",
    "Save your plan and track your progress"
];

type UnlockedResultsProps = {
  results: SupplementAdvisorOutput;
  onAskAboutStack: () => void;
  onAddToCart: (suggestion: SupplementSuggestion) => void;
};

const UnlockedResults = ({ results, onAskAboutStack, onAddToCart }: UnlockedResultsProps) => (
  <Card className="bg-background/30 backdrop-blur-lg border-border/20 shadow-2xl">
    <CardContent className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline mb-2">Your Personalized Supplement Stack</h2>
        <p className="text-muted-foreground">Here is the detailed plan our AI has crafted for you.</p>
      </div>

      <div className="space-y-6">
        {results.suggestions.map((suggestion, index) => {
          const isValidLink = suggestion.whereToOrder && (suggestion.whereToOrder.startsWith('http') || suggestion.whereToOrder.startsWith('https'));
          return (
            <Card key={index} className="overflow-hidden bg-muted/30 border-border/50">
              <div className="grid md:grid-cols-[150px_1fr] gap-6 p-4 items-start">
                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  <Image
                    src={suggestion.imageUrl || "https://placehold.co/150x150.png"}
                    alt={suggestion.supplementName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col h-full">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="font-headline text-xl">{suggestion.supplementName}</CardTitle>
                    <CardDescription>{suggestion.brand} - <span className="font-bold text-primary">{suggestion.price}</span></CardDescription>
                  </CardHeader>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="reviews">
                      <AccordionTrigger>User Reviews</AccordionTrigger>
                      <AccordionContent>{suggestion.userReviewsSummary}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="science">
                      <AccordionTrigger>Scientific Data</AccordionTrigger>
                      <AccordionContent>{suggestion.scientificDataSummary}</AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex-grow"></div>

                  <div className="pt-4 flex gap-4 items-center">
                    <Button onClick={() => onAddToCart(suggestion)} className="flex-grow">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button variant="outline" asChild disabled={!isValidLink}>
                      <a href={isValidLink ? suggestion.whereToOrder : undefined} target="_blank" rel="noopener noreferrer">Order Now</a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-muted/30 border-border/50">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Daily Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{results.dailySchedule}</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/50">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{results.additionalNotes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="secondary" size="lg" onClick={onAskAboutStack}>
          <MessageSquarePlus className="mr-2 h-5 w-5" />
          Ask Follow-up Questions
        </Button>
      </div>
    </CardContent>
  </Card>
);

const LockedResultsPreview = () => (
  <div className="grid md:grid-cols-2 gap-6 mt-8">
      <Card className="bg-muted/30 border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Lock className="text-primary" /> Daily Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-start">
            <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-full mt-2"></div>
            </div>
          </div>
           <div className="flex gap-2 items-start">
            <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-4/5 mt-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Lock className="text-primary" /> Additional Notes</CardTitle>
        </CardHeader>
         <CardContent className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
         </CardContent>
      </Card>
    </div>
)

type LockedResultsProps = {
  results: SupplementAdvisorOutput;
  user: any;
}

const LockedResults = ({ results, user }: LockedResultsProps) => {
  const { loadPromptAndOpenChat } = useAppContext();
  
  const signupLink = user ? '/subscribe' : '/signup';
  const buttonText = user ? 'Upgrade to Premium' : 'Create Account & Unlock';

  const handleAskAboutStack = () => {
    const supplementList = results.suggestions.map(s => s.supplementName).join(', ');
    const prompt = `I was just recommended this supplement stack: ${supplementList}. Could you tell me more about why this is a good combination for my goals?`;
    loadPromptAndOpenChat(prompt);
  };

  return (
    <Card className="bg-background/30 backdrop-blur-lg border-border/20 shadow-2xl">
      <CardContent className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-headline mb-2">Here's Your Free Plan Preview!</h2>
          <p className="text-muted-foreground">
            {user ? "Upgrade to Premium to unlock the full details and save this plan." : "Create a free account to save this preview and unlock the full plan."}
          </p>
        </div>

        <div className="space-y-6">
          {results.suggestions.map((suggestion, index) => (
            <Card key={index} className="overflow-hidden bg-muted/30 border-border/50">
              <div className="grid md:grid-cols-[150px_1fr] gap-6 p-4 items-start">
                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  <Image
                    src={suggestion.imageUrl || "https://placehold.co/150x150.png"}
                    alt={suggestion.supplementName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{suggestion.supplementName}</CardTitle>
                    <CardDescription>Full Details Unlocked with Premium</CardDescription>
                  </CardHeader>

                  <div className="flex-grow my-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-md bg-background/20">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Unlock Brand & Price</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-background/20">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Unlock Reviews & Scientific Data</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full sm:w-auto" variant="premium">
                      <Link href={signupLink}>
                        <Crown className="mr-2 h-4 w-4" /> {buttonText}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <LockedResultsPreview />

        <Card className="mt-8 bg-primary/10 border-primary/50">
          <CardHeader className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-2xl">Go Premium to Unlock Your Full Plan</CardTitle>
            <CardDescription>Get the full, actionable plan to accelerate your results.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground mb-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <Button size="lg" asChild variant="premium">
                <Link href={signupLink}>
                  <Crown className="mr-2 h-4 w-4" /> {buttonText}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="secondary" size="lg" onClick={handleAskAboutStack}>
            <MessageSquarePlus className="mr-2 h-5 w-5" />
            Ask AI About This Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdvisorResults({ results }: { results: SupplementAdvisorOutput }) {
  const { loadPromptAndOpenChat } = useAppContext();
  const { user, profile } = useAuth();
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAskAboutStack = () => {
    const supplementList = results.suggestions.map(s => s.supplementName).join(', ');
    const prompt = `I was just recommended this supplement stack: ${supplementList}. Could you tell me more about why this is a good combination for my goals?`;
    loadPromptAndOpenChat(prompt);
  };

  const handleAddToCart = (suggestion: SupplementSuggestion) => {
    dispatch({ type: "ADD_ITEM", payload: { ...suggestion, quantity: 1 } });
    toast({
      title: "Added to cart",
      description: `${suggestion.supplementName} has been added to your cart.`,
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {(!user || !profile?.isPremium) ? (
        <LockedResults results={results} user={user} />
      ) : (
        <UnlockedResults results={results} onAskAboutStack={handleAskAboutStack} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}
