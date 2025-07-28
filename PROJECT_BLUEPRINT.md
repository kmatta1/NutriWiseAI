# NutriWiseAI Project Blueprint

## 📋 Project Overview

**NutriWiseAI** is a comprehensive AI-powered supplement recommendation platform that provides personalized supplement stacks based on user profiles, scientific evidence, and advanced machine learning algorithms.

### 🎯 Mission Statement
To democratize personalized nutrition by providing AI-driven, evidence-based supplement recommendations that optimize health outcomes while ensuring safety and cost-effectiveness.

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 15.4.1)              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Landing   │  │   Advisor   │  │   Products  │  │   Cart  │ │
│  │    Page     │  │    Page     │  │    Page     │  │  Page   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      AI Processing Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   OpenAI    │  │  Anthropic  │  │   Pinecone  │  │Firebase │ │
│  │   GPT-4     │  │   Claude    │  │   Vector    │  │ Product │ │
│  │   LLM       │  │    LLM      │  │     DB      │  │Catalog  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Business Logic Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │Comprehensive│  │   Product   │  │   Dynamic   │  │ Amazon  │ │
│  │AI Advisor   │  │  Catalog    │  │AI Advisor   │  │ Affiliate│ │
│  │  Service    │  │  Service    │  │  Service    │  │ Service │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 15.4.1 (React 19.0.0)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

### Backend Services
- **Runtime**: Node.js 24.4.1
- **Package Manager**: npm
- **Module System**: ES Modules (ESM)

### AI & ML Stack
- **LLM Provider 1**: OpenAI GPT-4 Turbo
- **LLM Provider 2**: Anthropic Claude 3.5 Sonnet
- **Vector Database**: Pinecone (for RAG implementation)
- **Embeddings**: OpenAI text-embedding-3-large

### Database & Storage
- **Primary Database**: Firebase Firestore
- **Product Catalog**: Firebase Collections
- **Vector Storage**: Pinecone Indexes
- **Caching**: In-memory Map caches

### External Integrations
- **E-commerce**: Amazon Product Advertising API
- **Payment Processing**: Stripe (planned)
- **Analytics**: Custom analytics system

---

## 🧠 AI System Architecture

### Comprehensive AI Advisor (6-Phase System)

#### Phase 1: Scientific Evidence Retrieval (RAG)
```typescript
interface ScientificEvidence {
  studies: StudyMetadata[];
  totalStudies: number;
  avgRelevance: number;
}
```
- Queries vector database for relevant research
- Filters by evidence quality and relevance
- Returns scientific studies supporting recommendations

#### Phase 2: User Pattern Analysis (Collaborative Filtering)
```typescript
interface UserPatterns {
  users: SimilarUser[];
  avgSuccessRate: number;
  topStacks: string[];
}
```
- Finds users with similar demographics and goals
- Analyzes successful supplement stacks
- Extracts patterns from high-performing users

#### Phase 3: Product Candidate Selection
```typescript
interface CandidateProducts {
  products: ProductCatalogItem[];
  categoryDistribution: Record<string, number>;
  budgetCompatible: ProductCatalogItem[];
}
```
- Filters products by user goals and preferences
- Ensures budget compatibility
- Maintains category diversity

#### Phase 4: LLM Stack Generation
```typescript
interface LLMStackGeneration {
  llmProvider: 'openai' | 'anthropic';
  reasoning: string;
  selectedSupplements: LLMSupplement[];
  confidence: number;
}
```
- Uses advanced LLM reasoning for stack creation
- Incorporates scientific evidence and user patterns
- Provides detailed rationale

#### Phase 5: Synergy Optimization
```typescript
interface StackSynergies {
  synergies: string[];
  interactions: string[];
  optimizations: StackOptimization[];
}
```
- Identifies supplement combinations
- Detects potential interactions
- Optimizes dosing and timing

#### Phase 6: Final Analysis & Monitoring
```typescript
interface FinalAnalysis {
  expectedOutcomes: PredictedOutcomes;
  monitoringPlan: string[];
  adjustmentSchedule: string[];
  safetyConsiderations: SafetyWarnings;
}
```
- Predicts short/medium/long-term outcomes
- Creates monitoring protocols
- Establishes adjustment schedules

---

## 📊 Data Models

### User Profile
```typescript
interface ComprehensiveUserProfile {
  // Demographics
  age: number;
  gender: string;
  weight?: number;
  height?: number;
  bodyFatPercentage?: number;
  
  // Goals & Lifestyle
  primaryGoals: string[];
  secondaryGoals: string[];
  activityLevel: string;
  trainingType: string[];
  diet: string;
  sleepHours: number;
  stressLevel: string;
  
  // Health & Medical
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  supplementExperience: string;
  previousSupplements: string[];
  
  // Preferences & Constraints
  budget: number;
  maxSupplements: number;
  preferredBrands: string[];
  avoidIngredients: string[];
  
  // Tracking & Outcomes
  desiredOutcomes: string[];
  timeframe: string;
  complianceLevel: string;
}
```

### Product Catalog Item
```typescript
interface ProductCatalogItem {
  // Basic Information
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  
  // Serving & Dosage
  servingSize: string;
  servingsPerContainer: number;
  
  // Amazon Integration
  asin: string;
  amazonUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  currentPrice: number;
  primeEligible: boolean;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  
  // Nutritional Information
  activeIngredients: Ingredient[];
  recommendedDosage: DosageInfo;
  
  // Scientific Data
  evidenceLevel: 'high' | 'moderate' | 'limited' | 'preliminary';
  studyCount: number;
  citations: string[];
  
  // Quality & Safety
  qualityFactors: QualityMetrics;
  targetAudience: string[];
  tags: string[];
  contraindications: string[];
  drugInteractions: string[];
  sideEffects: string[];
  
  // Business Metrics
  commissionRate: number;
  costPerServing: number;
  isActive: boolean;
}
```

### Recommendation Output
```typescript
interface ComprehensiveSupplementStack {
  id: string;
  name: string;
  description: string;
  userProfile: ComprehensiveUserProfile;
  recommendations: AdvancedSupplementRecommendation[];
  
  // Stack-level Analysis
  totalMonthlyCost: number;
  budgetUtilization: number;
  overallEvidenceScore: number;
  predictedCompliance: number;
  expectedOutcomes: {
    shortTerm: string[]; // 2-4 weeks
    mediumTerm: string[]; // 2-3 months
    longTerm: string[]; // 6+ months
  };
  
  // Safety & Monitoring
  stackSynergies: string[];
  potentialInteractions: string[];
  monitoringPlan: string[];
  adjustmentSchedule: string[];
  
  // AI Reasoning
  aiRationale: string;
  confidenceScore: number;
  alternativeStacks: ComprehensiveSupplementStack[];
  
  // Business Intelligence
  estimatedRevenue: number;
  userSuccessProbability: number;
  
  createdAt: Date;
}
```

---

## 🗂️ Project Structure

```
NutriWiseAI/
├── 📁 src/
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📁 advisor/             # AI Advisor Page
│   │   │   └── page.tsx            # Main advisor interface
│   │   ├── 📁 products/            # Product Catalog
│   │   │   └── page.tsx            # Product listing page
│   │   ├── 📁 cart/                # Shopping Cart
│   │   │   └── page.tsx            # Cart management
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   │
│   ├── 📁 components/              # Reusable Components
│   │   ├── 📁 ui/                  # UI Primitives
│   │   │   ├── button.tsx          # Button component
│   │   │   ├── card.tsx            # Card component
│   │   │   ├── toast.tsx           # Toast notifications
│   │   │   └── [other-ui].tsx      # Other UI components
│   │   ├── advisor-form.tsx        # User profile form
│   │   ├── cart-provider.tsx       # Cart context provider
│   │   ├── navbar.tsx              # Navigation bar
│   │   ├── product-card.tsx        # Product display card
│   │   └── supplement-stack.tsx    # Stack recommendation display
│   │
│   └── 📁 lib/                     # Core Business Logic
│       ├── comprehensive-ai-advisor.ts    # Advanced AI system
│       ├── dynamic-ai-advisor.ts          # Dynamic recommendation engine
│       ├── minimal-ai-advisor.ts          # Simplified AI service  
│       ├── product-catalog-service.ts     # Product management
│       ├── amazon-affiliate-service.ts    # Amazon API integration
│       └── utils.ts                       # Utility functions
│
├── 📁 scripts/                     # Utility Scripts
│   ├── seed-comprehensive-products.js     # Product database seeding
│   ├── seed-minimal-ai.js                 # Minimal product seeding
│   ├── test-comprehensive-ai.js           # AI system testing
│   └── [other-scripts].js                # Other utility scripts
│
├── 📁 public/                      # Static Assets
│   └── [images, icons, etc.]       # Public resources
│
├── 📋 Configuration Files
├── package.json                    # Project dependencies
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript configuration
├── firebase.json                   # Firebase configuration
├── firestore.rules                 # Database security rules
├── firestore.indexes.json          # Database indexes
└── PROJECT_BLUEPRINT.md            # This documentation
```

---

## 🎯 Product Categories & Inventory

### Current Product Catalog (25 Strategic Products)

#### 🏋️ Muscle Building & Strength (7 products)
1. **Optimum Nutrition Gold Standard 100% Whey Protein** - $54.99
2. **Dymatize ISO100 Hydrolyzed Whey Protein Isolate** - $69.99
3. **Garden of Life Sport Organic Plant-Based Protein** - $44.99
4. **Creatine Monohydrate Powder by BulkSupplements** - $24.96
5. **Pre-Workout Supplement by Legion Pulse** - $39.99
6. **BCAA Energy Amino Acid Supplement by Cellucor C4** - $29.99
7. **Collagen Peptides Powder by Vital Proteins** - $43.99

#### 🔥 Fat Loss & Metabolism (5 products)
1. **Green Tea Extract Supplement by NOW Foods** - $12.99
2. **L-Carnitine 1000mg by Nutricost** - $18.99
3. **CLA 1250 Safflower Oil by Sports Research** - $26.99
4. **Garcinia Cambogia Extract by Nature's Bounty** - $14.99
5. **Caffeine Pills 200mg by ProLab** - $8.99

#### 🧠 Cognitive & Mental Health (5 products)
1. **L-Theanine 200mg by NOW Foods** - $16.99
2. **Lion's Mane Mushroom Extract by Host Defense** - $34.99
3. **Bacopa Monnieri Extract by Nutricost** - $19.99
4. **Ginkgo Biloba Extract by Nature's Bounty** - $12.99
5. **Ashwagandha Root Extract by Nutricost** - $21.99

#### 💤 Sleep & Recovery (4 products)
1. **Melatonin 3mg by Nature Made** - $9.99
2. **ZMA Zinc Magnesium by NOW Foods** - $19.99
3. **Magnesium Glycinate 400mg by Doctor's Best** - $18.99
4. **Turmeric Curcumin with BioPerine by BioSchwartz** - $24.99

#### 🌟 Essential Health (4 products)
1. **Omega-3 Fish Oil 1200mg by Nature Made** - $22.99
2. **Vitamin D3 5000 IU by NOW Foods** - $14.99
3. **Probiotics 50 Billion CFU by Physician's Choice** - $29.99
4. **Multivitamin by Garden of Life Vitamin Code Men** - $39.99

**Total Catalog Value**: $647.72
**Average Product Price**: $25.91
**Price Range**: $8.99 - $69.99

---

## 🚀 Core Features

### 1. AI-Powered Recommendation Engine
- **Multi-LLM Architecture**: OpenAI GPT-4 + Anthropic Claude
- **RAG Implementation**: Scientific evidence retrieval
- **Personalization**: Demographics, goals, medical history
- **Evidence-Based**: Study counts, citations, mechanisms
- **Safety Analysis**: Contraindications, drug interactions

### 2. Comprehensive User Profiling
- **Demographics**: Age, gender, weight, height, body composition
- **Goals**: Primary/secondary fitness and health objectives
- **Lifestyle**: Activity level, diet, sleep, stress management
- **Medical**: Conditions, medications, allergies, experience
- **Preferences**: Budget, brands, ingredients to avoid

### 3. Scientific Evidence Integration
- **Study Database**: Curated research on supplement efficacy
- **Evidence Levels**: High, moderate, limited, preliminary
- **Citation System**: PubMed links and study references
- **Mechanism Data**: How supplements work biologically
- **Safety Data**: Side effects and contraindication warnings

### 4. Synergy & Interaction Analysis
- **Positive Synergies**: Supplement combinations that enhance effects
- **Negative Interactions**: Combinations to avoid
- **Timing Optimization**: When to take each supplement
- **Dosage Adjustment**: Personalized dosing recommendations

### 5. Budget Optimization
- **Cost-Benefit Analysis**: Value per dollar spent
- **Budget Constraints**: Stays within user-defined limits
- **Price Monitoring**: Tracks Amazon price changes
- **Alternative Suggestions**: Lower-cost equivalent options

### 6. Monitoring & Adjustment System
- **Progress Tracking**: Expected timeline for results
- **Monitoring Plans**: What to watch for and measure
- **Adjustment Schedules**: When to modify the stack
- **Success Prediction**: Likelihood of achieving goals

---

## 💼 Business Model

### Revenue Streams
1. **Amazon Affiliate Commission**: 8% average commission rate
2. **Premium Consultations**: Advanced AI analysis (planned)
3. **Subscription Service**: Monthly personalized updates (planned)
4. **Brand Partnerships**: Featured product placements (planned)

### Key Metrics
- **Average Order Value**: $75-150 per recommendation
- **Conversion Rate**: Target 15-25%
- **Customer Lifetime Value**: $300-500 annually
- **Monthly Revenue Potential**: $10K-50K (at scale)

### Target Audience
- **Primary**: Health-conscious adults 25-45
- **Secondary**: Athletes and fitness enthusiasts
- **Tertiary**: Individuals with specific health goals

---

## 🔐 Security & Compliance

### Data Protection
- **Firebase Security Rules**: Restrict unauthorized access
- **Input Validation**: Sanitize all user inputs
- **API Key Management**: Secure environment variables
- **HIPAA Considerations**: Health data protection protocols

### Content Compliance
- **FDA Disclaimer**: Clear supplement limitation statements
- **Medical Disclaimers**: "Consult healthcare provider" warnings
- **Scientific Accuracy**: Evidence-based recommendations only
- **Age Restrictions**: Adult-only recommendations

---

## 🧪 Testing Strategy

### Unit Testing
- **Jest Configuration**: Comprehensive test suite setup
- **Component Tests**: UI component functionality
- **Service Tests**: Business logic validation
- **API Tests**: External service integration

### Integration Testing
- **AI Advisor Testing**: End-to-end recommendation flow
- **Database Testing**: Firebase operations validation
- **Amazon API Testing**: Product data synchronization

### Performance Testing
- **Load Testing**: High concurrent user scenarios
- **Response Time**: Sub-3-second recommendation generation
- **Memory Usage**: Efficient resource utilization

---

## 📈 Performance Optimization

### Frontend Optimization
- **Next.js Features**: App Router, Image Optimization, Caching
- **Code Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Webpack bundle optimization
- **CDN Usage**: Static asset delivery optimization

### Backend Optimization
- **Caching Strategy**: In-memory and database-level caching
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API usage optimization
- **Background Processing**: Async recommendation generation

---

## 🔄 Development Workflow

### Version Control
- **Git Strategy**: Feature branching with main deployment
- **Commit Standards**: Conventional commit messages
- **Code Reviews**: Pull request review process

### CI/CD Pipeline
- **Build Process**: Automated TypeScript compilation
- **Testing**: Automated test suite execution
- **Deployment**: Firebase hosting deployment
- **Monitoring**: Error tracking and performance monitoring

### Development Environment
- **Local Setup**: npm run dev for development server
- **Hot Reload**: Real-time code change reflection
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement

---

## 🚀 Deployment Architecture

### Production Environment
- **Hosting**: Firebase Hosting (planned) / Vercel (alternative)
- **Database**: Firebase Firestore production instance
- **CDN**: Firebase CDN for static assets
- **Domain**: Custom domain configuration

### Environment Variables
```bash
# AI Services
OPENAI_API_KEY=<openai-key>
ANTHROPIC_API_KEY=<anthropic-key>
PINECONE_API_KEY=<pinecone-key>

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Amazon Affiliate
AMAZON_ACCESS_KEY=<access-key>
AMAZON_SECRET_KEY=<secret-key>
AMAZON_ASSOCIATE_TAG=<tag>
```

---

## 📊 Analytics & Monitoring

### Key Performance Indicators (KPIs)
- **User Engagement**: Session duration, page views
- **Conversion Metrics**: Recommendation-to-purchase rate
- **AI Performance**: Recommendation accuracy, user satisfaction
- **Revenue Metrics**: Monthly recurring revenue, average order value

### Monitoring Tools
- **Error Tracking**: Console error monitoring
- **Performance Monitoring**: Page load times, API response times
- **User Analytics**: Google Analytics integration (planned)
- **A/B Testing**: Recommendation algorithm optimization

---

## 🔮 Future Roadmap

### Phase 1: Core Enhancement (Q1 2025)
- [ ] Pinecone RAG system full implementation
- [ ] Advanced user authentication system
- [ ] Mobile app development (React Native)
- [ ] Enhanced product catalog (100+ products)

### Phase 2: Advanced Features (Q2 2025)
- [ ] Real-time health data integration (wearables)
- [ ] Subscription-based personalized plans
- [ ] Telehealth provider partnerships
- [ ] Advanced analytics dashboard

### Phase 3: Market Expansion (Q3-Q4 2025)
- [ ] International market expansion
- [ ] Multi-language support
- [ ] Professional practitioner tools
- [ ] Enterprise B2B solutions

---

## 📚 Documentation & Resources

### Technical Documentation
- **API Documentation**: Comprehensive service documentation
- **Component Library**: Storybook implementation (planned)
- **Database Schema**: Firestore collection documentation
- **Deployment Guide**: Production deployment instructions

### Business Documentation
- **Product Requirements**: Detailed feature specifications
- **User Stories**: Comprehensive user journey mapping
- **Market Research**: Competitive analysis and positioning
- **Financial Projections**: Revenue and growth models

---

## 🤝 Contributing Guidelines

### Code Standards
- **TypeScript**: Strict typing required
- **ESLint**: Follow established linting rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Conventional commit format

### Pull Request Process
1. Fork repository and create feature branch
2. Implement changes with comprehensive tests
3. Update documentation as needed
4. Submit pull request with detailed description
5. Address review feedback and merge

---

## 📞 Support & Contact

### Technical Support
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Documentation**: README and inline code comments

### Business Inquiries
- **Partnerships**: Brand collaboration opportunities
- **Licensing**: Technology licensing inquiries
- **Consulting**: Custom implementation services

---

## 📄 License & Legal

### Software License
- **License Type**: MIT License (typical for open source)
- **Usage Rights**: Commercial and non-commercial use permitted
- **Attribution**: Original author attribution required

### Disclaimer
This software provides general wellness information and should not be considered medical advice. Users should consult healthcare providers before making supplement decisions. The system is for informational purposes only.

---

**Blueprint Version**: 1.0
**Last Updated**: July 23, 2025
**Prepared By**: NutriWiseAI Development Team

---

*This blueprint serves as the comprehensive technical and business specification for the NutriWiseAI platform. It should be updated regularly as the system evolves and new features are implemented.*
