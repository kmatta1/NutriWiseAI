
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, TestTube, Dumbbell, Sparkles, ArrowRight, Play, Shield, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {

  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "AI-Powered Intelligence",
      description: "Advanced algorithms analyze your unique physiology, goals, and lifestyle to create your perfect supplement protocol.",
      badge: "Cutting Edge"
    },
    {
      icon: <TestTube className="w-8 h-8 text-primary" />,
      title: "Research-Validated",
      description: "Every recommendation is backed by peer-reviewed studies and clinical research from leading nutrition journals.",
      badge: "Science Based"
    },
    {
      icon: <Dumbbell className="w-8 h-8 text-primary" />,
      title: "Performance Focused",
      description: "Whether you're building muscle, cutting fat, or enhancing endurance - get supplements that deliver results.",
      badge: "Results Driven"
    },
     {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Premium Experience",
      description: "No more guesswork. Get crystal-clear guidance and stop wasting money on ineffective supplements.",
      badge: "Elite Level"
    },
  ];

  const carouselImages = [
      {
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Athletic man doing battle rope training in modern gym",
        hint: "High-intensity battle rope workout"
      },
      {
        src: "https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        alt: "Strong woman performing barbell squats in gym",
        hint: "Professional strength training session"
      },
      {
        src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        alt: "Group fitness class with people working out together",
        hint: "Community fitness training session"
      },
  ]
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center text-white overflow-hidden">
        <Carousel
          className="absolute inset-0 w-full h-full z-0"
          plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
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
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-[5]"></div>

        <div className="container px-4 md:px-6 z-10 text-center relative">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-primary">Trusted by 50,000+ Elite Athletes</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter font-headline animate-fade-in-up bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
                ELITE LEVEL<br />
                <span className="text-primary">NUTRITION</span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-2xl md:text-3xl text-white/90 mt-12 animate-fade-in-up animation-delay-300 font-bold leading-relaxed">
                Stop guessing. Start dominating. Get AI-powered supplement recommendations that elite athletes use to crush their goals.
              </p>
              
              <div className="mt-16 flex flex-col sm:flex-row gap-8 justify-center animate-fade-in-up animation-delay-600">
                <Button asChild size="lg" className="btn-primary text-2xl px-16 py-10 rounded-full shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-105 font-black">
                  <Link href="/advisor">
                    GET MY ELITE PLAN
                    <ArrowRight className="ml-4 w-8 h-8" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-xl px-12 py-10 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 font-bold">
                  <Link href="#features">
                    <Play className="mr-3 w-6 h-6" />
                    WATCH DEMO
                  </Link>
                </Button>
              </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 md:py-40 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
           <div className="flex flex-col items-center justify-center space-y-8 text-center mb-24">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter font-headline">
                    Why <span className="text-primary">Elite Athletes</span> Choose Us
                </h2>
                <p className="max-w-3xl text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed">
                    We combine cutting-edge AI with proven nutritional science to give you an undeniable competitive advantage.
                </p>
            </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
             {features.map((feature, index) => (
                <div key={index} className="relative group card-hover">
                  <div className="h-full p-10 border-2 border-border/50 rounded-3xl bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-500 gradient-border">
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wide">
                      {feature.badge}
                    </div>
                    <div className="p-6 mb-8 bg-primary/10 rounded-2xl w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="font-black font-headline text-2xl mb-6">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-32 md:py-40 bg-gradient-to-r from-black via-zinc-900 to-black">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter font-headline text-white mb-8">
              <span className="text-primary">Real Athletes.</span> Real Results.
            </h2>
            <p className="max-w-3xl mx-auto text-white/80 text-xl md:text-2xl font-medium leading-relaxed">
              See how elite athletes are transforming their performance with AI-powered nutrition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 hover:border-primary/60 transition-all duration-500">
              <div className="aspect-[4/3] relative">
                <Image 
                  src="https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional bodybuilder showcasing results"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-3xl font-black text-primary mb-2">+15% Muscle Gain</div>
                  <p className="text-lg font-semibold">"NutriWise gave me the edge I needed to dominate my competition."</p>
                  <p className="text-white/70 mt-2">- Marcus T., Pro Bodybuilder</p>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 hover:border-primary/60 transition-all duration-500">
              <div className="aspect-[4/3] relative">
                <Image 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Athlete performing intense workout"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-3xl font-black text-primary mb-2">+22% Performance</div>
                  <p className="text-lg font-semibold">"My endurance and strength skyrocketed in just 3 weeks."</p>
                  <p className="text-white/70 mt-2">- Sarah K., Olympic Athlete</p>
                </div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 hover:border-primary/60 transition-all duration-500">
              <div className="aspect-[4/3] relative">
                <Image 
                  src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Fitness coach training with client"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-3xl font-black text-primary mb-2">+30% Recovery</div>
                  <p className="text-lg font-semibold">"I train harder and recover faster than ever before."</p>
                  <p className="text-white/70 mt-2">- David R., CrossFit Champion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 md:py-40 bg-black overflow-hidden">
         <div className="absolute inset-0">
            <Image 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Elite athlete in action"
                fill
                sizes="100vw"
                className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black"></div>
         </div>
        <div className="container mx-auto relative text-center text-white z-10 px-4 md:px-6 max-w-6xl">
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter font-headline">
              READY TO <span className="text-primary">DOMINATE</span>?
            </h2>
            
            <p className="mx-auto max-w-4xl text-white/90 text-xl md:text-2xl font-bold leading-relaxed">
              Your competition is already using AI-powered nutrition. Get your elite supplement protocol and leave them in the dust.
            </p>
            
            <Button asChild size="lg" className="btn-primary text-2xl px-16 py-8 rounded-full shadow-2xl shadow-primary/50 transition-all duration-300 hover:scale-105 font-black">
              <Link href="/advisor">
                GET MY ELITE PLAN NOW
                <ArrowRight className="ml-4 w-8 h-8" />
              </Link>
            </Button>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-white/70 text-base md:text-lg pt-8">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <span className="font-semibold">No credit card required</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <span className="font-semibold">Used by pro athletes worldwide</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <span className="font-semibold">See results in 2 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
