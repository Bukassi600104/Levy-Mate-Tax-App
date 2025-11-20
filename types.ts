
// Fix for missing JSX.IntrinsicElements definitions in the environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export enum PersonaType {
  SALARY = 'Salary Earner',
  BUSINESS = 'Sole Proprietor / Enterprise',
  FREELANCER = 'Freelancer',
  COMPANY = 'Limited Liability Co (Ltd)',
  CRYPTO = 'Crypto Trader'
}

export enum EntityType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company'
}

export type TransactionSource = 'manual' | 'ocr' | 'whatsapp';
export type TransactionType = 'income' | 'expense';
export type UserTier = 'Free' | 'Pro';
export type TaxPolicyYear = '2024_ACT' | '2026_PROPOSED';
export type TimeFrame = 'monthly' | 'quarterly' | 'yearly';

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
  name: string;
  entityType: EntityType;
  persona: PersonaType;
  
  // Contact & Location (New for Compliance)
  stateOfResidence: string;
  phoneNumber: string;

  // Financials
  annualGrossIncome: number; // For Individuals
  annualTurnover: number; // For Companies (Crucial for Small Co. Status)
  totalFixedAssets: number; // For Company classification (<250m)
  
  // Statutory (PIT)
  pensionContribution: number; // monthly
  nhfContribution: number; // monthly
  rentPaid: number; // Annual rent for new relief
  lifeInsurance: number; // Annual premium
  
  // Data
  transactions: Transaction[];
  tier: UserTier;
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
  
  // Deductions/Reliefs
  deductions: {
    pension: number;
    nhf: number;
    rentRelief: number; // The new specific relief
    cra: number; // Old system
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