# LevyMate Mobile App Specification

## 1. Executive Summary
**Product Name:** LevyMate Mobile
**Platform:** iOS & Android (via React Native / Expo)
**Core Value:** AI-powered tax compliance and calculation for Nigerian individuals and SMEs, supporting both the Finance Act 2020 and the new Nigeria Tax Act 2025.

### Architecture Overview
- **Frontend:** React Native (Expo recommended for rapid dev & OTA updates).
- **Backend:** AWS Amplify Gen 2 (Reusing existing `amplify/` backend).
- **Auth:** AWS Cognito (Native integration).
- **Database:** DynamoDB (Shared data model with web).
- **AI Engine:** Google Gemini 2.5 Flash (via Serverless function or direct API proxy).
- **Payments:** Paystack SDK for React Native.

---

## 2. Design System
Replicate the web's Tailwind identity using `NativeWind` or styled-components.

### Typography
- **Display/Headings:** `Poppins` (Bold, SemiBold)
- **Body/UI:** `Inter` (Regular, Medium, Bold)

### Color Palette
| Token | Hex Code | Usage |
|-------|----------|-------|
| `levy-blue` | `#1D4ED8` | Primary Buttons, Active States, Headers |
| `levy-mate` | `#0EA5E9` | Accents, Secondary Actions, Gradients |
| `levy-text` | `#0F172A` | Main Headings, Body Text |
| `levy-slate` | `#334155` | Subtitles, Muted Text |
| `levy-green` | `#10B981` | Success, Compliance Verified |
| `levy-amber` | `#F59E0B` | Warnings, Non-Compliance Alerts |
| `levy-offWhite`| `#F8FAFC` | App Backgrounds |

---

## 3. Data Models
The mobile app must strictly adhere to the `TaxProfile` and `Transaction` schemas to ensure compatibility with the web dashboard.

### Core Interfaces (TypeScript)
```typescript
enum EntityType { INDIVIDUAL = 'Individual', COMPANY = 'Company' }
enum TaxPolicyYear { ACT_2024 = 'ACT_2024', ACT_2026_PROPOSED = 'ACT_2026_PROPOSED' }

interface TaxProfile {
  id: string;
  name: string;
  email: string;
  entityType: EntityType;
  persona: 'SalaryEarner' | 'SoleProprietor' | 'Freelancer' | 'LimitedLiability' | 'CryptoTrader';
  
  // Compliance
  stateOfResidence: string; // e.g., "Lagos"
  phoneNumber: string;
  
  // Financials
  annualGrossIncome: number; // Individuals
  annualTurnover: number;    // Companies (Critical for Small Co. Exemption)
  rentPaid: number;          // For 2026 Rent Relief
  pensionContribution: number;
  
  // Settings
  tier: 'Free' | 'Pro';
  preferredPolicy: TaxPolicyYear;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string; // ISO 8601
  category: string;
  isTaxDeductible: boolean; // WREN Test
  hasInputVat: boolean;     // 2026 Input VAT Rule
}




4. Tax Engine Logic
Source of Truth: taxEngine.ts
The mobile app must implement the TaxEngine class with identical logic.

A. Personal Income Tax (PIT)
2024 Policy:
CRA: Max(200k, 1% Gross) + 20% Gross.
Bands: Old progressive bands (7% to 24%).
2026 Policy (Proposed):
Exemption: Income ≤ ₦800k is tax-free.
Rent Relief: Deduct 20% of annual rent (Capped at ₦500k).
CRA: Abolished.
Bands: New progressive bands (0%, 15%, 18%, 21%, 23%, 25%).
B. Company Income Tax (CIT)
Small Company Rule: Turnover ≤ ₦50m = 0% CIT (Exempt).
Large Company: 30% CIT + 4% Development Levy.
Input VAT: Allow recovery of VAT on services/assets (Input VAT Revolution).
5. User Flows
A. Onboarding (Wizard)
Identity: Individual vs. Company.
Persona: Salary Earner, Freelancer, etc.
Financials: Est. Annual Income/Turnover.
Location: State of Residence (for Principal Place of Residence rule).
Reliefs: Rent Paid (if Individual).
Plan: Free vs. Pro Selection.
B. Dashboard
Header: User Name, Current Plan, "Ask AI" button.
Summary Card: Gross Income, Tax Payable (Real-time calc), Effective Tax Rate.
Action Grid: Add Income, Add Expense, Scan Receipt, View Report.
Insights Feed: Dynamic tax tips based on current data.
C. Payment (Pro Upgrade)
Trigger: Selecting "Pro" plan or hitting usage limits.
Gateway: Paystack.
Plans: Monthly (₦2,999) / Yearly (₦29,990).
Logic: Verify transaction reference -> Update profile.tier -> Unlock features.
6. AI Services (Gemini)
Model: gemini-2.5-flash

Features
Tax Assistant Chat:
System Prompt: "You are Levy, a Nigerian tax expert. Explain rules simply. Disclaimer: Not legal advice."
Context: Inject user's persona, income, and policyYear into every prompt.
Receipt OCR:
Input: Camera image (Base64).
Output: JSON { amount, date, merchant, category }.
Prompt: "Extract total amount, date, merchant, and category from this receipt image. Return JSON."
7. Constants & Configuration
Hardcode these values to match the web app.

Tax Bands (2026):
0 - 800k: 0%
800k - 3m: 15%
3m - 12m: 18%
12m - 25m: 21%
25m - 50m: 23%
50m+: 25%
Limits:
SMALL_COMPANY_TURNOVER: ₦50,000,000
RENT_RELIEF_CAP: ₦500,000
FREE_TIER_AI_LIMIT: 5 queries/day
8. Implementation Roadmap
Setup: Initialize React Native CLI/Expo + Amplify Pull.
Core: Port taxEngine.ts and types.ts (Copy-paste safe).
UI: Build Onboarding Wizard and Dashboard Layout.
Data: Connect DynamoDB via Amplify DataStore (Offline support).
AI: Implement Gemini API wrapper.
Pay: Integrate Paystack SDK.


Plan: Mobile App Development - Phase 1 (Setup & Core Logic)
Since the specification document is complete, we can now plan the initialization of the mobile application. This phase focuses on setting up the environment and porting the "brain" of the application (Tax Engine) before building the UI.

Steps
Initialize Project: Create a new React Native project using Expo (TypeScript template) to ensure compatibility with the web codebase.
Configure Styling: Install and set up NativeWind to reuse the exact Tailwind classes and color tokens (levy-blue, etc.) defined in the spec.
Port Business Logic: Copy types.ts, constants.ts, and taxEngine.ts into the mobile project structure.
Setup Navigation: Install React Navigation and define the core stack: Onboarding → Auth → Dashboard.
Integrate Backend: Run amplify pull in the mobile project root to generate the amplifyconfiguration.json and sync with the existing backend.
Further Considerations
Code Sharing Strategy: Would you prefer to keep the mobile app in a separate folder within this repo (Mon
orepo approach) or a completely new repository?
2. Testing: Should we add unit tests for the TaxEngine immediately to verify it calculates exactly the same as the web