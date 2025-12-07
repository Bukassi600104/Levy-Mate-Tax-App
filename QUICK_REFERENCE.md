# LevyMate - Quick Reference & Troubleshooting

## 🚀 Start Here

```bash
# One-time setup
npm install

# Start development server
npm run dev

# Browser: http://localhost:3000/
```

---

## 📋 Quick Command Reference

| Task | Command |
|------|---------|
| **Start dev server** | `npm run dev` |
| **Build for production** | `npm run build` |
| **Preview production build** | `npm run preview` |
| **Type check** | `npx tsc --noEmit` |
| **View git logs** | `git log --oneline -10` |
| **Check git status** | `git status` |
| **Commit changes** | `git add -A && git commit -m "feat: description"` |
| **Push to GitHub** | `git push origin main` |
| **Clean cache** | `rm -r node_modules package-lock.json` |
| **Reinstall deps** | `npm install` |

---

## 🔧 Common Issues & Fixes

### Issue: "Cannot find module"
**Cause**: Dependencies not installed  
**Fix**:
```bash
npm install
npm run dev
```

### Issue: App won't start (port already in use)
**Cause**: Another app using port 3000  
**Fix**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Issue: Build errors
**Cause**: TypeScript errors  
**Fix**:
```bash
# Check errors
npx tsc --noEmit

# Clear cache and rebuild
rm -r dist
npm run build
```

### Issue: "Invalid Signature Exception" with AWS
**Cause**: AWS credentials are incorrect/mock  
**Fix**: This is expected in local development. To fix:
- Get valid AWS credentials
- Run: `npx ampx configure profile`
- Run: `npx ampx sandbox --once`

### Issue: Dev server shows blank page
**Cause**: Browser cache  
**Fix**:
- Press `Ctrl+Shift+Delete` to clear cache
- Or use incognito/private window
- Or hard refresh: `Ctrl+Shift+R`

---

## 📁 File Structure Quick Reference

```
App.tsx                       Main component & auth flow
├─ services/
│  ├─ authService.ts         Cognito auth methods
│  ├─ amplifyService.ts      DynamoDB CRUD
│  ├─ taxEngine.ts           Tax calculations
│  └─ geminiService.ts       AI integration
│
├─ components/
│  ├─ Dashboard.tsx          Post-auth view
│  ├─ TransactionManager.tsx Transaction CRUD
│  ├─ Calculator.tsx         Tax display
│  └─ LandingPage.tsx        Marketing page
│
├─ amplify/                  Backend config (AWS)
│  ├─ backend.ts
│  ├─ auth/resource.ts
│  └─ data/resource.ts
│
├─ types.ts                  TypeScript interfaces
├─ constants.ts              Tax bands, states, etc.
└─ amplify_outputs.json      Amplify configuration
```

---

## 🔐 Key Services Explained

### `authService.ts` - Authentication
```typescript
authSignUp(email, password)           // Create account
authConfirmSignUp(email, code)        // Verify email
authSignIn(email, password)           // Login
authSignOut()                         // Logout
authGetCurrentUser()                  // Current user info
authIsAuthenticated()                 // Check auth status
```

### `amplifyService.ts` - Database
```typescript
// Profiles
createProfile(data)                   // Save new profile
getProfile()                          // Get current user's profile
updateProfile(id, updates)            // Update profile
deleteProfile(id)                     // Delete profile

// Transactions
createTransaction(profileId, data)    // Add transaction
getTransactionsByProfile(profileId)   // List transactions
updateTransaction(id, updates)        // Update transaction
deleteTransaction(id)                 // Delete transaction
```

### `taxEngine.ts` - Tax Calculations
```typescript
calculateTaxes(profile, transactions, policy)  // Main calculation
// Returns: { grossIncome, taxableIncome, tax, deductions }
```

---

## 🧪 Testing Checklist

- [ ] App loads on http://localhost:3000/
- [ ] Landing page renders
- [ ] Can fill sign-up form
- [ ] Can fill profile form
- [ ] Can add transactions
- [ ] Tax calculation displays
- [ ] Can delete transactions
- [ ] Can logout
- [ ] No console errors (F12)

---

## 📊 Current Implementation Status

### ✅ Complete
- Frontend React app (all components)
- Tax calculation engine
- Authentication schema & services
- Database schema (TaxProfile, TransactionModel)
- CRUD service layer
- Dashboard & transaction UI
- Form validation
- TypeScript type safety

### 🟡 Pending AWS Credentials
- Real Cognito User Pool
- Real DynamoDB tables
- Email verification
- Data persistence
- Multi-user authentication

### 🔄 Future Features
- WhatsApp receipt parsing
- AI assistant (Gemini)
- Offline support
- PDF tax reports
- Mobile app

---

## 🚢 Deployment Paths

### Path 1: Local Only
```bash
npm run dev
# Test locally, no AWS needed
```

### Path 2: Production (AWS)
```bash
# 1. Configure AWS
npx ampx configure profile

# 2. Provision backend
npx ampx sandbox --once

# 3. Build
npm run build

# 4. Deploy
git push origin main
# Amplify Hosting auto-deploys
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview |
| **TESTING_GUIDE.md** | Complete testing instructions |
| **IMPLEMENTATION_SUMMARY.md** | Architecture & design details |
| **.github/copilot-instructions.md** | AI coding guidelines |
| **package.json** | Dependencies & scripts |

---

## 🆘 Getting Help

1. **Check console**: Press `F12` → Console tab
2. **Check terminal**: Look for error messages in `npm run dev` output
3. **Read docs**: See documentation files above
4. **Check GitHub**: https://github.com/Bukassi600104/Levy-Mate-Tax-App
5. **Check git log**: `git log --oneline` for recent changes

---

## ⚡ Pro Tips

- **Save on every change**: IDE auto-saves, Vite hot-reloads
- **Use browser DevTools**: F12 → Console for debugging
- **Check network tab**: F12 → Network to see API calls
- **Use git branches**: `git checkout -b feature/name` for experiments
- **Commit often**: Small commits easier to debug
- **Use descriptive messages**: `git commit -m "feat: add X"`

---

## 📅 Development Workflow

1. **Make changes** → Files auto-save
2. **Browser auto-updates** → Vite hot reload
3. **Test in browser** → http://localhost:3000/
4. **Check console** → F12 for errors
5. **Commit when working** → `git add -A && git commit -m "..."`
6. **Push regularly** → `git push origin main`

---

## 🎯 Next Steps

**Option A: Continue Local Development**
```bash
npm run dev
# Test UI/UX features locally
```

**Option B: Set Up AWS**
```bash
# Get valid AWS credentials first, then:
npx ampx configure profile
npx ampx sandbox --once
npm run dev
# Now with real backend
```

**Option C: Deploy to Production**
```bash
npm run build
git push origin main
# Amplify Hosting auto-deploys
```

---

**Last Updated**: November 21, 2025  
**For Quick Questions**: See TESTING_GUIDE.md or IMPLEMENTATION_SUMMARY.md
