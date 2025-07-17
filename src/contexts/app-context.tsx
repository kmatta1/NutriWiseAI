
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { SupplementAdvisorInput, SupplementAdvisorOutput } from '@/lib/types';
import { useRouter } from 'next/navigation';

const RECOMMENDATION_CONTEXT_KEY = 'recommendationContext';

type RecommendationContext = {
  input: SupplementAdvisorInput;
  output: SupplementAdvisorOutput;
};

type AppContextType = {
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  initialPrompt: string;
  setInitialPrompt: (prompt: string) => void;
  loadPromptAndOpenChat: (prompt: string) => void;
  recommendationContext: RecommendationContext | null;
  setRecommendationContext: (context: RecommendationContext | null) => void;
  setAdvisorResults: (output: SupplementAdvisorOutput, input: SupplementAdvisorInput) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [recommendationContext, setRecommendationContext] = useState<RecommendationContext | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    try {
      const storedContext = sessionStorage.getItem(RECOMMENDATION_CONTEXT_KEY);
      if (storedContext) {
        setRecommendationContext(JSON.parse(storedContext));
      }
    } catch (e) {
      console.error("Failed to load recommendation context from session storage", e);
      // Clear potentially corrupted data
      sessionStorage.removeItem(RECOMMENDATION_CONTEXT_KEY);
    }
  }, []); // Empty dependency array ensures this runs once on mount.


  const loadPromptAndOpenChat = (prompt: string) => {
    setInitialPrompt(prompt);
    setChatOpen(true);
  };

  const handleSetRecommendationContext = useCallback((context: RecommendationContext | null) => {
    setRecommendationContext(context);
    if (typeof window !== 'undefined') {
      try {
        if (context) {
          sessionStorage.setItem(RECOMMENDATION_CONTEXT_KEY, JSON.stringify(context));
        } else {
          sessionStorage.removeItem(RECOMMENDATION_CONTEXT_KEY);
        }
      } catch (e) {
        console.error("Failed to update recommendation context in session storage", e);
      }
    }
  }, []);


  const setAdvisorResults = (output: SupplementAdvisorOutput, input: SupplementAdvisorInput) => {
    const context = { input, output };
    handleSetRecommendationContext(context);
    router.push('/advisor');
  };

  const value = useMemo(() => ({
    isChatOpen,
    setChatOpen,
    initialPrompt,
    setInitialPrompt,
    loadPromptAndOpenChat,
    recommendationContext,
    setRecommendationContext: handleSetRecommendationContext,
    setAdvisorResults,
  }), [isChatOpen, initialPrompt, recommendationContext, handleSetRecommendationContext]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
