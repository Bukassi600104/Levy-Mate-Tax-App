import { PersonaType } from './types';

// --- ADMIN ACCOUNTS (Permanent Pro Access) ---
export const ADMIN_EMAILS = [
  'bukassi@gmail.com',
  'zeenacy@gmail.com'
];

// --- 2024 OLD REGIME (Finance Act 2020) ---
export const TAX_BANDS_2024 = [
  { limit: 300000, rate: 0.07, cumulativeTax: 0 },
  { limit: 300000, rate: 0.11, cumulativeTax: 21000 },
  { limit: 500000, rate: 0.15, cumulativeTax: 54000 },
  { limit: 500000, rate: 0.19, cumulativeTax: 129000 },
  { limit: 1600000, rate: 0.21, cumulativeTax: 224000 },
  { limit: Infinity, rate: 0.24, cumulativeTax: 560000 },
];

// --- 2026 NEW REGIME (Nigeria Tax Act 2025) ---
// Source: NTA 2025 Section 3.1 - Progressive Tax Bands
// Effective: January 1, 2026
export const TAX_BANDS_2026 = [
  { limit: 800000, rate: 0.00, cumulativeTax: 0, note: "First ₦800k (Tax-Free)" },
  { limit: 2200000, rate: 0.15, cumulativeTax: 0, note: "₦800k - ₦3m @ 15%" },
  { limit: 9000000, rate: 0.18, cumulativeTax: 330000, note: "₦3m - ₦12m @ 18%" },
  { limit: 13000000, rate: 0.21, cumulativeTax: 1950000, note: "₦12m - ₦25m @ 21%" },
  { limit: 25000000, rate: 0.23, cumulativeTax: 4680000, note: "₦25m - ₦50m @ 23%" },
  { limit: Infinity, rate: 0.25, cumulativeTax: 10430000, note: "Above ₦50m @ 25%" },
];

// --- NTA 2025 PIT CONSTANTS ---
export const RENT_RELIEF_RATE = 0.20; // 20% of actual rent paid
export const RENT_RELIEF_CAP = 500000; // Maximum ₦500,000 per year
export const PIT_EXEMPTION_THRESHOLD = 800000; // First ₦800k is 0% (minimum wage protection)
export const GRATUITY_EXEMPTION_LIMIT = 50000000; // ₦50m (raised from ₦10m)
export const BENEFIT_IN_KIND_CAP_RATE = 0.05; // 5% of cost for BIK valuation

// --- NTA 2025 STATUTORY DEDUCTION RATES ---
export const PENSION_EMPLOYEE_RATE = 0.08; // Minimum 8% employee contribution
export const PENSION_EMPLOYER_RATE = 0.10; // Minimum 10% employer contribution
export const NHF_RATE = 0.025; // 2.5% of gross income (now voluntary for private sector)
export const NHIS_RATE = 0.05; // 5% of basic salary (standard)

// --- NTA 2025 CIT CONSTANTS ---
// Note: Threshold harmonized to ₦100m in final Act (inflation-adjusted)
export const SMALL_COMPANY_TURNOVER_LIMIT = 100000000; // ₦100m (updated from ₦50m)
export const SMALL_COMPANY_ASSET_LIMIT = 250000000; // ₦250m
export const CIT_RATE_SMALL = 0.00; // 0% for small companies
export const CIT_RATE_LARGE = 0.30; // 30% for large companies
export const DEVELOPMENT_LEVY_RATE = 0.04; // 4% unified levy (replaces TET, NITDA, NASENI, Police Trust Fund)
export const VAT_REGISTRATION_THRESHOLD = 25000000; // ₦25m
export const VAT_STANDARD_RATE = 0.075; // 7.5%

// --- EMPLOYER SECTOR TYPES ---
export const EMPLOYER_SECTORS = ['Public', 'Private'] as const;
export type EmployerSector = typeof EMPLOYER_SECTORS[number];

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
    title: "NTA 2025: The New Tax Bands Explained",
    category: "Basics",
    duration: "4 min",
    content: `The Nigeria Tax Act 2025 introduces a new 6-band progressive tax system that takes effect on January 1, 2026. Here's how it works:

The first ₦800,000 you earn is completely tax-free. This is great news for minimum wage earners, since someone earning ₦70,000 per month (about ₦840,000 annually) will pay virtually nothing.

For income between ₦800,001 and ₦3,000,000, you'll pay 15% on that portion. So if you earn ₦3 million, only ₦2.2 million of it gets taxed at this rate.

The next bracket covers ₦3,000,001 to ₦12,000,000 at 18%. Then ₦12,000,001 to ₦25,000,000 is taxed at 21%.

Higher earners in the ₦25,000,001 to ₦50,000,000 range pay 23% on that portion. And finally, anything above ₦50 million is taxed at the new top rate of 25%.

This system replaces the old 7% to 24% bands from the Finance Act 2020, and for most Nigerians, it means a lower tax burden.`
  },
  {
    id: 1,
    title: "Understanding Rent Relief (NTA 2025)",
    category: "Exemptions",
    duration: "3 min",
    content: `If you're a tenant in Nigeria, the new tax law has some good news for you. The Nigeria Tax Act 2025 lets you claim a tax deduction for the rent you pay on your home.

Here's how it works: you can deduct 20% of your annual rent, but there's a cap of ₦500,000 per year.

Let's say you pay ₦2,000,000 in rent annually. Twenty percent of that is ₦400,000, which is below the cap, so you get to claim the full amount. But if your rent is ₦5,000,000 per year, twenty percent would be ₦1,000,000. Since that exceeds the cap, you can only claim ₦500,000.

One thing to keep in mind: you'll need to keep your receipts and tenancy agreements as proof. LevyMate's receipt scanning feature can help you store this evidence digitally.

This rent relief is part of the new itemized deduction system that replaces the old Consolidated Relief Allowance, which has been abolished under the 2025 Act.`
  },
  {
    id: 2,
    title: "NHF: Now Voluntary for Private Sector",
    category: "Exemptions",
    duration: "2 min",
    content: `The National Housing Fund contribution has changed significantly under the Nigeria Tax Act 2025, especially for private sector workers.

If you work in the public sector, nothing changes. NHF remains mandatory at 2.5% of your gross income.

But if you work in the private sector, NHF is now completely voluntary. You get to decide whether to participate or not.

Choosing to opt in means you contribute 2.5% of your gross income, which becomes tax-deductible. You also gain access to NHF housing loans. On the other hand, if you opt out, you keep that money but won't qualify for NHF loan facilities, and your taxable income will be slightly higher.

Here's something to consider: if you earn ₦10,000,000 annually, opting into NHF would cost you ₦250,000 per year. Think about whether the tax savings and loan access are worth having that money locked away.`
  },
  {
    id: 3,
    title: "What is Consolidated Relief? (Old System)",
    category: "Basics",
    duration: "3 min",
    content: `Before we dive into the new system, it helps to understand what we're moving away from.

Under the old Finance Act 2020 and PITA 2011, everyone got something called the Consolidated Relief Allowance, or CRA. It was calculated as ₦200,000 (or 1% of your gross income, whichever was higher) plus 20% of your gross income.

While this was a generous blanket relief, it treated everyone the same regardless of their actual expenses. The 2025 Act changes this approach entirely by moving to itemized deductions.

What does this mean for you? Instead of getting one lump sum relief, you now claim specific deductions for things you actually spend money on, like rent, health insurance, and pension contributions.

Why did the government make this change? They want to encourage specific behaviors (like getting health insurance) and make the system fairer for people who genuinely have high living costs.

The bottom line: CRA is gone under the new law. Use our calculator to see how your tax compares under both systems.`
  },
  {
    id: 4,
    title: "Business Expense vs. Personal (WREN Test)",
    category: "Business",
    duration: "4 min",
    content: `If you run a business or freelance, knowing what you can deduct from your taxes is crucial. There's a simple test called WREN that helps you figure this out.

An expense is only deductible if it was Wholly, Reasonably, Exclusively, and Necessarily incurred to generate your income.

So what passes the test? Things like office rent, staff salaries, internet data used for work, and professional fees for lawyers or accountants are all deductible.

What doesn't qualify? Your personal lunch, rent for your home (though you might claim Rent Relief as an individual), regular work clothes (unless it's a specific uniform), and your children's school fees.

Here's why this matters: mixing personal and business expenses is the number one reason people get audited by tax authorities. Keep them separate, and you'll save yourself a lot of headaches.`
  },
  {
    id: 5,
    title: "Pension Act Compliance",
    category: "Salary",
    duration: "2 min",
    content: `Pension contributions are one of the smartest ways to reduce your tax bill in Nigeria.

Under the Pension Reform Act, you contribute at least 8% of your earnings, while your employer adds 10%. The key benefit? Your contribution is completely tax-exempt.

Here's a practical example: if you earn ₦200,000 and contribute ₦16,000 to your pension, you're only taxed on ₦184,000. That's immediate tax savings in your pocket.

You can also make Voluntary Contributions to save even more on taxes, though there are rules about when you can withdraw this money.

One important thing: make sure your employer is actually sending your pension contributions to your PFA (Pension Fund Administrator). This isn't just about your retirement savings; it's also a legal compliance requirement.`
  },
  {
    id: 6,
    title: "Capital Gains Tax (NTA 2025)",
    category: "Business",
    duration: "3 min",
    content: `The Nigeria Tax Act 2025 has changed how Capital Gains Tax works, and it's something property owners and investors need to understand.

Under the old system, everyone paid a flat 10% on capital gains, regardless of their income level.

The new approach is different: your capital gains are now added to your regular income and taxed at whatever rate applies to your income bracket. This ranges from 0% to 25%.

What does this mean in practice? If your total income including gains is under ₦800,000, you pay no CGT. If you're in the 15% bracket, your gains are taxed at 15%. But if you're a high earner in the top bracket, your gains face the full 25% rate.

Consider this example: you earn ₦60,000,000 in salary and make another ₦10,000,000 selling property. Your marginal rate is 25%, so you'd owe ₦2,500,000 in CGT. Under the old flat rate, it would have been just ₦1,000,000.

This change mainly affects high earners. If that's you, consider timing your asset sales carefully.`
  },
  {
    id: 7,
    title: "Small Company CIT Exemption (NTA 2025)",
    category: "Business",
    duration: "2 min",
    content: `The Nigeria Tax Act 2025 has simplified Company Income Tax dramatically, and small businesses are the big winners.

The new system is straightforward. If your company's annual turnover is ₦100 million or less, you're classified as a Small Company. Your CIT rate is 0%, you pay no Development Levy, and there's no Minimum Tax.

For larger companies with turnover above ₦100 million, the CIT rate is 30%, plus a 4% Development Levy. This levy replaces several old ones including TET, NITDA, NASENI, and the Police Trust Fund.

What changed from before? The exemption threshold jumped from ₦25 million to ₦100 million, which is a huge relief given inflation. The old "medium company" category at 20% is gone, and so is the Minimum Tax that used to catch everyone.

One crucial point: even if you qualify for the 0% rate, you still need to file your returns. Submit nil returns to stay compliant and maintain your Tax Clearance Certificate.`
  }
];

// --- FAQ ITEMS (For FAQ Page) ---
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'General' | 'PIT' | 'CIT' | 'VAT' | 'Compliance' | 'Informal Sector' | 'Digital Economy' | 'State-Specific';
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: "I heard the government increased taxes. Will I pay more in 2026?",
    answer: `Not necessarily. The Nigeria Tax Act 2025 introduces a progressive system designed to reduce the burden on low-and-middle-income earners while increasing it for high earners.

• If you earn ₦800,000 or less per year: You are now 100% Tax-Exempt. You pay ₦0.00 in Personal Income Tax (PIT).
• If you earn between ₦800k and ₦50m: You will likely pay less than before because the tax bands have been widened.
• If you earn above ₦50m: You will pay more, with a new top marginal rate of 25%.`,
    category: 'General'
  },
  {
    id: 2,
    question: "What happened to the Consolidated Relief Allowance (CRA)?",
    answer: `The CRA (which was ₦200,000 + 20% of gross income) has been abolished under the new Act. It has been replaced by specific deductions:

1. Rent Relief: You can now claim the lower of ₦500,000 or 20% of your actual annual rent paid. Note: You must provide evidence of rent payment to claim this.
2. Transport/Meal Allowances: These are generally now taxed unless they are reimbursements for actual business expenses.`,
    category: 'PIT'
  },
  {
    id: 3,
    question: "I run a small business. Do I still need to file CIT?",
    answer: `Yes, you must file, but you may not have to pay.

• The Exemption: If your company's annual gross turnover is ₦50 million or less, you are classified as a "Small Company." Your Companies Income Tax (CIT) rate is 0%.
• The Condition: You must still register with the FIRS and file your Annual Returns (nil returns) to get a Tax Clearance Certificate (TCC). Without filing, you are non-compliant, even if your tax liability is zero.`,
    category: 'CIT'
  },
  {
    id: 4,
    question: "Do I have to pay tax if I sell in the market or have a mechanic workshop?",
    answer: `Yes, but it is not "CIT." You fall under the Presumptive Tax Regime.

• How it works: Because you likely don't keep audited accounts, the State Internal Revenue Service (e.g., LIRS, KADIRS) estimates your tax based on your trade and location.
• The "Harmonized" Rule: States like Kano, Lagos, and Kaduna have "negotiated rates" with unions. For example, a tailor in a rural area might pay a flat ₦2,500/year, while a boutique owner in the city pays ₦50,000/year.
• Red Flag: You should receive one demand notice per year for this. Daily collections by "agberos" or "consultants" in the market are often illegal levies disguised as tax. Only pay if you get a government receipt (e.g., with a QR code or State Logo).`,
    category: 'Informal Sector'
  },
  {
    id: 5,
    question: "What is the correct tax for a transporter (Okada, Keke, Taxi, Truck)?",
    answer: `1. Road Taxes: This is a State Government responsibility. It is usually paid annually (vehicle renewal/hackney permit).
2. Daily Levies: Most states have harmonized daily levies (e.g., ₦200-₦800/day) which consolidates Local Govt ticket + Union dues.
3. Inter-State Travel: If you drive a truck across Nigeria, you only need the Single Inter-State Road Sticker (SIRTS).

Legal Protection: Under the Taxes and Levies Act, mounting a roadblock to collect revenue is a criminal offense. If you have your SIRTS and vehicle papers, any other demand on the highway is illegal extortion.`,
    category: 'Informal Sector'
  },
  {
    id: 6,
    question: "Do I pay tax on money I make from YouTube, Upwork, or freelancing?",
    answer: `Yes.

• Legal Basis: Nigerian residents are taxed on their Worldwide Income. It does not matter if the money sits in a PayPal or a domiciliary account; if you live in Nigeria >183 days a year, it is taxable.
• Influencer Tax: The FIRS classifies "Content Creation" as a business vocation.
  - If you are an individual: You pay Personal Income Tax to your State (Direct Assessment).
  - If you registered a Limited Company for your brand: You pay CIT to the FIRS.
• VAT: If you sell digital courses or ebooks to Nigerians, you must charge 7.5% VAT and remit it, unless your turnover is under ₦25m.`,
    category: 'Digital Economy'
  },
  {
    id: 7,
    question: "How is my PAYE calculated in 2026?",
    answer: `• Old Way: Calculate Gross -> Deduct CRA -> Apply old table.
• New Way (2026): Calculate Gross -> Deduct Pension (8%), NHF (2.5%), Health Insurance, and Rent Relief (if applicable) -> Apply New Progressive Table.
• Important: The new law removes the "minimum tax" clause that forced people to pay 1% even if they had no taxable income. Now, if your relief wipes out your income, you pay zero.`,
    category: 'PIT'
  },
  {
    id: 8,
    question: "How do I get my Tax Identification Number (TIN)?",
    answer: `• Individuals: It is now automatically generated using your BVN or NIN. Visit the Joint Tax Board (JTB) TIN Verification Portal (tin.jtb.gov.ng) to retrieve it.
• Companies: It is generated by the Corporate Affairs Commission (CAC) upon registration.`,
    category: 'Compliance'
  },
  {
    id: 9,
    question: "How do I pay taxes officially to avoid trouble?",
    answer: `• Never pay cash to an individual.
• For Federal Taxes (CIT, VAT): Use TaxPro Max (taxpromax.firs.gov.ng). It generates a Remita RRR.
• For State Taxes: Use the State's specific portal (e.g., etax.lirs.net for Lagos, fctirs.gov.ng for Abuja).
• Proof: Always demand an Automated Revenue Receipt. A handwritten receipt is not valid evidence of tax payment in court.`,
    category: 'Compliance'
  },
  {
    id: 10,
    question: "I am being harassed by thugs for tax. What do I do?",
    answer: `1. Do not fight. Safety first.
2. Record Evidence: If safe, take a photo of their ID or "ticket".
3. Report:
   • Federal Issues: FIRS Whistleblowing Portal (whistle.finance.gov.ng).
   • Joint Tax Board: Report illegal roadblocks/levies to the JTB app.
   • State: Most states now have a "Tax Ombudsman" or complaint hotline (e.g., Lagos Citizens Gate).`,
    category: 'Compliance'
  },
  {
    id: 11,
    question: "What taxes can the Federal Government (FIRS) collect?",
    answer: `Only these taxes:
1. Companies Income Tax (CIT)
2. Value Added Tax (VAT)
3. Petroleum Profits Tax / Hydrocarbon Tax
4. Capital Gains Tax (for Companies & Abuja Residents)
5. Stamp Duties (for Corporate Bodies)
6. Development Levy (4% on Companies)

Any other tax demanded by a federal agent is likely illegal.`,
    category: 'Compliance'
  },
  {
    id: 12,
    question: "What taxes can the State Government collect?",
    answer: `Only these taxes:
1. Personal Income Tax (PAYE & Direct Assessment)
2. Withholding Tax (for Individuals)
3. Capital Gains Tax (for Individuals)
4. Stamp Duties (for Individual instruments)
5. Road Taxes (Vehicle Licenses)
6. Business Premises Registration (Urban: ₦10k max / Rural: ₦2k max)
7. Land Use Charge / Ground Rent (Harmonized Property Tax)`,
    category: 'Compliance'
  },
  {
    id: 13,
    question: "What taxes can the Local Government (LGA) collect?",
    answer: `Only these taxes:
1. Shops and Kiosks Rates
2. Tenement Rates (unless consolidated into State Land Use Charge)
3. Liquor License Fees
4. Slaughter Slab Fees
5. Marriage, Birth, Death Registration
6. Naming of Street Registration
7. Right of Occupancy Fees (Rural only)
8. Motor Park Levies (Only inside the park, not on the road)
9. Merriment & Road Closure Levy

🚨 ILLEGAL TAX ALERT: "Bicycle Tax," "Wheelbarrow Tax," "Radio License (Local)," or "Inter-State Haulage" (outside the harmonized sticker) are nuisance taxes and often illegal or abolished.`,
    category: 'Compliance'
  },
  {
    id: 14,
    question: "What are the specific tax rules for Lagos State?",
    answer: `• Property Tax: Called Land Use Charge (LUC). Consolidates Ground Rent + Tenement Rate.
• Payment: Use the Lagos On-Line Assistant (LOLA) or e-Tax portal.
• Benefit: 15% discount if paid within 30 days of billing.`,
    category: 'State-Specific'
  },
  {
    id: 15,
    question: "What are the specific tax rules for FCT (Abuja)?",
    answer: `• Unique Status: FCT-IRS operates like a State Board but reports federally. Abuja residents pay CGT and Stamp Duties to FCT-IRS, not FIRS (for individuals).
• TIN: Mandatory link to NIN. You cannot pay taxes without a NIN-linked TIN.`,
    category: 'State-Specific'
  }
];

// --- TAX RESEARCH DOCUMENT (For AI Chat Context) ---
export const TAX_RESEARCH_DOCUMENT = `
NIGERIAN TAX LAW KNOWLEDGE BASE (Nigeria Tax Act 2025 Edition)
Legislative Baseline: Nigeria Tax Act 2025, Nigeria Tax Administration Act 2025
Effective Date: January 1, 2026

=== CORE POLICY CHANGES (2026 SHIFT) ===

PERSONAL INCOME TAX (PIT) REFORMS:
- Income ≤₦800,000/year: 100% Tax-Exempt (0% rate)
- Income ₦800k-₦3m: 15% marginal rate
- Income ₦3m-₦12m: 18% marginal rate
- Income ₦12m-₦25m: 21% marginal rate
- Income ₦25m-₦50m: 23% marginal rate
- Income >₦50m: 25% marginal rate (top rate)

CONSOLIDATED RELIEF ALLOWANCE (CRA) - ABOLISHED:
The old CRA (₦200,000 + 20% of gross income) is replaced by:
1. Rent Relief: Lower of ₦500,000 or 20% of actual annual rent paid (evidence required)
2. Pension contributions remain deductible (8% employee contribution)
3. NHF contributions remain deductible (2.5%)
4. Health Insurance premiums are deductible

COMPANIES INCOME TAX (CIT):
- Small Companies (turnover ≤₦50m): 0% CIT rate (must still file nil returns)
- Large Companies: 30% CIT rate
- Development Levy: 4% consolidated (replaces Education Tax 2.5%, NITDA 1%, NASENI 0.25%)
- Capital Gains Tax for companies: Increased from 10% to 30%

VALUE ADDED TAX (VAT):
- Rate: 7.5%
- Registration threshold: ₦25m turnover
- Input VAT: Now recoverable on ALL business purchases (services and assets included)
- Zero-rated: Basic food, medical products, educational materials, renewable energy equipment

=== APPROVED TAX COLLECTION JURISDICTIONS ===

FEDERAL GOVERNMENT (FIRS) ONLY:
1. Companies Income Tax (CIT)
2. Value Added Tax (VAT)
3. Petroleum Profits Tax
4. Capital Gains Tax (Companies & Abuja residents)
5. Stamp Duties (Corporate)
6. Development Levy (4%)

STATE GOVERNMENT (SIRS) ONLY:
1. Personal Income Tax (PAYE & Direct Assessment)
2. Withholding Tax (Individuals)
3. Capital Gains Tax (Individuals)
4. Stamp Duties (Individual instruments)
5. Road Taxes / Vehicle Licenses
6. Business Premises Registration (Urban: ₦10k max, Rural: ₦2k max)
7. Land Use Charge / Ground Rent

LOCAL GOVERNMENT (LGA) ONLY:
1. Shops and Kiosks Rates
2. Tenement Rates
3. Liquor License Fees
4. Slaughter Slab Fees
5. Registration fees (Marriage, Birth, Death)
6. Motor Park Levies (inside parks only)
7. Right of Occupancy Fees (Rural only)

ILLEGAL/NUISANCE TAXES: Bicycle Tax, Wheelbarrow Tax, Radio License (Local), roadblock collections

=== SECTOR-SPECIFIC RULES ===

DIGITAL ECONOMY / FREELANCERS / INFLUENCERS:
- Nigerian residents taxed on WORLDWIDE income (>183 days residence)
- Income from YouTube, Upwork, TikTok, etc. is taxable
- Individual content creators: Pay PIT to State (Direct Assessment)
- Incorporated brands: Pay CIT to FIRS
- Digital product sales to Nigerians: Charge 7.5% VAT if turnover >₦25m

INFORMAL SECTOR (Artisans, Market Traders):
- Fall under Presumptive Tax Regime
- State estimates tax based on trade/location
- States negotiate rates with trade unions
- One demand notice per year is normal
- Daily collections by "agberos" are often ILLEGAL

TRANSPORTERS (Okada, Keke, Taxi, Trucks):
- Road Taxes: Annual payment to State
- Daily Levies: Harmonized ₦200-₦800/day
- Inter-State: Single Inter-State Road Sticker (SIRTS) only
- Roadblocks for revenue collection are CRIMINAL OFFENSES

=== STATE-SPECIFIC INFORMATION ===

LAGOS STATE:
- Property Tax: Land Use Charge (LUC) consolidates all property rates
- Payment: etax.lirs.net or LOLA WhatsApp bot
- 15% discount for payment within 30 days

KANO STATE:
- Uses Association-Based Assessment
- Trade unions negotiate presumptive rates with KIRS

FCT (ABUJA):
- FCT-IRS operates like State but reports federally
- TIN must be linked to NIN (mandatory)
- Individuals pay CGT and Stamp Duties to FCT-IRS

KADUNA STATE:
- Tax Codification Law prohibits cash collection
- Must use POS or bank transfers

OGUN STATE:
- Harmonized Haulage Tickets for trucks
- Single state-wide fee replaces LGA checkpoints

=== COMPLIANCE ESSENTIALS ===

TAX IDENTIFICATION NUMBER (TIN):
- Individuals: Auto-generated via BVN/NIN at tin.jtb.gov.ng
- Companies: Generated by CAC upon registration

OFFICIAL PAYMENT CHANNELS:
- Federal Taxes: TaxPro Max (taxpromax.firs.gov.ng) → Remita RRR
- State Taxes: State portals (etax.lirs.net, fctirs.gov.ng, etc.)
- NEVER pay cash to individuals
- Always demand Automated Revenue Receipt

REPORTING ILLEGAL TAX DEMANDS:
- Federal: FIRS Whistleblowing Portal (whistle.finance.gov.ng)
- Joint Tax Board app for roadblocks/illegal levies
- State Tax Ombudsman or complaint hotlines

KEY FILING DATES:
- PIT Filing: March 31 (annual)
- CIT Filing: June 30 (annual, 6 months after year end)
- VAT Remittance: 21st of each month

=== IMPORTANT THRESHOLDS ===

- PIT Exemption: ₦800,000 annual income
- Small Company: ₦50m turnover + ₦250m assets
- VAT Registration: ₦25m turnover
- Severance Tax-Free: Up to ₦50m (increased from ₦10m)
- Rent Relief Cap: ₦500,000 or 20% of rent (whichever is lower)
- CGT Share Exemption: Proceeds <₦150m in 12 months
`;
