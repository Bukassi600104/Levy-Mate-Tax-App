import { PersonaType } from './types';

// --- 2024 OLD REGIME (Finance Act 2020) ---
export const TAX_BANDS_2024 = [
  { limit: 300000, rate: 0.07 },
  { limit: 300000, rate: 0.11 },
  { limit: 500000, rate: 0.15 },
  { limit: 500000, rate: 0.19 },
  { limit: 1600000, rate: 0.21 },
  { limit: Infinity, rate: 0.24 },
];

// --- 2026 NEW REGIME (Nigeria Tax Act 2025) ---
// Source: Page 7 of Research Document
export const TAX_BANDS_2026 = [
  { limit: 800000, rate: 0.00, note: "Exempt Band" },    // First 800k is 0%
  { limit: 2200000, rate: 0.15, note: "Band 2" },       // 800k - 3m (Slice is 2.2m)
  { limit: 9000000, rate: 0.18, note: "Band 3" },       // 3m - 12m (Slice is 9m)
  { limit: 13000000, rate: 0.21, note: "Band 4" },      // 12m - 25m (Slice is 13m)
  { limit: 25000000, rate: 0.23, note: "Band 5" },      // 25m - 50m (Slice is 25m)
  { limit: Infinity, rate: 0.25, note: "Top Band" },    // Above 50m
];

// --- CIT CONSTANTS ---
export const SMALL_COMPANY_TURNOVER_LIMIT = 50000000; // ₦50m
export const SMALL_COMPANY_ASSET_LIMIT = 250000000;   // ₦250m
export const VAT_REGISTRATION_THRESHOLD = 25000000;   // ₦25m

export const PERSONA_DESCRIPTIONS: Record<PersonaType, string> = {
  [PersonaType.SALARY]: "Employee (PAYE). Progressive Tax Bands apply.",
  [PersonaType.BUSINESS]: "Unincorporated Business Name. Personal Income Tax applies.",
  [PersonaType.FREELANCER]: "Digital Worker/Consultant. Personal Income Tax applies.",
  [PersonaType.COMPANY]: "Registered Limited Liability Company. CIT applies.",
  [PersonaType.CRYPTO]: "Digital Asset Trader. Capital Gains Tax applies."
};

export const PERSONA_LABELS: Record<PersonaType, string> = {
  [PersonaType.SALARY]: "Salary Earner",
  [PersonaType.BUSINESS]: "Sole Proprietor / Enterprise",
  [PersonaType.FREELANCER]: "Freelancer",
  [PersonaType.COMPANY]: "Limited Liability Co (Ltd)",
  [PersonaType.CRYPTO]: "Crypto Trader"
};

export const INCOME_CATEGORIES = [
  "Salary", "Business Sales", "Freelance Project", "Crypto Gains", "Rental Income", "Severance Package", "Other"
];

export const EXPENSE_CATEGORIES = [
  "Office Rent", "Cost of Goods Sold", "Professional Fees (Audit/Legal)", "Staff Salaries", "Internet/Data", "Software Subscriptions", "Power/Diesel", "Equipment Purchase (Assets)", "Other"
];

export const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", 
    "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", 
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", 
    "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export const COMPLIANCE_DATES = [
  { title: "PIT Filing", date: "March 31", type: "annual" },
  { title: "CIT Filing", date: "Jun 30", type: "annual" }, // Approx 6 months after year end
  { title: "VAT Remittance", date: "21st", type: "monthly" }
];

export const DISCLAIMER_TEXT = "Estimates based on the Nigeria Tax Act 2025 (proposed effective 2026). LevyMate is an educational tool, not a tax consultant.";

// Revenue Model Constants
export const AI_QUERY_LIMIT_FREE = 5;
export const PRO_PRICE_MONTHLY = 2999;
export const PRO_PRICE_YEARLY = 29990;

export const PLAN_FEATURES = {
    Free: [
        "Basic Tax Calculator (PIT/CIT)",
        "Manual Income & Expense Tracking",
        "Limit: 50 Income & 50 Expense Entries / Month",
        "Basic Yearly Reporting",
        "5 AI Tax Queries / Day",
        "Access to Education Hub"
    ],
    Pro: [
        "Everything in Free",
        "Unlimited Income & Expense Entries",
        "Smart Receipt Scanning (OCR)",
        "Export Data to CSV",
        "Advanced Monthly/Quarterly Trends",
        "Unlimited AI Tax Assistant",
        "VAT Input Credit Optimization",
        "Priority Support"
    ]
};

export const PRICING_PLANS = [
  {
    id: 'Free',
    name: 'Starter',
    price: 0,
    description: 'For individuals just starting to track their taxes.',
    features: PLAN_FEATURES.Free,
    cta: 'Start for Free',
    color: 'gray'
  },
  {
    id: 'Pro',
    name: 'Business Pro',
    price: 2999,
    period: '/ month',
    description: 'For freelancers and businesses who want to save time and money.',
    features: PLAN_FEATURES.Pro,
    cta: 'Get Pro',
    color: 'blue',
    popular: true
  }
];

export const LEARNING_ARTICLES = [
  {
    id: 0,
    title: "Understanding Rent Relief",
    category: "Exemptions",
    duration: "2 min",
    content: `The Nigeria Tax Act 2025 introduces a significant relief for tenants. \n\nIf you pay rent for your principal place of residence, you can now claim a tax deduction. The rule is specific: You can deduct 20% of your annual rent paid, but this deduction is capped at a maximum of ₦500,000 per year.\n\nFor example, if your annual rent is ₦2,000,000, 20% of that is ₦400,000. Since this is below the cap, you can deduct the full ₦400,000 from your taxable income. However, if your rent is ₦5,000,000, 20% is ₦1,000,000. In this case, you can only claim the maximum cap of ₦500,000.\n\nThis relief replaces parts of the old Consolidated Relief Allowance logic, aiming to directly support housing costs.`
  },
  {
    id: 1,
    title: "What is Consolidated Relief?",
    category: "Basics",
    duration: "3 min",
    content: `Under the old Finance Act 2020 (and PITA 2011), the Consolidated Relief Allowance (CRA) was the primary way individuals reduced their taxable income. It was calculated as ₦200,000 (or 1% of Gross Income, whichever is higher) PLUS 20% of Gross Income.\n\nWhile generous, it was a blanket relief. The new 2025 Act moves towards itemized deductions. This means instead of a general "lump sum" relief, you now get specific reliefs for things you actually spend money on, like Rent, Health Insurance, and Pension contributions.\n\nWhy the change? The government wants to encourage specific economic behaviors (like paying for health insurance) and make the tax system fairer for those with actual high living costs.`
  },
  {
    id: 2,
    title: "Business Expense vs. Personal",
    category: "Business",
    duration: "4 min",
    content: `For business owners and freelancers, the golden rule of tax deduction is the WREN test. \n\nAn expense is only deductible if it is:\n- Wholly\n- Reasonably\n- Exclusively\n- Necessarily\n...incurred for the production of income.\n\nExamples:\n\n✅ **Deductible:**\n- Office Rent\n- Staff Salaries\n- Internet data used for work\n- Professional fees (Legal/Audit)\n\n❌ **Non-Deductible:**\n- Your personal lunch\n- Rent for your home (unless you claim the specific Rent Relief as an individual)\n- Clothes for work (unless it's a uniform)\n- School fees for your children\n\nMixing personal and business expenses is the #1 reason for tax audits. Keep them separate!`
  },
  {
    id: 3,
    title: "Pension Act Compliance",
    category: "Salary",
    duration: "2 min",
    content: `Pension contributions are one of the most effective tax shelters in Nigeria. \n\nUnder the Pension Reform Act, you contribute a minimum of 8% of your emoluments, and your employer contributes 10%. The amount you contribute is **Tax Exempt**. \n\nThis means if you earn ₦200,000 and contribute ₦16,000 to pension, you are only taxed on ₦184,000. \n\nAdditionally, Voluntary Contributions (VC) allow you to save more tax-free, subject to withdrawal rules. Ensuring your employer remits these funds to your PFA (Pension Fund Administrator) is crucial for both your future and your current tax compliance.`
  }
];
