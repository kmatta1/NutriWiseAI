
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight, BrainCircuit, TestTube, Dumbbell, Sparkles, PencilRuler, BarChart, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "Hyper-Personalized AI",
      description: "Our advanced AI analyzes your unique biology and goals to create a supplement plan that's precisely for you.",
    },
    {
      icon: <TestTube className="w-8 h-8 text-primary" />,
      title: "Science-Backed",
      description: "We recommend supplements with ingredients that are scientifically proven to be effective and safe for your peace of mind.",
    },
    {
      icon: <Dumbbell className="w-8 h-8 text-primary" />,
      title: "Achieve Goals Faster",
      description: "Whether building muscle, losing fat, or boosting endurance, get the right fuel to accelerate your results.",
    },
     {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Simple & Clear",
      description: "No more confusion. Get a clear, easy-to-follow plan, and stop wasting money on supplements that don't work for you.",
    },
  ];

  const carouselImages = [
      {
        src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1920&auto=format&fit=crop",
        alt: "Man doing battle ropes workout",
        hint: "man battle ropes"
      },
      {
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920&auto=format&fit=crop",
        alt: "Woman lifting weights",
        hint: "woman weights"
      },
      {
        src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1920&auto=format&fit=crop",
        alt: "Group fitness class",
        hint: "fitness class"
      },
  ]
  
  const howItWorksSteps = [
    {
      icon: <PencilRuler className="w-10 h-10 text-primary" />,
      title: "Tell Us About You",
      description: "Fill out our quick, confidential survey about your goals, lifestyle, and biometrics. The more we know, the better we can personalize."
    },
    {
      icon: <BarChart className="w-10 h-10 text-primary" />,
      title: "AI Analysis",
      description: "Our powerful AI cross-references your data with thousands of clinical studies, ingredient interactions, and user results."
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-primary" />,
      title: "Receive Your Plan",
      description: "Get your 100% personalized supplement stack and daily schedule, ready to help you achieve your goals."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-white overflow-hidden">
        <Carousel
          className="absolute inset-0 w-full h-full z-0"
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
          opts={{ loop: true }}
        >
          <CarouselContent className="h-full">
            {carouselImages.map((img, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative w-full h-full">
                  <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="100vw"
                      className="object-cover animate-ken-burns"
                      data-ai-hint={img.hint}
                      priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-[5]"></div>

        <div className="container px-4 md:px-6 z-10 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter font-headline animate-fade-in-up">
                Stop Guessing. <br /> Start Optimizing.
              </h1>
              <p className="max-w-xl mx-auto text-lg md:text-xl text-white/80 mt-6 animate-fade-in-up animation-delay-300">
                Your body is unique. Your supplements should be too. Let our AI build the perfect supplement stack for your body and goals, backed by science.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  <Link href="/advisor">Get My Free Plan <MoveRight className="ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-full">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter font-headline">
                    The Future of Personalized Nutrition
                </h2>
                <p className="max-w-3xl text-muted-foreground md:text-xl/relaxed">
                    We combine cutting-edge AI with proven nutritional science to give you an undeniable advantage.
                </p>
            </div>
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-start p-6 border rounded-xl bg-card hover:border-primary/50 hover:bg-card/90 transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
                  <div className="p-3 mb-4 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold font-headline text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter font-headline">
              Your Personalized Plan in 3 Easy Steps
            </h2>
            <p className="max-w-3xl text-muted-foreground md:text-xl/relaxed">
              Our streamlined process makes getting your supplement plan fast, easy, and accurate.
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            {/* Decorative line for larger screens */}
            <div className="hidden md:block absolute top-12 left-1/2 w-0.5 h-[calc(100%-6rem)] bg-border -translate-x-1/2"></div>

            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex md:items-center gap-8 mb-12 md:mb-0">
                {/* Step content */}
                <div className={`flex-1 ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
                  <h3 className="text-2xl font-bold font-headline mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Step number and icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center shadow-md ring-8 ring-muted/50">
                    {step.icon}
                  </div>
                  <span className="absolute -top-3 -left-3 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl ring-8 ring-muted/50">
                    {index + 1}
                  </span>
                </div>

                {/* Spacer for layout */}
                <div className={`hidden md:block flex-1`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative py-24 md:py-32 bg-black">
         <div className="absolute inset-0">
            <Image 
                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1920&auto=format&fit=crop"
                alt="Athlete working out"
                fill
                sizes="100vw"
                className="object-cover"
                data-ai-hint="athlete gym"
            />
            <div className="absolute inset-0 bg-black/70"></div>
         </div>
        <div className="container relative text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter font-headline mb-4">
              Ready to Unlock Your Potential?
            </h2>
            <p className="mx-auto max-w-2xl text-white/80 md:text-xl/relaxed mb-8">
              Take the first step towards optimized performance. Your body is unique; your supplements should be too. Get your science-backed supplement plan today.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              <Link href="/advisor">Get My Free Plan Preview</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
