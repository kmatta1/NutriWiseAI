"use client";

import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!email || !password || !firstName || !lastName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all fields."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password should be at least 6 characters."
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName} ${lastName}`;
      
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);
      
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account."
      });
      
      // Auth state will be automatically updated by onAuthStateChanged
      router.push('/verify-email');
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during signup.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both email and password."
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Login Successful!",
        description: "Welcome back!"
      });
      
      // Auth state will be automatically updated by onAuthStateChanged
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during login.";
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/user-not-found') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address."
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      
      toast({
        title: "Reset Email Sent",
        description: "Please check your inbox for password reset instructions."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to send reset email. Please check the address and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Failed to sign out. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    login,
    resetPassword,
    logout,
    isLoading
  };
}
