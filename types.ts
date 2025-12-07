// Fix for missing JSX.IntrinsicElements definitions in the environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export enum PersonaType {
  SALARY = 'SalaryEarner',
  BUSINESS = 'SoleProprietor',
  FREELANCER = 'Freelancer',
  COMPANY = 'LimitedLiability',
  CRYPTO = 'CryptoTrader'
}

export enum EntityType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company'
}

export type TransactionSource = 'manual' | 'ocr';
export type TransactionType = 'income' | 'expense';
export type UserTier = 'Free' | 'Pro';
export type TaxPolicyYear = 'ACT_2024' | 'ACT_2026_PROPOSED';
export type TimeFrame = 'monthly' | 'quarterly' | 'yearly';
export type EmployerSector = 'Public' | 'Private';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  category: string;
  description: string;
  source: TransactionSource;
  isVerified?: boolean;
  isTaxDeductible?: boolean; // For WREN test
  hasInputVat?: boolean; // For VAT Recovery (New 2026 Rule)
}

export interface TaxProfile {
  id?: string; // Database ID (optional until saved to cloud)
  name: string;
  email?: string; // Added for Paystack and notifications
  entityType: EntityType;
  persona: PersonaType;
  
  // Contact & Location (New for Compliance)
  stateOfResidence: string;
  phoneNumber: string;

  // Financials
  annualGrossIncome: number; // For Individuals
  annualTurnover: number; // For Companies (Crucial for Small Co. Status)
  totalFixedAssets: number; // For Company classification (<250m)
  
  // Statutory Deductions (PIT) - NTA 2025 Enhanced
  pensionContribution: number; // monthly contribution amount
  nhfContribution: number; // monthly (legacy field for backwards compatibility)
  nhfOptIn: boolean; // NEW: NHF is now voluntary for private sector
  nhisContribution: number; // NEW: NHIS monthly contribution
  employerSector: EmployerSector; // NEW: 'Public' or 'Private' - affects mandatory NHF
  
  // Reliefs (NTA 2025)
  rentPaid: number; // Annual rent for Rent Relief (20% capped at ₦500k)
  rentVerified: boolean; // NEW: Documentation verified for rent relief claim
  lifeInsurance: number; // Annual premium (self)
  lifeInsuranceSpouse: number; // NEW: Spouse life insurance premium (100% deductible)
  
  // Capital Gains (NTA 2025 - Harmonized with PIT bands)
  capitalGains: number; // NEW: Annual capital gains (taxed at marginal rate)
  
  // Data
  transactions: Transaction[];
  tier: UserTier;
  subscriptionExpiryDate?: string; // ISO Date string
  subscriptionPlan?: 'Monthly' | 'Yearly';
  aiQueriesToday: number;
  lastLoginDate: string; 
  preferredPolicy: TaxPolicyYear;
}

export interface TaxBreakdownItem {
  label: string;
  rate: string;
  taxableAmount: number;
  taxAmount: number;
  note?: string;
  isRelief?: boolean;
}

export interface TaxResult {
  policyUsed: TaxPolicyYear;
  statusLabel: string; // e.g., "Small Company (Exempt)" or "High Earner"
  
  // Base Figures
  grossRevenue: number;
  assessableProfit: number; // Net of allowable expenses
  
  // Deductions/Reliefs (NTA 2025 Enhanced)
  deductions: {
    pension: number;
    nhf: number;
    nhis: number; // NEW
    rentRelief: number; // 20% capped at ₦500k
    lifeInsurance: number; // NEW: Total life insurance (self + spouse)
    cra: number; // Old system (0 under NTA 2025)
    capitalGainsTax: number; // NEW: CGT harmonized with PIT bands
    total: number;
  };

  // Liabilities
  taxableIncome: number;
  incomeTaxLiability: number; // CIT or PIT
  developmentLevy: number; // New 4% Levy
  vatOutput: number;
  vatInputCredit: number; // The "Input VAT Revolution"
  vatPayable: number;
  
  totalTaxLiability: number;
  effectiveTaxRate: number;
  
  breakdown: TaxBreakdownItem[];
  insights: string[];
  complianceFlags: string[]; // e.g. "File CIT Returns even if 0 tax"
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// Tax Calculation History Entry
export interface TaxCalculationHistory {
  id: string;
  date: string; // ISO date string
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  policyUsed: TaxPolicyYear;
  breakdown: TaxBreakdownItem[];
  deductions: {
    pension: number;
    nhf: number;
    nhis: number;
    rentRelief: number;
    lifeInsurance: number;
    cra: number;
    capitalGainsTax: number;
    total: number;
  };
}