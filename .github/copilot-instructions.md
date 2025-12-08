# LevyMate Tax App - AI Coding Instructions

## Project Overview
Nigerian tax calculator (React 19 + Vite + TypeScript) supporting Finance Act 2020 and Nigeria Tax Act 2025 (effective January 2026). Backend: AWS Amplify Gen 2 (Cognito + DynamoDB + AppSync GraphQL).

## Critical Architecture Rule
**Tax Engine is the single source of truth.** Never compute tax math in UI components:
```typescript
// ✅ Always use TaxEngine
const result = TaxEngine.calculate(profile, 'ACT_2026_PROPOSED');

// ❌ Never inline tax calculations
const tax = income * 0.25;
```

## Service Layer (`services/`)
| Service | Responsibility |
|---------|---------------|
| `taxEngine.ts` | PIT/CIT/VAT calculations - static `TaxEngine` class |
| `amplifyService.ts` | DynamoDB CRUD - wrap all client calls here |
| `authService.ts` | Cognito wrappers (`authSignUp`, `authSignIn`, etc.) |
| `geminiService.ts` | Gemini 2.5 Flash AI chat, uses `TAX_RESEARCH_DOCUMENT` from constants |

## State Management
- **No Redux/Zustand** - `App.tsx` holds global state and prop-drills to components
- Key state: `profile: TaxProfile`, `viewState`, `authView`
- Transactions live in `profile.transactions[]`
- Components lazy-loaded: `React.lazy(() => import('./components/Dashboard'))`

## Tax Calculation Flow
1. Tax bands/rates defined in `constants.ts` (`TAX_BANDS_2024`, `TAX_BANDS_2026`)
2. `TaxEngine.calculate()` dispatches to `calculatePIT()` or `calculateCIT()` based on `entityType`
3. Policy year (`'ACT_2024' | 'ACT_2026_PROPOSED'`) switches logic branches
4. Returns `TaxResult` with `breakdown[]`, `insights[]`, `complianceFlags[]`

### Adding New Tax Logic
1. Add constants to `constants.ts` (e.g., `RENT_RELIEF_CAP = 500000`)
2. Add field to `TaxProfile` interface in `types.ts`
3. Add field to Amplify schema in `amplify/data/resource.ts`
4. Implement in `TaxEngine.calculatePIT()` or `TaxEngine.calculateCIT()`
5. Include in `TaxBreakdownItem[]` with `isRelief: true` for deductions

## Database Patterns (Amplify Gen 2)
- Schema: `amplify/data/resource.ts` → `TaxProfile` + `TransactionModel` (one-to-many)
- **Owner-based auth**: users only access their own data (automatic Cognito sub linking)
- **Fast load pattern**: `getProfileFast()` returns profile without transactions, then lazy-load via `getTransactionsByProfile(profileId)`
- Never call `client.models.*` directly in components - always use `amplifyService.ts`

## Development Commands
```bash
npm run dev          # Dev server http://localhost:3000
npm run build        # Production build (Vite)
npx tsc --noEmit     # Type check only
npx ampx sandbox     # Provision AWS backend (requires credentials)
```

## Environment Variables
Create `.env.local`:
```
GEMINI_API_KEY=your_key
```
Vite config maps `GEMINI_API_KEY` → `process.env.API_KEY` at build time.

## Code Conventions
- **Currency formatting**: `₦${amount.toLocaleString('en-NG')}`
- **Types**: Always import from `types.ts` - no inline interfaces
- **Icons**: `lucide-react` only (see existing imports for available icons)
- **Styling**: Tailwind utilities exclusively (no CSS modules)
- **Enums**: Use `EntityType`, `PersonaType`, `TaxPolicyYear`, `UserTier` from `types.ts`

## Key Files
| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces (`TaxProfile`, `TaxResult`, `Transaction`) |
| `constants.ts` | Tax bands, rates, `NIGERIAN_STATES`, `ADMIN_EMAILS`, pricing |
| `App.tsx` | Auth orchestration, view routing, global state (~1300 lines) |
| `amplify/data/resource.ts` | DynamoDB schema definition |
