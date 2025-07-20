"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            NutriWise AI
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Your AI-powered supplement advisor for personalized nutrition and fitness goals.
          </p>
          <div className="space-x-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Link href="/advisor">Get My Plan</Link>
            </Button>
            <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 text-lg">
              <Link href="/subscribe">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
