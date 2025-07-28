/**
 * Utility to generate all possible advisor input permutations
 * Reads options from a config for extensibility
 */

// All selectable options (update as needed)
const fitnessGoals = [
  'weight-lifting',
  'enhanced-recovery',
  'hormone-support',
  'cardio',
  'sports-performance',
  'weight-loss',
  'general-health',
];
const activityLevels = [
  'sedentary',
  'light',
  'moderate',
  'very-active',
  'athlete',
];
const genders = ['male', 'female', 'other'];
const races = [
  'asian', 'black', 'hispanic', 'white', 'native_american',
  'pacific_islander', 'mixed', 'other', 'prefer_not_to_say',
];
const diets = [
  'balanced', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low-carb',
];
const sleepQualities = [
  'excellent', 'good', 'fair', 'poor', 'insomnia',
];
const healthConcerns = [
  'joint-pain', 'low-energy', 'stress-anxiety', 'poor-digestion',
  'focus-memory', 'sleep-issues', 'immune-system', 'inflammation',
  'heart-health', 'bone-health', 'hormone-balance', 'skin-hair',
];

// Helper to get all subsets (power set) for checkboxes
function getPowerSet(arr: string[]): string[][] {
  return arr.reduce(
    (subsets, value) => subsets.concat(subsets.map(set => [...set, value])),
    [[]] as string[][]
  );
}

// Generate all permutations (excluding age/weight/budget for tractability)
export function getAllAdvisorInputPermutations() {
  const healthConcernCombos = getPowerSet(healthConcerns);
  const permutations = [];
  for (const fitnessGoal of fitnessGoals)
    for (const activityLevel of activityLevels)
      for (const gender of genders)
        for (const race of races)
          for (const diet of diets)
            for (const sleepQuality of sleepQualities)
              for (const healthConcerns of healthConcernCombos) {
                permutations.push({
                  fitnessGoals: [fitnessGoal],
                  activityLevel,
                  gender,
                  race,
                  diet,
                  sleepQuality,
                  healthConcerns,
                  age: 30,
                  weight: 170,
                  budget: 100,
                  dietaryRestrictions: [],
                  currentSupplements: [],
                  experienceLevel: 'beginner',
                  lifestyle: '',
                });
              }
  return permutations;
}
