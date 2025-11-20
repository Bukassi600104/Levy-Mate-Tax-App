# LevyMate Tax App - AI Coding Instructions

## Project Overview
LevyMate is a React + Vite + TypeScript application designed to help Nigerian individuals and companies calculate taxes under both the 2024 Finance Act and the proposed 2026 Nigeria Tax Act. It features a rule-based tax engine and AI-powered assistance.

## Architecture & Core Components

### 1. Service-Oriented Logic
- **Tax Logic (`services/taxEngine.ts`)**: This is the **source of truth** for all tax calculations.
  - **Pattern**: Static methods in `TaxEngine` class.
  - **Rule**: Never implement tax math directly in UI components. Always add a method to `TaxEngine` and call it.
  - **Policies**: Logic is split between `2024_ACT` and `2026_PROPOSED`. Ensure changes respect the selected policy year.
- **AI Services (`services/geminiService.ts`)**: Centralized wrapper for Google Gemini 2.5 Flash.
  - Handles Chat, Receipt OCR, and WhatsApp parsing.
  - Uses `process.env.API_KEY` for authentication.

### 2. UI Architecture
- **Entry Point (`App.tsx`)**: Manages global state (`profile`, `viewState`), authentication flow, and routing (conditional rendering).
- **Components (`components/`)**: Functional React components using Tailwind CSS.
  - **Dashboard**: Main authenticated view.
  - **LandingPage/FeaturesPage**: Public marketing views.
- **State Management**:
  - Uses `useState` for local UI state.
  - Persists user profile to `localStorage` key `levymate_profile`.
  - **Pattern**: Prop-drill `profile` object to child components.

## Tech Stack & Conventions

- **Framework**: React 19, Vite, TypeScript.
- **Styling**: Tailwind CSS. Use utility classes directly in JSX.
- **Icons**: `lucide-react`.
- **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`).
- **Charts**: `recharts` for data visualization.

## Critical Workflows

### Tax Calculation Updates
When modifying tax rules (e.g., changing tax bands or relief formulas):
1. Update constants in `constants.ts` (e.g., `TAX_BANDS_2026`).
2. Modify logic in `services/taxEngine.ts`.
3. **Do not** hardcode rates in components; fetch them from the engine or constants.

### AI Feature Development
- All AI prompts live in `services/geminiService.ts`.
- When adding new AI features, define a strictly typed schema using `@google/genai` `Type` for structured output (JSON).
- Always include a system instruction emphasizing that the AI is "LevyMate AI" and **not** a legal advisor.

## Common Patterns

- **Currency Formatting**: Use `toLocaleString()` with `₦` symbol.
- **Type Safety**: All data interfaces (Profile, Transaction, TaxResult) are defined in `types.ts`. Import from there.
- **Environment Variables**: The app currently references `process.env.API_KEY`. Ensure this is handled correctly in the Vite build (likely via `define` or switching to `import.meta.env`).

## Directory Structure
- `components/`: UI Components.
- `services/`: Business logic and external API integrations.
- `types.ts`: Shared TypeScript interfaces.
- `constants.ts`: Static data (Tax bands, State lists).
