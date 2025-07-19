
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { getFirebaseFirestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function CheckoutForm() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const { user, refreshAuthStatus } = useAuth();
    const [loading, setLoading] = useState(false);

    const plan = searchParams.get('plan') || 'monthly';
    const price = plan === 'yearly' ? '$99.00' : '$12.00';
    const interval = plan === 'yearly' ? 'year' : 'month';

    const handleMockPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            variant: "default",
            title: "Demo Mode",
            description: "Payment processing is not implemented in this demo.",
        });
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
                <CardDescription>You are subscribing to the <span className="font-bold text-primary capitalize">{plan}</span> plan.</CardDescription>
            </CardHeader>
            <form onSubmit={handleMockPayment}>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label>Payment Method</Label>
                        <div className="space-y-2">
                             <Button variant="outline" className="w-full justify-start text-base py-6" type="button">
                                <CreditCard className="mr-4"/> Card
                            </Button>
                            {/* In a real app, these would open the respective payment modals */}
                            <Button variant="outline" className="w-full justify-start text-base py-6" type="button">
                               <svg className="mr-4 h-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48"><path fill="#009DDF" d="M24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20S35,4,24,4z"></path><path fill="#fff" d="M34,24c0,3.9-2.6,7.3-6.1,8.5l-1-4.1c1.8-0.8,3.1-2.5,3.1-4.5c0-2.8-2.2-5-5-5c-1.2,0-2.3,0.4-3.2,1.1 L23.2,20c0.9-0.3,1.9-0.5,3-0.5c2.8,0,5,2.2,5,5c0,0.6-0.1,1.2-0.3,1.8l-1.1-4.3c-0.1-0.4-0.5-0.7-1-0.6c-0.4,0.1-0.7,0.5-0.6,1 l2.2,8.5c-0.5,0.1-1.1,0.2-1.6,0.2c-2.8,0-5-2.2-5-5c0-2.1,1.3-3.9,3.1-4.6l1.1-4.2C21.9,15.2,19,18.8,19,23c0,4.7,3.5,8.6,8,9.4 V24H34z"></path><path fill="#fff" d="M24,4v8c-6.1,0-11.4,3.7-13.8,9h-2.9C10.2,12.2,16.6,4.8,24,4z"></path></svg>
                                PayPal
                            </Button>
                             <Button variant="outline" className="w-full justify-start text-base py-6" type="button">
                               <svg className="mr-4 h-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50"><path d="M 12.427734 0 C 6.1317344 0 1 5.1317344 1 11.427734 L 1 38.572266 C 1 44.868266 6.1317344 50 12.427734 50 L 37.572266 50 C 43.868266 50 49 44.868266 49 38.572266 L 49 11.427734 C 49 5.1317344 43.868266 0 37.572266 0 L 12.427734 0 z M 25.138672 6.546875 C 27.545672 6.546875 29.849156 7.399375 31.8125 8.9882812 C 32.1125 9.2182812 32.228672 9.6195313 32.029297 9.9472656 L 29.585938 13.855469 C 29.388937 14.181469 28.972969 14.300625 28.646484 14.101562 C 27.276484 13.241562 26.248672 12.787813 25.074219 12.787813 C 23.332219 12.787813 22.138672 13.834688 22.138672 15.345703 C 22.138672 17.228703 23.751328 17.882813 25.855469 17.882813 L 28.537109 17.882813 C 32.404109 17.882813 35.037109 19.957969 35.037109 23.535156 C 35.037109 27.605156 31.841688 29.988281 27.917969 29.988281 C 25.592969 29.988281 23.473516 29.284375 21.603516 28.1875 C 21.285516 27.9945 21.144375 27.595781 21.332031 27.265625 L 23.361328 23.865234 C 23.548328 23.535234 23.966406 23.393906 24.296875 23.582031 C 25.750875 24.472031 26.974219 24.935547 28.111328 24.935547 C 29.932328 24.935547 31.326172 24.136875 31.326172 22.712891 C 31.326172 20.800891 29.471484 20.248437 27.240234 20.248437 L 24.583984 20.248437 C 20.450984 20.248437 18.238281 22.251719 18.238281 25.736328 C 18.238281 29.176328 20.579187 32.453125 25.210938 32.453125 C 28.118937 32.453125 30.7075 31.470703 32.556641 29.900391 L 32.583984 29.882812 L 32.556641 38.699219 C 32.556641 38.897219 32.716406 39.056641 32.914062 39.056641 L 38.283203 39.056641 C 38.481203 39.056641 38.640625 38.897219 38.640625 38.699219 L 38.640625 15.548828 C 38.640625 10.925828 35.438937 7.9101562 30.6875 7.0371094 C 30.7115 6.9071094 30.732422 6.7792969 30.732422 6.6484375 C 30.732422 6.5054375 30.711484 6.3632812 30.689453 6.2226562 L 32.513672 2.9707031 C 32.701672 2.6407031 32.559531 2.2226562 32.229492 2.0351562 C 30.228492 0.73215625 27.768672 0 25.138672 0 C 22.421672 0 19.888203 0.79242188 17.882812 2.2207031 C 17.550812 2.4347031 17.411641 2.8444531 17.625 3.1757812 L 19.388672 6.2246094 C 19.467672 6.3566094 19.539141 6.486875 19.599609 6.6152344 C 19.569609 6.5932344 19.541094 6.5722656 19.513672 6.546875 C 21.411672 5.092875 23.633672 4.1386719 26.046875 4.1386719 C 26.084875 4.1386719 26.121328 4.1398437 26.158203 4.140625 C 23.834203 4.580625 22.023438 5.6796875 20.300781 7.2148438 C 19.988781 7.4848437 19.957187 7.9490625 20.236328 8.28125 L 22.482422 10.941406 C 22.756422 11.265406 23.221563 11.309219 23.568359 11.050781 C 24.364359 10.460781 25.138672 9.9433594 26.173828 9.9433594 C 27.498828 9.9433594 28.029297 10.648438 28.029297 11.458984 C 28.029297 12.011984 27.763281 12.443359 27.181641 12.787109 C 27.151641 12.804109 27.120625 12.822656 27.089844 12.841797 C 26.791844 13.023797 26.666641 13.398672 26.835938 13.699219 L 28.919922 17.214844 C 29.089922 17.514844 29.458594 17.652344 29.759766 17.478516 C 30.139766 17.260516 30.347656 16.945312 30.347656 16.570312 C 30.347656 14.739313 28.794141 14.101562 27.025391 14.101562 C 25.680391 14.101562 24.628906 14.482422 23.732422 15.111328 C 23.401422 15.348328 22.955781 15.295156 22.695312 14.998047 L 20.302734 12.169922 C 19.986734 11.801922 19.923281 11.283203 20.199219 10.890625 C 21.677219 8.872625 23.400391 7.8261719 25.138672 6.546875 Z M 25 18 C 21.136 18 18 21.136 18 25 C 18 28.864 21.136 32 25 32 C 28.864 32 32 28.864 32 25 C 32 21.136 28.864 18 25 18 z M 25 20 C 27.764 20 30 22.236 30 25 C 30 27.764 27.764 30 25 30 C 22.236 30 20 27.764 20 25 C 20 22.236 22.236 20 25 20 z"></path></svg>
                                Apple Pay
                            </Button>
                             <Button variant="outline" className="w-full justify-start text-base py-6" type="button">
                                <Banknote className="mr-4"/> Bank Account
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-bold capitalize">{plan}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold">{price}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 font-bold text-lg">
                            <span>Total Due Today</span>
                            <span>{price}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" size="lg" className="w-full" disabled={loading || !user}>
                        {loading ? <Loader2 className="animate-spin" /> : `Pay ${price} and Subscribe`}
                    </Button>
                     <p className="text-xs text-muted-foreground text-center">By clicking, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.</p>
                </CardFooter>
            </form>
        </Card>
    )
}


export default function CheckoutPage() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-theme(height.14))] py-12 px-4">
             <Suspense fallback={<Skeleton className="w-full max-w-lg h-96"/>}>
                <CheckoutForm />
            </Suspense>
        </div>
    )
}
