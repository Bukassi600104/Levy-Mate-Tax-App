# LevyMate Backend Integration Testing Guide

## Overview
This document provides step-by-step instructions for testing the LevyMate Tax App backend integration with AWS Amplify and Cognito authentication.

## Current Status

### ✅ Completed
- **Backend Schema**: Amplify data models defined (TaxProfile, TransactionModel) with owner-based RLS
- **Authentication Layer**: Cognito Email/Password flow integrated
- **Service Layer**: Complete CRUD operations for profiles and transactions
- **Frontend Updates**: App.tsx connected to Amplify, Dashboard syncs to cloud, TransactionManager performs cloud operations
- **Development Server**: Running on http://localhost:3000/
- **Build**: Production build completed successfully

### 🟡 Next: Testing & Production Deployment
- Local end-to-end testing via browser
- AWS credential setup for full sandbox/production deployment
- Real database connection to DynamoDB

---

## Quick Start (Local Testing)

### Prerequisites
- ✅ Node.js 18+ (already installed)
- ✅ npm (already installed)
- ✅ Project dependencies (already installed via `npm install`)
- ✅ Development server running on http://localhost:3000/

### Starting the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000/**

---

## Testing Flow

### 1. **Landing Page** (Unauthenticated)
- **Location**: http://localhost:3000/
- **Expected**: Marketing landing page with "Get Started" button
- **Test**: Click "Get Started" → Should navigate to auth form

### 2. **Sign Up Flow**
- **Location**: Auth view after clicking "Get Started"
- **Steps**:
  1. Enter name, email, password, confirm password
  2. Select entity type (Individual or Company)
  3. Select persona/role
  4. Click "Sign Up"

- **Expected Behavior**:
  - In development: Form submits locally (awaiting real Cognito setup)
  - Email confirmation view appears (if backend connected)
  - Confirmation code input shown

- **Note**: Full authentication requires AWS credentials and real Cognito User Pool

### 3. **Dashboard** (After Auth)
- **Location**: http://localhost:3000/ (after login)
- **Sections**:
  - Profile overview (top left)
  - Tax calculation results (top right)
  - Transaction manager (bottom left)
  - Analytics (bottom right)

- **Test Profile Creation**:
  1. Complete onboarding form (name, income, state, etc.)
  2. Verify profile data displays in dashboard
  3. Check if profile persists on page refresh (currently mock-based)

### 4. **Transaction Manager**
- **Location**: "Transaction Manager" card in dashboard
- **Steps**:
  1. Click "Add Transaction" button
  2. Enter: type (income/expense), amount, date, category
  3. Click "Add"

- **Expected Behavior**:
  - Transaction appears in list below form
  - Transactions sync to DynamoDB (when backend connected)
  - Delete button removes transaction from list

### 5. **Tax Calculations**
- **Location**: "Tax Calculation Result" card
- **Calculated Based On**:
  - Annual gross income
  - Entity type (Individual vs Company)
  - Persona (Salary Earner, Sole Proprietor, etc.)
  - Selected policy (2024 Finance Act vs 2026 Proposed)
  - Transactions (income/expenses/deductions)

- **Test**:
  1. Update profile income in onboarding
  2. Add several transactions
  3. Switch between policy years
  4. Verify tax amount recalculates

### 6. **Logout**
- **Location**: Dashboard bottom
- **Steps**: Click "Logout" button
- **Expected**: Return to login/landing page, profile cleared from UI

---

## Backend Connection Checklist

### To Enable Full Cloud Sync (Optional)

Follow these steps to connect to real AWS services:

#### Step 1: AWS Credentials Setup
```bash
# Configure AWS profile with valid IAM credentials
npx ampx configure profile
```

**Note**: You'll need an AWS account with:
- IAM user with Amplify permissions
- Access key ID and secret access key
- Region: us-west-2 (or preferred region)

#### Step 2: Provision Sandbox Backend
```bash
# Start sandbox (generates amplify_outputs.json with real endpoints)
npx ampx sandbox --once
```

This will:
- Create Cognito User Pool for authentication
- Create DynamoDB tables for data storage
- Generate `amplify_outputs.json` with connection details
- Enable real cloud sync for all transactions and profiles

#### Step 3: Test with Real Backend
- Restart dev server: `npm run dev`
- Create new account (real email confirmation required)
- Transactions will persist across sessions
- Multi-device sync supported

---

## Current Mock/Testing Limitations

### Currently (Without Real AWS Backend)
- ✅ UI renders correctly
- ✅ Form validation works
- ✅ Local calculations function
- ✅ Navigation between pages works
- ❌ Authentication doesn't persist across sessions (mock mode)
- ❌ Transactions don't sync to database (mock mode)
- ❌ Multi-device sync unavailable (mock mode)

### After AWS Setup
- ✅ All features above
- ✅ Authentication persists (Cognito)
- ✅ Transactions sync to DynamoDB
- ✅ Multi-device sync enabled
- ✅ Email confirmation required
- ✅ Password reset available
- ✅ User data isolated by owner (RLS)

---

## Debugging

### Check Console for Errors
1. Open Browser DevTools: `F12` or `Right-click → Inspect`
2. Go to **Console** tab
3. Look for red error messages

### Common Issues

#### "Failed to load AWS credentials"
**Cause**: AWS credentials not configured  
**Fix**: 
```bash
npx ampx configure profile
```

#### "Cannot find module 'amplify_outputs.json'"
**Status**: FIXED (v0.2 update)  
**Previous**: App.tsx had wrong import path

#### Build errors with "chunk larger than 500kB"
**Status**: Expected warning, not critical  
**Workaround**: None needed for development

#### Transactions not persisting
**Status**: Expected in mock mode  
**Fix**: Complete AWS setup steps above

---

## Next Steps

### For Local Development Only
1. ✅ Run `npm run dev`
2. Test UI/UX and local calculations
3. Report any bugs in the UI or navigation

### For Full Cloud Integration
1. Set up AWS credentials
2. Run `npx ampx sandbox`
3. Push to GitHub
4. AWS Amplify Hosting will auto-deploy

### For Production Deployment
1. Complete AWS setup
2. Deploy to AWS Amplify Hosting:
   ```bash
   # Build and push
   npm run build
   git add -A
   git commit -m "Deploy production build"
   git push origin main
   ```
3. Amplify Hosting auto-builds and deploys

---

## Architecture Reference

### Component Integration Flow
```
App.tsx (Auth orchestration)
  ├─ authService.ts (Cognito wrapper)
  │   └─ amplify Auth methods
  │
  ├─ amplifyService.ts (Database CRUD)
  │   └─ DynamoDB via Amplify Data Client
  │
  └─ Components
      ├─ Dashboard.tsx (Profile sync)
      ├─ TransactionManager.tsx (Transaction CRUD)
      └─ Calculator.tsx (Tax calculations)
```

### Data Flow
1. **User signs up** → `authSignUp()` → Cognito
2. **Confirms email** → `authConfirmSignUp()` → Cognito
3. **Signs in** → `authSignIn()` → JWT token issued
4. **Creates profile** → `createProfile()` → DynamoDB (with owner=userId)
5. **Updates profile** → Debounced `updateProfile()` → DynamoDB (every 2 seconds)
6. **Adds transaction** → `createTransaction()` → DynamoDB
7. **Calculates taxes** → `taxEngine.calculateTaxes()` → Client-side (no DB calls)

### Security Model
- **Authentication**: Cognito User Pool (Email/Password)
- **Authorization**: Row-Level Security (RLS) at database level
  - Each user can only read/write their own profile and transactions
  - `owner` field automatically set to authenticated user's `sub`
  - Enforced by Amplify Data schema

---

## Support Resources

- **Amplify Docs**: https://docs.amplify.aws/
- **Cognito Docs**: https://docs.aws.amazon.com/cognito/
- **Project Repo**: https://github.com/Bukassi600104/Levy-Mate-Tax-App
- **Issues**: Open a GitHub issue with detailed error messages

---

## Summary

**Current State**: Frontend fully integrated, schema defined, ready for AWS credential setup  
**Test Capability**: Local UI testing available now  
**Full Testing**: Requires AWS credentials and sandbox provisioning (optional for demo)  
**Production Ready**: Once AWS setup complete and sandbox deployed

Start testing now with `npm run dev` → http://localhost:3000/
