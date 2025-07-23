// ...existing code...
import { collection, setDoc, doc } from "firebase/firestore";
import { enhancedAdvisorService } from "../src/lib/enhanced-advisor-service.ts";
import { USER_ARCHETYPES } from "../src/lib/cached-stacks-schema.ts";
import { db } from "../src/lib/firebase.ts";

async function generateAndExportAllStacks() {
  for (const archetype of USER_ARCHETYPES) {
    const input = {
      age: archetype.demographics.ageRange[0],
      gender: archetype.demographics.gender || "any",
      fitnessGoals: archetype.demographics.primaryGoals,
      dietaryRestrictions: archetype.criteria.dietaryRestrictions,
      currentSupplements: [],
      healthConcerns: archetype.criteria.healthConcerns,
      budget: archetype.criteria.budget,
      experienceLevel: archetype.criteria.experienceLevel,
      lifestyle: archetype.demographics.activityLevel,
      activityLevel: archetype.demographics.activityLevel,
      diet: "balanced",
      sleepQuality: "good",
      otherCriteria: "",
      race: undefined,
      weight: undefined
    };
    const result = await enhancedAdvisorService.getRecommendations(input);
    if (result.success && result.stack) {
      const stackId = result.stack.id || archetype.id;
      await setDoc(doc(collection(db, "cachedStacks"), stackId), result.stack);
      console.log(`✅ Exported stack: ${stackId}`);
    } else {
      console.error(`❌ Failed to generate stack for archetype: ${archetype.id}`);
    }
  }
  console.log("🎉 All stacks generated and exported to Firestore.");
}

// Run the export
generateAndExportAllStacks();
