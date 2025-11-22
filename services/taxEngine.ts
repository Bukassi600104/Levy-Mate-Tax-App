import { TaxProfile, TaxResult, TaxPolicyYear, EntityType, TransactionType } from '../types';
import { TAX_BANDS_2024, TAX_BANDS_2026, SMALL_COMPANY_TURNOVER_LIMIT } from '../constants';

/**
 * 2026 NIGERIA TAX ENGINE
 * Implements the logic defined in the Research Document.
 */
export class TaxEngine {
  
  // --- DATA AGGREGATION ---
  private static getFinancials(profile: TaxProfile) {
    const txIncome = profile.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const grossIncome = txIncome > 0 ? txIncome : (profile.entityType === EntityType.COMPANY ? profile.annualTurnover : profile.annualGrossIncome);

    // WREN Test: Wholly, Reasonably, Exclusively, Necessarily
    // In the app, we use 'isTaxDeductible' flag
    const allowableExpenses = profile.transactions
      .filter(t => t.type === 'expense' && t.isTaxDeductible)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // VAT Logic (Input VAT Revolution)
    const inputVatClaims = profile.transactions
      .filter(t => t.type === 'expense' && t.hasInputVat)
      .reduce((acc, curr) => acc + curr.amount * (7.5/107.5), 0); // Extract VAT from gross

    return { grossIncome, allowableExpenses, inputVatClaims };
  }

  // --- MAIN CALCULATOR ---
  public static calculate(profile: TaxProfile, policy: TaxPolicyYear = 'ACT_2026_PROPOSED'): TaxResult {
    const { grossIncome, allowableExpenses, inputVatClaims } = this.getFinancials(profile);
    
    // Assessable Profit (Net Income before tax adjustments)
    const assessableProfit = Math.max(0, grossIncome - allowableExpenses);

    if (profile.entityType === EntityType.COMPANY) {
      return this.calculateCIT(profile, grossIncome, assessableProfit, allowableExpenses, inputVatClaims, policy);
    } else {
      return this.calculatePIT(profile, grossIncome, assessableProfit, policy);
    }
  }

  // --- COMPANY INCOME TAX (CIT) ENGINE ---
  private static calculateCIT(
    profile: TaxProfile, 
    turnover: number, 
    profit: number, 
    allowableExpenses: number,
    inputVat: number,
    policy: TaxPolicyYear
  ): TaxResult {
    const isSmallCompany = turnover <= SMALL_COMPANY_TURNOVER_LIMIT;
    const breakdown = [];
    const insights = [];
    const flags = [];

    let citRate = 0;
    let devLevyRate = 0;
    let citTax = 0;
    let devLevy = 0;

    if (policy === 'ACT_2026_PROPOSED') {
      // 1. Small Company Test (Page 8 of Research)
      if (isSmallCompany) {
        citRate = 0;
        devLevyRate = 0; // Exempt from Dev Levy (Page 9)
        insights.push("Status: Small Company. You are EXEMPT from CIT and Dev Levy.");
        flags.push("Mandatory: You must still file CIT returns (Nil Return) to maintain status.");
      } else {
        citRate = 0.30; // Standard rate for large companies (simplified)
        devLevyRate = 0.04; // New Consolidated Development Levy (4%)
        insights.push("Status: Large Company. Standard CIT rate applies.");
      }
    } else {
      // Old Logic (Simplified)
      citRate = turnover < 25000000 ? 0 : 0.30;
      devLevyRate = 0; // Old Education Tax handled differently
    }

    citTax = profit * citRate;
    devLevy = profit * devLevyRate;

    if (citRate > 0) {
      breakdown.push({
        label: "Company Income Tax (CIT)",
        rate: `${(citRate * 100).toFixed(0)}%`,
        taxableAmount: profit,
        taxAmount: citTax
      });
    }
    if (devLevyRate > 0) {
      breakdown.push({
        label: "Development Levy",
        rate: `${(devLevyRate * 100).toFixed(0)}%`,
        taxableAmount: profit,
        taxAmount: devLevy
      });
    }

    // VAT Logic
    const vatOutput = turnover * 0.075; // Assuming standard rated supplies
    const vatPayable = Math.max(0, vatOutput - inputVat);

    if (inputVat > 0) {
        insights.push(`Input VAT Revolution: You recovered ₦${inputVat.toLocaleString()} from your expenses.`);
    }

    return {
      policyUsed: policy,
      statusLabel: isSmallCompany ? "Small Company (Exempt)" : "Large Company",
      grossRevenue: turnover,
      assessableProfit: profit,
      deductions: { pension: 0, nhf: 0, rentRelief: 0, cra: 0, total: allowableExpenses },
      taxableIncome: profit,
      incomeTaxLiability: citTax,
      developmentLevy: devLevy,
      vatOutput,
      vatInputCredit: inputVat,
      vatPayable,
      totalTaxLiability: citTax + devLevy + vatPayable,
      effectiveTaxRate: turnover > 0 ? ((citTax + devLevy) / turnover) * 100 : 0,
      breakdown,
      insights,
      complianceFlags: flags
    };
  }

  // --- PERSONAL INCOME TAX (PIT) ENGINE ---
  private static calculatePIT(
    profile: TaxProfile, 
    grossIncome: number, 
    profit: number, 
    policy: TaxPolicyYear
  ): TaxResult {
    let taxableIncome = 0;
    let taxPayable = 0;
    let cra = 0;
    let rentRelief = 0;
    const breakdown = [];
    const insights = [];
    
    const pension = profile.pensionContribution * 12;
    const nhf = profile.nhfContribution * 12;
    const lifeIns = profile.lifeInsurance; // Annual

    if (policy === 'ACT_2024') {
      // Old Logic: CRA
      const craFixed = 200000;
      const craPercent = grossIncome * 0.01;
      cra = Math.max(craFixed, craPercent) + (grossIncome * 0.20);
      
      const totalReliefs = cra + pension + nhf + lifeIns;
      taxableIncome = Math.max(0, profit - totalReliefs);

      // Old Bands
      let remaining = taxableIncome;
      for (const band of TAX_BANDS_2024) {
        if (remaining <= 0) break;
        const taxOnSlice = Math.min(remaining, band.limit);
        const tax = taxOnSlice * band.rate;
        taxPayable += tax;
        breakdown.push({
          label: `Band ${(band.rate*100).toFixed(0)}%`,
          rate: `${(band.rate*100).toFixed(0)}%`,
          taxableAmount: taxOnSlice,
          taxAmount: tax
        });
        remaining -= taxOnSlice;
      }

    } else {
      // --- 2026 NEW LOGIC ---
      
      // 1. Rent Relief (New specific deduction - Page 5)
      // Formula: MIN(Actual Rent * 0.20, 500,000)
      rentRelief = Math.min(profile.rentPaid * 0.20, 500000);
      if (rentRelief > 0) {
        breakdown.push({
          label: "Rent Relief Claim",
          rate: "20%",
          taxableAmount: profile.rentPaid,
          taxAmount: -rentRelief,
          isRelief: true,
          note: profile.rentPaid * 0.2 > 500000 ? "Capped at ₦500k" : "20% of Rent"
        });
      }

      // CRA Abolished
      cra = 0; 

      // Total Reliefs
      const totalReliefs = pension + nhf + lifeIns + rentRelief;
      taxableIncome = Math.max(0, profit - totalReliefs);

      // New Progressive Bands
      // Check Exemption Threshold
      if (grossIncome <= 800000) {
        taxPayable = 0;
        insights.push("Exempt: Annual income is below the ₦800,000 threshold.");
      } else {
        let remaining = taxableIncome;
        
        for (const band of TAX_BANDS_2026) {
          if (remaining <= 0) break;
          
          const taxOnSlice = Math.min(remaining, band.limit);
          const tax = taxOnSlice * band.rate;
          
          taxPayable += tax;
          
          breakdown.push({
            label: band.note || "Band",
            rate: `${(band.rate*100).toFixed(0)}%`,
            taxableAmount: taxOnSlice,
            taxAmount: tax,
            note: band.rate === 0 ? "First ₦800k Tax Free" : undefined
          });
          
          remaining -= taxOnSlice;
        }
        insights.push("Logic Applied: New Progressive Bands (Finance Act 2025).");
        if (rentRelief > 0) insights.push(`You saved ₦${rentRelief.toLocaleString()} due to the new Rent Relief.`);
      }
    }

    return {
      policyUsed: policy,
      statusLabel: "Individual / Entrepreneur",
      grossRevenue: grossIncome,
      assessableProfit: profit,
      deductions: { pension, nhf, rentRelief, cra, total: pension + nhf + rentRelief + cra + lifeIns },
      taxableIncome,
      incomeTaxLiability: taxPayable,
      developmentLevy: 0,
      vatOutput: 0, // Individuals (usually) don't remit VAT directly unless Enterprise
      vatInputCredit: 0,
      vatPayable: 0,
      totalTaxLiability: taxPayable,
      effectiveTaxRate: grossIncome > 0 ? (taxPayable / grossIncome) * 100 : 0,
      breakdown,
      insights,
      complianceFlags: []
    };
  }
}
