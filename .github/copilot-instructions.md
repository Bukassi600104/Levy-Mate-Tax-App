# LevyMate Tax App - AI Coding Instructions

## Project Overview
Nigerian tax calculator (React 19 + Vite + TypeScript) supporting 2024 Finance Act and proposed 2026 Nigeria Tax Act (NTA 2025). Backend uses AWS Amplify Gen 2 (Cognito + DynamoDB + AppSync GraphQL).

## Architecture

### Critical Rule: Tax Engine is Source of Truth
**Never implement tax math in UI components.** All calculations go through `services/taxEngine.ts`:
```typescript
// ✅ Correct
const result = TaxEngine.calculate(profile, 'ACT_2026_PROPOSED');

// ❌ Wrong - never calculate in components
const tax = income * 0.25;
```
- Tax bands/rates in `constants.ts` (`TAX_BANDS_2024`, `TAX_BANDS_2026`)
- Policy year (`'ACT_2024' | 'ACT_2026_PROPOSED'`) switches calculation logic
- TaxEngine returns `TaxResult` with `breakdown[]`, `insights[]`, `complianceFlags[]`

### Service Layer (services/)
| Service | Purpose |
|---------|---------|
| `taxEngine.ts` | PIT/CIT/VAT calculations, static class methods |
| `geminiService.ts` | AI chat via Gemini 2.5 Flash, receipt OCR |
| `authService.ts` | Cognito auth wrappers (signUp, signIn, resetPassword) |
| `amplifyService.ts` | DynamoDB CRUD via Amplify Data Client |

### State Management
- `App.tsx` holds global state (`profile`, `viewState`, `authView`) and prop-drills
- Profile shape: `TaxProfile` interface in `types.ts`
- Transactions nested: `profile.transactions[]`
- Components are lazy-loaded: `React.lazy(() => import('./components/Dashboard'))`

## Development Commands
```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npx tsc --noEmit     # Type check without build
npx ampx sandbox     # Provision AWS backend (requires AWS credentials)
```

## Environment Setup
Create `.env.local`:
```env
GEMINI_API_KEY=your_key
```
> `vite.config.ts` maps `GEMINI_API_KEY` → `process.env.API_KEY`

## Key Patterns

### Adding Tax Logic
1. Add constants to `constants.ts` (e.g., `RENT_RELIEF_CAP = 500000`)
2. Implement in `TaxEngine.calculatePIT()` or `TaxEngine.calculateCIT()`
3. Return via `TaxResult` interface with breakdown items

### AI Features (geminiService.ts)
- Model: `gemini-2.5-flash`
- Structured output: use `@google/genai` Type schema
- Always include tax disclaimer in responses
- `TAX_RESEARCH_DOCUMENT` constant provides knowledge base

### Database (Amplify Gen 2)
- Schema: `amplify/data/resource.ts` defines `TaxProfile` and `TransactionModel`
- Owner-based auth: users only access their own data
- Use `amplifyService.ts` functions, never direct client calls in components
- Fast load pattern: `getProfileFast()` (no transactions), then lazy-load transactions

### Authentication Flow
1. `authSignUp` → `confirm-email` view → `authConfirmSignUp` → auto sign-in
2. Password reset: `authForgotPassword` → `authConfirmResetPassword`
3. Auto-logout: 5min idle timeout + visibility change (tab/app background)

## Code Conventions
- **Currency**: `₦${amount.toLocaleString('en-NG')}`
- **Types**: Import from `types.ts` (never inline interfaces)
- **Icons**: `lucide-react` exclusively
- **Styling**: Tailwind utilities only (no CSS files except `index.css`)
- **Enums**: Use `EntityType`, `PersonaType`, `TaxPolicyYear` from `types.ts`

## File Reference
| File | Contains |
|------|----------|
| `types.ts` | All interfaces (`TaxProfile`, `TaxResult`, `Transaction`) |
| `constants.ts` | Tax bands, rates, Nigerian states, pricing, articles |
| `amplify/data/resource.ts` | DynamoDB schema |
| `App.tsx` | Auth flow, view routing, global state (~1300 lines) |
