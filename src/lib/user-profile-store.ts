import { UserProfile } from './types';
import { SupplementStack } from './fallback-ai';

class UserProfileManager {
  private storageKey = 'nutriwise-user-profile';
  private formDataKey = 'nutriwise-form-data';
  private stacksKey = 'nutriwise-saved-stacks';

  // Get stored user profile
  getProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Save user profile
  saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  // Get last form data
  getFormData(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.formDataKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Save form data
  saveFormData(formData: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.formDataKey, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  // Get saved stacks
  getSavedStacks(): SupplementStack[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.stacksKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save a stack to user's plans
  saveStack(stack: SupplementStack): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedStacks = this.getSavedStacks();
      const existingIndex = savedStacks.findIndex(s => s.id === stack.id);
      
      if (existingIndex >= 0) {
        savedStacks[existingIndex] = { ...stack, savedAt: new Date().toISOString() } as SupplementStack & { savedAt: string };
      } else {
        savedStacks.push({ ...stack, savedAt: new Date().toISOString() } as SupplementStack & { savedAt: string });
      }
      
      localStorage.setItem(this.stacksKey, JSON.stringify(savedStacks));
    } catch (error) {
      console.error('Failed to save stack:', error);
    }
  }

  // Remove a stack from user's plans
  removeStack(stackId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedStacks = this.getSavedStacks();
      const filtered = savedStacks.filter(s => s.id !== stackId);
      localStorage.setItem(this.stacksKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove stack:', error);
    }
  }

  // Check if user has made changes since last recommendation
  hasProfileChanged(currentFormData: any): boolean {
    const lastFormData = this.getFormData();
    if (!lastFormData) return true;
    
    // Compare key fields
    const keyFields = ['age', 'gender', 'fitnessGoals', 'activityLevel', 'diet', 'healthConcerns', 'budget'];
    
    return keyFields.some(field => {
      return JSON.stringify(currentFormData[field]) !== JSON.stringify(lastFormData[field]);
    });
  }

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.formDataKey);
      localStorage.removeItem(this.stacksKey);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // Clear form data
  clearFormData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.formDataKey);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }
}

export const userProfileManager = new UserProfileManager();
