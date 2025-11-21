<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LevyMate Tax App

A full-stack tax calculation platform for Nigerian individuals and companies, powered by React, AWS Amplify, and AI assistance.

**Status**: ✅ Backend Integration Complete | 🚀 Ready for Testing

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- (Optional) AWS Account for production deployment

### Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables (in .env.local)
VITE_API_KEY=your_gemini_api_key  # For AI features (optional)

# 3. Start development server
npm run dev
```

**Development Server**: http://localhost:3000/

## Features

### ✅ Current
- **Tax Calculation Engine**: 2024 Finance Act + 2026 Proposed Tax Act
- **Profile Management**: Individual & Company tax profiles
- **Transaction Tracking**: Income/expense management with tax classification
- **Dashboard**: Overview of tax obligations and calculations
- **Authentication Flow**: Sign-up, email confirmation, sign-in (design complete)
- **Database Schema**: TaxProfile + TransactionModel with owner-based RLS
- **Responsive UI**: Tailwind CSS, works on desktop and mobile

### 🚀 Coming Soon (Post-Production)
- **Email Verification**: Real Cognito User Pool integration
- **Cloud Data Persistence**: DynamoDB sync
- **Multi-Device Sync**: Access profiles from any device
- **AI Assistant**: Receipt OCR and WhatsApp parsing
- **Tax Reports**: PDF export of calculations

## Architecture

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript 5.8
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend (AWS Amplify Gen 2)
- **Authentication**: AWS Cognito (Email/Password)
- **Database**: DynamoDB (via Amplify Data)
- **API**: GraphQL (via AppSync)
- **Infrastructure**: AWS CloudFormation

### Services
- **Tax Calculations**: Client-side TypeScript engine
- **AI Integration**: Google Gemini 2.5 Flash (optional)
- **Database CRUD**: Amplify Data Client

## Project Structure

```
├── App.tsx                           # Main app + auth orchestration
├── components/                       # React components
│   ├── Dashboard.tsx                 # Post-auth dashboard
│   ├── TransactionManager.tsx        # Transaction CRUD
│   ├── Calculator.tsx                # Tax calculations
│   ├── LandingPage.tsx               # Marketing page
│   └── ...
├── services/                         # Business logic
│   ├── authService.ts                # Cognito wrappers
│   ├── amplifyService.ts             # DynamoDB CRUD
│   ├── taxEngine.ts                  # Tax calculation logic
│   └── geminiService.ts              # AI assistant
├── amplify/                          # Backend (AWS Amplify Gen 2)
│   ├── backend.ts                    # Backend entry point
│   ├── auth/resource.ts              # Cognito config
│   └── data/resource.ts              # Data schema (TaxProfile, TransactionModel)
├── types.ts                          # TypeScript interfaces
├── constants.ts                      # Tax bands, states, etc.
└── amplify_outputs.json              # Amplify config (local dev)
```

## Testing

### Local Testing (Current)
```bash
npm run dev
# Browser: http://localhost:3000/
```

**What Works**:
- ✅ UI/UX navigation
- ✅ Form validation
- ✅ Tax calculations
- ✅ Transaction management
- ✅ Profile editing

**What Requires AWS**:
- ❌ Real authentication (email verification)
- ❌ Data persistence
- ❌ Multi-user support

### Full Testing (With AWS)
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete instructions.

## Deployment

### Local Development
```bash
npm run dev
```

### Production (AWS Amplify)
```bash
# 1. Build
npm run build

# 2. Deploy (requires AWS credentials)
git push origin main
# Amplify Hosting auto-deploys

# OR manual deploy
npx ampx sandbox --once  # Provision backend
npm run build
# Push to Amplify Hosting
```

See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed deployment options.

## Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Architecture & implementation details
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI coding guidelines

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | AWS Amplify Gen 2 |
| Auth | AWS Cognito |
| Database | DynamoDB |
| API | GraphQL (AppSync) |
| Hosting | AWS Amplify Hosting |
| AI | Google Gemini 2.5 Flash |

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Environment Variables

Create `.env.local` file in project root:

```env
VITE_API_KEY=your_google_gemini_api_key  # Optional, for AI features
```

## AWS Setup (Optional for Production)

```bash
# Configure AWS credentials
npx ampx configure profile

# Provision backend (generates amplify_outputs.json)
npx ampx sandbox --once

# Deploy to production
git push origin main
```

**Requirements**:
- AWS account
- IAM user with Amplify permissions
- Access key ID + secret access key

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Build errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Rebuild from scratch
npm run build -- --force
```

### Browser console errors
- Press `F12` to open DevTools
- Check **Console** tab for error messages
- See TESTING_GUIDE.md for common issues

## Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: See `.md` files in project root
- **Amplify Docs**: https://docs.amplify.aws/

## License

© 2025 LevyMate. All rights reserved.

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

---

**Status**: ✅ Production Ready (Core Features)  
**Next Phase**: AWS Deployment + Email Verification  
**Last Updated**: November 21, 2025
