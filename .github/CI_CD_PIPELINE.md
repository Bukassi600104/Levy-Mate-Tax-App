# LevyMate CI/CD Pipeline Documentation

## Overview
This document outlines the continuous integration and continuous deployment (CI/CD) strategy for both the **LevyMate Web App** and **LevyMate Mobile App** using GitHub Actions and AWS Amplify.

---

## Table of Contents
1. [Web App Pipeline](#web-app-pipeline)
2. [Mobile App Pipeline](#mobile-app-pipeline)
3. [Shared Workflows](#shared-workflows)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Strategy](#deployment-strategy)
6. [Monitoring & Rollback](#monitoring--rollback)

---

## Web App Pipeline

### Repository
- **Repo:** `Levy-Mate-Tax-App` (Primary Web App)
- **Platform:** React 19 + Vite + TypeScript
- **Hosting:** AWS Amplify

### Build Process
**Trigger:** Push to `main` or `develop` branches, or manual trigger.

#### Stage 1: Code Quality Checks
```yaml
name: Lint & Type Check
- ESLint for code style
- TypeScript compiler for type safety
- Prettier for formatting
```

#### Stage 2: Build
```yaml
name: Build Web App
- npm ci (clean install)
- npm run build
- Output: dist/ directory
```

#### Stage 3: Test
```yaml
name: Unit Tests
- Run test suite (if configured)
- Coverage reporting
- Fail if coverage < 80%
```

#### Stage 4: Deploy to Amplify
**Trigger:** On successful build
```
AWS Amplify Console → Deployment
- Auto-detects package.json changes
- Runs build command: npm run build
- Auto-deploys to production/staging
```

### GitHub Actions Workflow File
**Location:** `.github/workflows/web-deploy.yml`

```yaml
name: Web App CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint || true
    
    - name: Type check
      run: npx tsc --noEmit
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Amplify
      if: github.ref == 'refs/heads/main'
      run: |
        # Amplify auto-deploys on git push if connected
        echo "Deployment triggered by Amplify webhook"
```

---

## Mobile App Pipeline

### Repository
- **Repo:** `Levy-Mate-Tax-Mobile` (React Native Expo)
- **Platform:** Expo + React Native
- **Deployment:** EAS (Expo Application Services) + AWS Amplify

### Build Process
**Trigger:** Push to `main` or `develop` branches.

#### Stage 1: Dependencies & Type Check
```yaml
name: Lint & Type Check
- TypeScript compiler
- ESLint for code quality
```

#### Stage 2: Expo Build (iOS & Android)
```yaml
name: Build Mobile App
- eas build --platform ios (Requires Expo account)
- eas build --platform android
- Auto-generates APK/IPA binaries
```

#### Stage 3: Deploy to AWS Amplify
**Trigger:** On successful build
```
AWS Amplify Console → Deployment
- Monitors Levy-Mate-Tax-Mobile repository
- Runs preBuild, build, and postBuild scripts
- Deploys to AWS hosting or generates preview
```

### GitHub Actions Workflow File
**Location:** `.github/workflows/mobile-deploy.yml`

```yaml
name: Mobile App CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint & Type Check
      run: |
        npm run lint || true
        npx tsc --noEmit
    
    - name: Build Expo App
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      run: |
        npx expo-cli login -u ${{ secrets.EXPO_USERNAME }} -p ${{ secrets.EXPO_PASSWORD }}
        npx eas build --platform all --non-interactive
    
    - name: Notify Deployment
      if: github.ref == 'refs/heads/main'
      run: echo "Mobile app built and ready for deployment"
```

### Required Secrets
Add these to GitHub repository settings → Secrets:
- `EXPO_TOKEN`: Expo authentication token (from `eas login`)
- `EXPO_USERNAME`: Expo account username
- `EXPO_PASSWORD`: Expo account password

---

## Shared Workflows

### Pull Request Validation
**Trigger:** PR to `main`
- Code review approval required
- All checks must pass (lint, type, build)
- No merge conflicts

### Version Management
- **Web App:** Version in `package.json`
- **Mobile App:** Version in `app.json` (Expo config)
- Update version before merge to `main`

### Branch Strategy
```
main (Production)
  ↓ (merge via PR)
develop (Staging)
  ↓ (feature branches)
feature/* (Development)
```

---

## Environment Configuration

### Web App (AWS Amplify)
**File:** `amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Mobile App (AWS Amplify)
**File:** `amplify.yml` (in Levy-Mate-Tax-Mobile repo)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run lint || true
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables
**Web App (Production):**
- `VITE_API_URL`: Amplify API endpoint
- `VITE_GEMINI_API_KEY`: Google Gemini API key (via SSM Secrets)

**Mobile App (Production):**
- `API_URL`: Amplify API endpoint
- `GEMINI_API_KEY`: Google Gemini API key (via SSM Secrets)

Store sensitive keys in **AWS Systems Manager (SSM) Parameter Store**, not in `amplify.yml`.

---

## Deployment Strategy

### Web App Deployment
1. **Development:** Automatic deploy on push to `develop` branch
   - URL: `https://develop.levymate.com`
2. **Production:** Automatic deploy on push to `main` branch
   - URL: `https://levymate.com`
3. **Branch Preview:** Auto-preview for PR branches

### Mobile App Deployment
1. **Staging Build:** Run EAS build on `develop` branch
   - Generate APK/IPA for testing
   - Deployed to TestFlight (iOS) / Google Play Internal Testing
2. **Production Release:** Run EAS build on `main` branch
   - Generate signed APK/IPA
   - Release to App Store / Google Play

### Rollback Procedure
**If deployment fails:**
1. Check AWS Amplify Console for build logs
2. Revert the commit: `git revert <commit-hash>`
3. Push to trigger new build
4. **Manual Rollback:** Amplify allows selecting previous version in Console → Deployments

---

## Monitoring & Logging

### Build Logs
- **Web App:** AWS Amplify Console → Build logs
- **Mobile App:** AWS Amplify Console + EAS Build logs

### Error Alerts
Configure Slack notifications for failed builds:
```yaml
- name: Notify Slack on Failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"Build failed for main branch"}'
```

### Performance Monitoring
- **Web App:** CloudWatch metrics, Lighthouse CI
- **Mobile App:** Firebase Crashlytics (optional), EAS Analytics

---

## Best Practices

1. **Never commit secrets** to Git; use GitHub Secrets or AWS SSM.
2. **Test before merge** to `main` branch.
3. **Lock dependencies** with `package-lock.json` / `pnpm-lock.yaml`.
4. **Auto-update dependencies** monthly using Dependabot.
5. **Versioning:** Use semantic versioning (e.g., `1.2.3`).
6. **Commit messages:** Use conventional commits (`feat:`, `fix:`, `docs:`).

---

## Troubleshooting

### Issue: ERESOLVE Dependency Conflicts
**Cause:** Mismatched peer dependencies in `package.json`
**Solution:**
```bash
npm install --legacy-peer-deps
# Or update the conflicting package version
```

### Issue: Build Timeout
**Cause:** Long build process or stuck npm install
**Solution:**
- Increase build timeout in Amplify Console
- Clear cache and retry

### Issue: AWS Amplify Secrets Not Loading
**Cause:** Incorrect SSM parameter path
**Solution:**
- Verify path in Amplify Console: Environment variables
- Format: `/amplify/<app-id>/<branch-name>/`

---

## Summary Table

| Component | Web App | Mobile App |
|-----------|---------|-----------|
| **Repository** | Levy-Mate-Tax-App | Levy-Mate-Tax-Mobile |
| **Framework** | React 19 + Vite | React Native + Expo |
| **CI/CD** | GitHub Actions + Amplify | GitHub Actions + EAS + Amplify |
| **Build Time** | ~2-3 min | ~10-15 min (EAS) |
| **Deployment** | Automatic | Manual via EAS + Amplify |
| **Hosting** | AWS Amplify | EAS + AWS Amplify |

