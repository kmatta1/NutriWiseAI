
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getOrCreateUserProfile, logout } from '@/lib/auth-actions';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { UserProfile } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthInProgress: boolean;
  refreshAuthStatus: () => Promise<void>;
  googleSignIn: (initialPlanJson?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const authRoutes = ['/login', '/signup', '/forgot-password'];
const publicRoutes = ['/', '/advisor', '/subscribe', '/subscribe/checkout', '/cart'];
const verificationRoute = '/verify-email';

const isAuthRoute = (pathname: string) => authRoutes.some(route => pathname.startsWith(route));
const isPublicRoute = (pathname: string) => publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthInProgress, setAuthInProgress] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleAuthStateChange = useCallback(async (userState: User | null) => {
    setLoading(true);
    if (userState) {
        const { success, profile: fetchedProfile, error } = await getOrCreateUserProfile(userState);
        if (success && fetchedProfile) {
            setUser(userState);
            setProfile(fetchedProfile);
        } else {
            console.error("Profile fetch/create failed:", error);
            toast({ 
                variant: "destructive", 
                title: "Authentication Error", 
                description: "There was a problem loading your user profile. Please try logging in again." 
            });
            await logout(); // Logout if profile fails
            setUser(null);
            setProfile(null);
        }
    } else {
        setUser(null);
        setProfile(null);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  // Centralized redirection logic
  useEffect(() => {
    if (loading) return;

    const isVerified = user?.emailVerified ?? false;

    if (user) { // User is authenticated
      if (!isVerified && pathname !== verificationRoute) {
        // If not verified, redirect to verification page, unless they are already there.
        router.push(verificationRoute);
      } else if (isVerified && (isAuthRoute(pathname) || pathname === verificationRoute)) {
        // If verified, redirect away from auth/verification pages.
        const redirectUrl = searchParams.get('redirect') || '/tracker';
        router.push(redirectUrl);
      }
    } else { // User is not authenticated
      if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && pathname !== verificationRoute) {
        // If on a protected page, redirect to login.
        router.push(`/login?redirect=${pathname}`);
      }
    }
  }, [user, loading, pathname, router, searchParams]);
  
  const refreshAuthStatus = useCallback(async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      // The onAuthStateChanged listener will automatically pick up the change and re-run handleAuthStateChange
    }
  }, []);

  const googleSignIn = async (initialPlanJson?: string): Promise<void> => {
    if (isAuthInProgress) return;
    setAuthInProgress(true);
    const auth = getFirebaseAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle setting user/profile
      // and the redirection logic in this provider will handle navigation.
      // await getOrCreateUserProfile(result.user, initialPlanJson);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({
          variant: "destructive",
          title: "Google Sign-in Failed",
          description: `An unexpected error occurred: ${error.message}`,
        });
      }
    } finally {
      setAuthInProgress(false);
    }
  };

  const value = { user, profile, loading, isAuthInProgress, refreshAuthStatus, googleSignIn };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function GoogleButton({ initialPlanJson }: { initialPlanJson?: string }) {
  const { googleSignIn, isAuthInProgress } = useAuth();

  const handleGoogleClick = () => {
    googleSignIn(initialPlanJson).catch((err) => {
      // Error is handled inside googleSignIn, this is just to prevent unhandled promise rejections
    });
  };

  const buttonText = "Continue with Google";

  return (
    <Button 
      variant="outline" 
      className="w-full" 
      type="button" 
      disabled={isAuthInProgress}
      onClick={handleGoogleClick}
      data-testid="google-button"
    >
      {isAuthInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>}
      {isAuthInProgress ? "Please wait..." : buttonText}
    </Button>
  );
}
