# NutriWiseAI Technical Reference Guide

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Purpose:** Fast debugging and development reference to avoid re-analyzing codebase  
**Update Frequency:** Every code change/architecture update

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack
- **Framework:** Next.js 15.4.1 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth
- **AI APIs:** 
  - OpenAI GPT-4/5 (primary LLM)
  - Anthropic Claude (safe, explainable recommendations)
  - Google Gemini (multimodal analysis, image processing)
- **Data Services:**
  - Pinecone (vector database for semantic search/RAG)
  - Rainforest (e-commerce automation, Amazon integration)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context + localStorage

### Development Environment
- **Port:** localhost:9002
- **Shell:** PowerShell (Windows)
- **Build System:** Next.js build pipeline
- **Package Manager:** npm

---

## 📁 DIRECTORY STRUCTURE

```
src/
├── app/                         # Next.js App Router
│   ├── api/                     # API Routes (server-side)
│   │   ├── comprehensive-advisor/route.ts    # Main AI advisor API
│   │   ├── image/route.ts                    # Image proxy service
│   │   ├── admin/upgrade-user/route.ts       # Admin user management
│   │   └── test-*/route.ts                   # Testing endpoints
│   ├── advisor/page.tsx         # Main advisor form page
│   ├── my-plans/page.tsx        # User saved plans
│   ├── account/page.tsx         # User account management
│   ├── cart/page.tsx           # Shopping cart
│   └── layout.tsx              # Root layout with providers
├── components/                  # React Components
│   ├── ui/                     # Base UI components (shadcn/ui)
│   ├── advisor-form.tsx        # Main form component
│   ├── supplement-stack-card.tsx  # Result display component
│   ├── site-header.tsx         # Navigation header
│   └── admin-*.tsx             # Admin components
├── lib/                        # Core business logic
│   ├── comprehensive-ai-advisor.ts      # Main AI service
│   ├── product-catalog-service.ts       # Product database service
│   ├── dynamic-ai-advisor-service.ts    # Fallback AI service
│   ├── firebase.ts                      # Firebase configuration
│   ├── types.ts                         # TypeScript definitions
│   └── user-profile-store.ts            # Local storage management
├── contexts/                   # React Context providers
│   ├── auth-context.tsx        # Authentication state
│   ├── cart-context.tsx        # Shopping cart state
│   └── app-context.tsx         # Global app state
└── hooks/                      # Custom React hooks
    └── use-toast.tsx           # Toast notifications
```

---

## 🎯 CORE SERVICES & DATA FLOW

### 1. AI Advisor Service Chain
```
User Form → advisor/page.tsx → /api/comprehensive-advisor → ComprehensiveAIAdvisor
                                                         ↓
                          ProductCatalogService ← Firestore (33 products)
                                                         ↓
                          DynamicAIAdvisor (fallback) ← OpenAI/Anthropic APIs
                                                         ↓
                          SupplementStackCard ← User Interface
```

### 2. Data Sources
- **Products:** Firebase Firestore collection `supplements` (33 items across 13 categories)
- **User Profiles:** localStorage + Firebase Auth
- **Recommendations:** Generated real-time via AI APIs
- **Images:** Amazon URLs via proxy service `/api/image`

### 3. Core Business Logic Files

#### `src/lib/comprehensive-ai-advisor.ts`
- **Purpose:** Main AI recommendation engine
- **Key Methods:**
  - `generateComprehensiveRecommendation(userProfile)` - Main entry point
  - `generatePersonalizedStackName()` - Creates unique stack names
  - `generateAIReasoning()` - Uses OpenAI/Anthropic for explanations
- **Dependencies:** ProductCatalogService, OpenAI, Anthropic
- **Known Issues:** Stack name generation fails if `fitnessGoals` not array

#### `src/lib/product-catalog-service.ts`
- **Purpose:** Product database and recommendation logic  
- **Key Methods:**
  - `generatePersonalizedStack(userProfile)` - Core recommendation logic
  - `getCoreSupplements(profile, budget)` - Budget-aware selection
  - `generateStackName(userProfile)` - **⚠️ CRITICAL BUG LOCATION**
  - `generateStackDescription(userProfile)` - Stack descriptions
- **Data:** 33 products across categories (vitamins, minerals, protein, etc.)
- **Budget Logic:** Tiered thresholds ($15+ Vitamin D3, $25+ Omega-3, $35+ Magnesium)

#### `src/lib/dynamic-ai-advisor-service.ts`
- **Purpose:** Fallback AI service when comprehensive fails
- **Key Methods:**
  - `generatePersonalizedRecommendations(profile)` - Creates backup recommendations
  - `generatePersonalizedStackName()` - Alternative naming system
- **Features:** Age-based naming (Youth/Prime/Peak/Elite), activity levels

---

## 🐛 KNOWN ISSUES & DEBUGGING

### Current Bug: "Cannot read properties of undefined (reading '0')"
**Location:** `src/lib/product-catalog-service.ts:549`  
**Root Cause:** `userProfile.fitnessGoals[0]` where `fitnessGoals` is undefined  
**Data Flow Issue:** Form sends string, code expects array  
**Fix Applied:** Safe array/string handling in `generateStackName()`

### Error Patterns to Watch
1. **TypeError: Cannot read properties of undefined** - Usually profile field mismatches
2. **Firestore permission denied** - Firebase rules or auth issues  
3. **OpenAI API errors** - Rate limits or invalid API keys
4. **Image loading 404s** - Amazon image URLs blocked or proxy issues

### Debugging Commands
```powershell
# Check dev server status
Get-Process -Name "node"

# Test API directly
$profile = @{age=30; gender='male'; fitnessGoals=@('weight-lifting')} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:9002/api/comprehensive-advisor" -Method POST -Body $profile -ContentType "application/json"

# Clear Next.js cache
Remove-Item -Path ".next" -Recurse -Force
```

---

## 📊 DATA MODELS

### User Profile Structure
```typescript
interface UserProfile {
  age: number;
  gender: string;
  fitnessGoals: string[];        // ⚠️ Can be string OR array
  activityLevel: string;
  diet: string;
  sleepQuality: string;
  race: string;
  budget: number;
  healthConcerns: string[];
  weight: number;
  otherCriteria?: string;
}
```

### Product Structure (Firestore)
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;           // vitamins, minerals, protein, etc.
  subcategory: string;
  currentPrice: number;
  amazonUrl: string;
  imageUrl: string;          // Amazon CDN URLs
  healthBenefits: string[];
  dosage: string;
  timing: string;
}
```

### Recommendation Stack Structure
```typescript
interface SupplementStack {
  id: string;
  name: string;              // Generated by AI (personalized)
  description: string;
  supplements: Product[];
  totalMonthlyCost: number;
  expectedResults: {
    timeline: string;
    benefits: string[];
  };
  aiRationale: string;       // OpenAI/Anthropic generated
  confidenceScore: number;
}
```

---

## 🔌 API ROUTES

### `/api/comprehensive-advisor` (POST)
- **Purpose:** Main AI recommendation endpoint
- **Input:** UserProfile object
- **Output:** SupplementStack with AI reasoning
- **Error Handling:** Falls back to dynamic AI advisor
- **Performance:** ~2-15 seconds (includes AI API calls)

### `/api/image` (GET)
- **Purpose:** Proxy Amazon images to avoid CORS
- **Input:** `?url=<amazon-image-url>`
- **Output:** Proxied image stream
- **Allowed Domains:** media-amazon.com, images-amazon.com, etc.

### `/api/admin/upgrade-user` (POST)
- **Purpose:** Admin user management
- **Input:** `{email: string}`
- **Output:** Premium upgrade confirmation
- **Auth:** Admin only

---

## 🎨 UI COMPONENT HIERARCHY

### Main User Flow
```
app/advisor/page.tsx                    # Main advisor page
├── AdvisorForm                        # Form component
│   ├── FormField (Goals)              # Fitness goals selector
│   ├── FormField (Demographics)       # Age, gender, weight
│   ├── FormField (Lifestyle)          # Diet, activity, sleep
│   └── FormField (Health)             # Health concerns, budget
└── SupplementStackCard               # Results display
    ├── Tabs (Overview/Evidence)       # Tab navigation
    ├── SupplementItem[]              # Individual supplements
    └── ActionButtons                 # Add to cart, save plan
```

### Authentication Flow
```
AuthProvider (context)
├── Firebase Auth integration
├── User profile management
└── Premium status tracking
```

---

## 🔧 CONFIGURATION

### Environment Variables Required
```env
OPENAI_API_KEY=sk-...                 # OpenAI GPT-4o-mini
ANTHROPIC_API_KEY=sk-ant-...          # Claude-3-haiku fallback
FIREBASE_PROJECT_ID=nutriwise-ai
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

### Firebase Collections
- `supplements` - Product catalog (33 items)
- `users` - User profiles and auth
- `users/{uid}/plans` - Saved supplement stacks

### Key Constants
- **Product Count:** 33 supplements across 13 categories
- **Budget Tiers:** $15 (basic), $25 (standard), $35+ (premium)
- **AI Models:** GPT-4o-mini (primary), Claude-3-haiku (fallback)
- **Server Port:** 9002

---

## 🚨 CRITICAL FUNCTIONS TO MONITOR

### 1. Stack Name Generation
**File:** `src/lib/product-catalog-service.ts:548`  
**Risk:** High - Frequent source of undefined errors  
**Dependencies:** User profile structure consistency

### 2. AI API Calls
**Files:** `src/lib/comprehensive-ai-advisor.ts`  
**Risk:** Medium - Rate limits and API failures  
**Fallback:** Dynamic AI advisor service

### 3. Image Proxy Service
**File:** `src/app/api/image/route.ts`  
**Risk:** Medium - Amazon CORS and 404 issues  
**Dependencies:** External image CDNs

### 4. Firebase Queries
**Files:** Multiple service files  
**Risk:** Low - Generally stable  
**Dependencies:** Firestore rules and connectivity

---

## 📝 MAINTENANCE CHECKLIST

When making changes, update:
- [ ] This technical reference document
- [ ] TypeScript interfaces if data models change
- [ ] Error handling for new failure modes
- [ ] Environment variables if new APIs added
- [ ] Firebase security rules if collection structure changes
- [ ] Test user profiles in browser and API tests

---

## 🔍 QUICK DEBUGGING CHECKLIST

**"Same output every time" issues:**
1. Check `generateStackName()` for undefined array access
2. Verify user profile data structure in browser DevTools
3. Test with different user profiles via API
4. Check AI service fallback behavior

**Server errors:**
1. Check terminal output for specific error lines
2. Verify environment variables are loaded
3. Test Firebase connection
4. Clear Next.js cache and restart

**Image loading issues:**
1. Check Amazon URLs in browser Network tab  
2. Test image proxy API directly
3. Verify allowed domains in proxy service

---

**END OF TECHNICAL REFERENCE**
