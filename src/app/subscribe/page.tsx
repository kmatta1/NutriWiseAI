
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

const includedFeatures = [
    'Full AI Advisor Results',
    'Unlimited Fitness Tracking',
    'Full Community Access',
    'Save Unlimited Supplement Plans',
    'Priority Support'
];

export default function SubscribePage() {
  return (
    <div className="bg-secondary/20">
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-theme(height.14))] py-12 md:py-24 px-4">
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline">
            Go Premium. Unlock Your Full Potential.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            Choose a plan to get unlimited access to all features, including detailed recommendations, progress tracking, and community support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <Card className="border-primary border-2 shadow-xl shadow-primary/10 flex flex-col">
                 <CardHeader className="text-center p-6">
                    <CardTitle className="text-3xl font-headline">Monthly</CardTitle>
                    <CardDescription>
                        <span className="text-4xl font-bold text-foreground">$12</span> / month
                    </CardDescription>
                     <CardDescription>Billed monthly. Cancel anytime.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-6">
                    <ul className="space-y-3 text-muted-foreground">
                        {includedFeatures.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-primary"/>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="p-6">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/subscribe/checkout?plan=monthly">Choose Monthly</Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card className="flex flex-col">
                <CardHeader className="text-center p-6">
                    <CardTitle className="text-3xl font-headline">Yearly</CardTitle>
                    <CardDescription>
                         <span className="text-4xl font-bold text-foreground">$99</span> / year
                    </CardDescription>
                     <CardDescription>Save 30% with annual billing.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow p-6">
                     <ul className="space-y-3 text-muted-foreground">
                        {includedFeatures.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-primary"/>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                 <CardFooter className="p-6">
                    <Button asChild size="lg" className="w-full" variant="outline">
                        <Link href="/subscribe/checkout?plan=yearly">Choose Yearly</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
