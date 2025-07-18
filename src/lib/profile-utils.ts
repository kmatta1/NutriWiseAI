"use client";

import { getFirebaseFirestore } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserProfile } from "./types";
import { SupplementAdvisorInputSchema, SupplementAdvisorOutputSchema } from "./types";
import { z } from "zod";

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

export async function getOrCreateUserProfile(user: User, initialPlanJson?: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  console.log("🔍 getOrCreateUserProfile called for user:", user.email);
  const firestore = getFirebaseFirestore();
  const userDocRef = doc(firestore, "users", user.uid);

  try {
    console.log("🔍 Checking if user document exists...");
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log("✅ User document exists, loading profile...");
      const data = userDoc.data();
      const sub = data.subscription;
      let isPremium = false;
      if (sub?.status === 'active' && sub.endDate) {
          const endDate = sub.endDate?.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
          isPremium = endDate > new Date();
      }

      const profile: UserProfile = {
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        isAdmin: data.isAdmin ?? false,
        isPremium: isPremium,
        subscription: sub,
      };
      return { success: true, profile };
    } else {
      console.log("🔨 User document doesn't exist, creating new profile...");
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`;

      const newUserProfileData = {
        email: user.email,
        displayName: displayName,
        photoURL: photoURL,
        createdAt: serverTimestamp(),
        isAdmin: false,
      };

      console.log("🔨 Writing new user profile to Firestore...", newUserProfileData);
      await setDoc(userDocRef, newUserProfileData);
      console.log("✅ User profile created successfully");
      
      if (initialPlanJson) {
        console.log("🔨 Saving initial plan for user...");
        await saveInitialPlanForUser(user.uid, initialPlanJson);
      }

      const profile: UserProfile = {
        ...newUserProfileData,
        createdAt: new Date().toISOString(),
        isPremium: false,
      };

      console.log("✅ New user profile created and returned:", profile);
      return { success: true, profile };
    }
  } catch (error: any) {
    console.error("❌ Error in getOrCreateUserProfile:", error);
    return { success: false, error: error.message };
  }
}
