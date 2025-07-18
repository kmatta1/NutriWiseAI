"use server";

import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile
} from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "./types";
import { SupplementAdvisorInputSchema, SupplementAdvisorOutputSchema } from "./types";
import { z } from "zod";

export interface FormState {
  error?: string;
  success?: boolean;
  message?: string;
  profile?: UserProfile;
}

export async function signup(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  
  if (!email || !password || !firstName || !lastName) {
    return { error: "Please fill out all fields." };
  }
   if (password.length < 6) {
    return { error: 'Password should be at least 6 characters.' };
  }

  try {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = `${firstName} ${lastName}`;
    
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    // Profile creation will be handled by the client-side auth state change

    return { success: true };

  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
        return { error: 'This email is already registered. Please login instead.' };
    }
    return { error: `An unexpected error occurred during signup: ${e.message}` };
  }
}


export async function login(_prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  try {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (e: any) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        return { error: "Invalid email or password." };
    }
    return { error: `An unexpected error occurred during login: ${e.message}` };
  }
}

export async function logout() {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Error during logout:", error);
    }
}


export async function resetPassword(_prevState: FormState | null, formData: FormData): Promise<FormState> {
    const email = formData.get("email") as string;
    if (!email) {
        return { error: "Please enter your email address." };
    }
    try {
        const auth = getFirebaseAuth();
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: "Password reset email sent. Please check your inbox." };
    } catch (e: any) {
        return { error: "Failed to send reset email. Please check the address and try again." };
    }
}

export async function saveInitialPlanForUser(userId: string, planJson: string) {
  try {
    const firestore = getFirebaseFirestore();
    const planData = JSON.parse(planJson);

    // Validate the plan data against our Zod schema
    const SavedPlanData = z.object({
      input: SupplementAdvisorInputSchema,
      output: SupplementAdvisorOutputSchema,
    });

    const parsedPlan = SavedPlanData.safeParse(planData);
    if (!parsedPlan.success) {
      console.error("Invalid plan data provided, cannot save:", parsedPlan.error.format());
      return;
    }
    
    const plansCollectionRef = collection(firestore, `users/${userId}/plans`);
    await addDoc(plansCollectionRef, {
      ...parsedPlan.data,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error(`Failed to save initial plan for user ${userId}:`, error);
  }
}
