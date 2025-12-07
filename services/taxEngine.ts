import { TaxProfile, TaxResult, TaxPolicyYear, EntityType, TaxBreakdownItem } from '../types';
import { 
  TAX_BANDS_2024, 
  TAX_BANDS_2026, 
  SMALL_COMPANY_TURNOVER_LIMIT,
  RENT_RELIEF_RATE,
  RENT_RELIEF_CAP,
  PIT_EXEMPTION_THRESHOLD,
  PENSION_EMPLOYEE_RATE,
  NHF_RATE,
  NHIS_RATE,
  CIT_RATE_SMALL,
  CIT_RATE_LARGE,
  DEVELOPMENT_LEVY_RATE,
  VAT_STANDARD_RATE
} from '../constants';

/**
 * NIGERIA TAX ACT 2025 ENGINE (Effective January 1, 2026)
 * 
 * Implements the complete NTA 2025 tax calculation logic including:
 * - 6-band progressive PIT (0% to 25%)
 * - Rent Relief (20% capped at ₦500,000)
 * - Voluntary NHF for private sector
 * - Capital Gains harmonized with PIT bands
 * - Binary CIT system (0% small / 30% large)
 * - 4% Unified Development Levy
 * 
 * Source: Nigeria Tax Act 2025 Technical Specification
 */
export class TaxEngine {
  
  // --- UTILITY FUNCTIONS ---
  private static formatNaira(amount: number): string {
    return `₦${amount.toLocaleString('en-NG')}`;
  }

  // --- DATA AGGREGATION ---
  private static getFinancials(profile: TaxProfile) {
    const txIncome = (profile.transactions || [])
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    const rawGrossIncome = txIncome > 0 
      ? txIncome 
      : (profile.entityType === EntityType.COMPANY ? profile.annualTurnover : profile.annualGrossIncome);
    
    // Ensure grossIncome is never undefined or NaN
    const grossIncome = rawGrossIncome || 0;

    // WREN Test: Wholly, Reasonably, Exclusively, Necessarily
    const allowableExpenses = (profile.transactions || [])
      .filter(t => t.type === 'expense' && t.isTaxDeductible)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // VAT Logic (Input VAT Recovery)
    const inputVatClaims = (profile.transactions || [])
      .filter(t => t.type === 'expense' && t.hasInputVat)
      .reduce((acc, curr) => acc + (curr.amount || 0) * (VAT_STANDARD_RATE / (1 + VAT_STANDARD_RATE)), 0);

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
  // NTA 2025: Binary system (0% small / 30% large) + 4% Development Levy
  private static calculateCIT(
    profile: TaxProfile, 
    turnover: number, 
    profit: number, 
    allowableExpenses: number,
    inputVat: number,
    policy: TaxPolicyYear
  ): TaxResult {
    const isSmallCompany = turnover <= SMALL_COMPANY_TURNOVER_LIMIT;
    const breakdown: TaxBreakdownItem[] = [];
    const insights: string[] = [];
    const flags: string[] = [];

    let citRate = 0;
    let devLevyRate = 0;
    let citTax = 0;
    let devLevy = 0;

    if (policy === 'ACT_2026_PROPOSED') {
      // NTA 2025: Binary CIT System
      if (isSmallCompany) {
        citRate = CIT_RATE_SMALL; // 0%
        devLevyRate = 0; // Small companies exempt from Development Levy
        insights.push(`✅ Small Company Status: Turnover ≤ ${this.formatNaira(SMALL_COMPANY_TURNOVER_LIMIT)}`);
        insights.push("🎉 You are EXEMPT from CIT and Development Levy under NTA 2025.");
        flags.push("📋 Mandatory: File CIT returns (Nil Return) to maintain exempt status.");
      } else {
        citRate = CIT_RATE_LARGE; // 30%
        devLevyRate = DEVELOPMENT_LEVY_RATE; // 4% unified levy
        insights.push(`📊 Large Company: Turnover > ${this.formatNaira(SMALL_COMPANY_TURNOVER_LIMIT)}`);
        insights.push("Standard 30% CIT rate applies. 4% Development Levy replaces TET, NITDA, NASENI levies.");
      }
    } else {
      // Old Logic (Finance Act 2020) - Simplified for comparison
      citRate = turnover < 25000000 ? 0 : 0.30;
      devLevyRate = turnover >= 25000000 ? 0.02 : 0; // Old Education Tax
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
        label: policy === 'ACT_2026_PROPOSED' ? "Development Levy (Unified)" : "Education Tax",
        rate: `${(devLevyRate * 100).toFixed(1)}%`,
        taxableAmount: profit,
        taxAmount: devLevy,
        note: policy === 'ACT_2026_PROPOSED' ? "Replaces TET, NITDA, NASENI, Police Trust Fund" : undefined
      });
    }

    // VAT Calculation
    const vatOutput = turnover * VAT_STANDARD_RATE;
    const vatPayable = Math.max(0, vatOutput - inputVat);

    if (inputVat > 0) {
      insights.push(`💰 Input VAT Recovery: ${this.formatNaira(inputVat)} claimed from expenses.`);
      breakdown.push({
        label: "VAT Input Credit",
        rate: "7.5%",
        taxableAmount: inputVat / VAT_STANDARD_RATE,
        taxAmount: -inputVat,
        isRelief: true,
        note: "Recovered from business expenses"
      });
    }

    // NTA 2025: Minimum Tax Abolished
    if (policy === 'ACT_2026_PROPOSED' && profit <= 0) {
      insights.push("📈 Good news: Minimum Tax abolished under NTA 2025. No tax on losses.");
    }

    return {
      policyUsed: policy,
      statusLabel: isSmallCompany ? "Small Company (Exempt)" : "Large Company",
      grossRevenue: turnover,
      assessableProfit: profit,
      deductions: { 
        pension: 0, 
        nhf: 0, 
        nhis: 0,
        rentRelief: 0, 
        lifeInsurance: 0,
        cra: 0, 
        capitalGainsTax: 0,
        total: allowableExpenses 
      },
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
  // NTA 2025: 6-band progressive system with enhanced reliefs
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
    let capitalGainsTax = 0;
    const breakdown: TaxBreakdownItem[] = [];
    const insights: string[] = [];
    const flags: string[] = [];
    
    // --- STATUTORY DEDUCTIONS ---
    // Pension: 8% of (Basic + Housing + Transport) - Annualized
    const pensionBase = grossIncome;
    const pension = profile.pensionContribution * 12;
    
    // NHF: 2.5% of Gross Income
    // NTA 2025: Voluntary for private sector, mandatory for public
    let nhf = 0;
    const isNhfMandatory = profile.employerSector === 'Public';
    const isNhfActive = isNhfMandatory || profile.nhfOptIn;
    
    if (isNhfActive) {
      nhf = grossIncome * NHF_RATE;
    }
    
    // NHIS: 5% of Basic (if enrolled)
    const nhis = (profile.nhisContribution || 0) * 12;
    
    // Life Insurance: 100% deductible (self + spouse)
    const lifeInsTotal = (profile.lifeInsurance || 0) + (profile.lifeInsuranceSpouse || 0);

    if (policy === 'ACT_2024') {
      // ==========================================
      // OLD LOGIC: Finance Act 2020 with CRA
      // ==========================================
      const craFixed = 200000;
      const craPercent = grossIncome * 0.01;
      cra = Math.max(craFixed, craPercent) + (grossIncome * 0.20);
      
      breakdown.push({
        label: "Consolidated Relief Allowance",
        rate: "20%+",
        taxableAmount: grossIncome,
        taxAmount: -cra,
        isRelief: true,
        note: "₦200k or 1% (higher) + 20% of Gross"
      });
      
      const totalReliefs = cra + pension + (profile.nhfContribution * 12) + lifeInsTotal;
      taxableIncome = Math.max(0, profit - totalReliefs);

      // Old Progressive Bands (7% to 24%)
      let remaining = taxableIncome;
      for (const band of TAX_BANDS_2024) {
        if (remaining <= 0) break;
        const taxOnSlice = Math.min(remaining, band.limit);
        const tax = taxOnSlice * band.rate;
        taxPayable += tax;
        if (tax > 0) {
          breakdown.push({
            label: `Band ${(band.rate * 100).toFixed(0)}%`,
            rate: `${(band.rate * 100).toFixed(0)}%`,
            taxableAmount: taxOnSlice,
            taxAmount: tax
          });
        }
        remaining -= taxOnSlice;
      }
      
      insights.push("📜 Calculation using Finance Act 2020 (Old Rules).");

    } else {
      // ==========================================
      // NTA 2025 LOGIC: New Progressive System
      // ==========================================
      
      // --- RENT RELIEF ---
      // Formula: MIN(Actual Rent × 20%, ₦500,000)
      if (profile.rentPaid > 0) {
        const rentCalc = profile.rentPaid * RENT_RELIEF_RATE;
        const isRentCapped = rentCalc > RENT_RELIEF_CAP;
        
        // Only apply if verified OR we're being lenient for simulation
        const rentVerified = profile.rentVerified !== false;
        
        if (rentVerified) {
          rentRelief = Math.min(rentCalc, RENT_RELIEF_CAP);
          
          breakdown.push({
            label: "Rent Relief",
            rate: "20%",
            taxableAmount: profile.rentPaid,
            taxAmount: -rentRelief,
            isRelief: true,
            note: isRentCapped ? `Capped at ${this.formatNaira(RENT_RELIEF_CAP)}` : "20% of Annual Rent"
          });
          
          if (isRentCapped) {
            insights.push(`📋 Rent Relief capped: Your ${this.formatNaira(rentCalc)} claim reduced to ${this.formatNaira(RENT_RELIEF_CAP)} maximum.`);
          }
        } else {
          insights.push("⚠️ Rent Relief requires verified documentation. Upload rent receipts to claim.");
          flags.push("Action: Verify rent receipts to claim up to ₦500,000 relief.");
        }
      }

      // CRA Abolished under NTA 2025
      cra = 0;

      // --- STATUTORY DEDUCTIONS BREAKDOWN ---
      if (pension > 0) {
        breakdown.push({
          label: "Pension Contribution",
          rate: `${(PENSION_EMPLOYEE_RATE * 100).toFixed(0)}%`,
          taxableAmount: pensionBase,
          taxAmount: -pension,
          isRelief: true,
          note: "Tax-exempt under PRA"
        });
      }
      
      if (nhf > 0) {
        breakdown.push({
          label: isNhfMandatory ? "NHF (Mandatory)" : "NHF (Voluntary)",
          rate: `${(NHF_RATE * 100).toFixed(1)}%`,
          taxableAmount: grossIncome,
          taxAmount: -nhf,
          isRelief: true,
          note: isNhfMandatory ? "Public sector requirement" : "Opted in"
        });
      } else if (profile.employerSector === 'Private' && !profile.nhfOptIn) {
        insights.push("💡 NHF is now voluntary for private sector under NTA 2025. You can opt-in for ₦" + Math.round(grossIncome * NHF_RATE).toLocaleString() + " annual deduction.");
      }
      
      if (nhis > 0) {
        breakdown.push({
          label: "NHIS Contribution",
          rate: `${(NHIS_RATE * 100).toFixed(0)}%`,
          taxableAmount: grossIncome,
          taxAmount: -nhis,
          isRelief: true,
          note: "Health insurance"
        });
      }
      
      if (lifeInsTotal > 0) {
        breakdown.push({
          label: "Life Insurance Premium",
          rate: "100%",
          taxableAmount: lifeInsTotal,
          taxAmount: -lifeInsTotal,
          isRelief: true,
          note: "Self + Spouse (fully deductible)"
        });
      }

      // --- TOTAL RELIEFS & TAXABLE INCOME ---
      const totalStatutoryDeductions = pension + nhf + nhis;
      const totalReliefs = rentRelief + lifeInsTotal;
      const totalDeductions = totalStatutoryDeductions + totalReliefs;
      
      taxableIncome = Math.max(0, profit - totalDeductions);

      // --- CAPITAL GAINS TAX (Harmonized with PIT) ---
      // NTA 2025: CGT now taxed at marginal PIT rate instead of flat 10%
      const capitalGains = profile.capitalGains || 0;
      if (capitalGains > 0) {
        taxableIncome += capitalGains;
        insights.push(`📈 Capital Gains of ${this.formatNaira(capitalGains)} added to income (taxed at marginal rate under NTA 2025).`);
      }

      // --- TAX EXEMPTION CHECK ---
      // NTA 2025: First ₦800,000 is tax-free (minimum wage protection)
      if (grossIncome <= PIT_EXEMPTION_THRESHOLD) {
        taxPayable = 0;
        insights.push(`🎉 Tax Exempt: Annual income of ${this.formatNaira(grossIncome)} is below the ${this.formatNaira(PIT_EXEMPTION_THRESHOLD)} threshold.`);
        breakdown.push({
          label: "Exemption (First ₦800k)",
          rate: "0%",
          taxableAmount: grossIncome,
          taxAmount: 0,
          note: "NTA 2025 minimum wage protection"
        });
      } else {
        // --- PROGRESSIVE TAX BANDS ---
        let remaining = taxableIncome;
        let bandIndex = 0;
        
        for (const band of TAX_BANDS_2026) {
          if (remaining <= 0) break;
          
          const taxOnSlice = Math.min(remaining, band.limit);
          const tax = taxOnSlice * band.rate;
          
          taxPayable += tax;
          
          if (taxOnSlice > 0) {
            breakdown.push({
              label: band.note || `Band ${bandIndex + 1}`,
              rate: `${(band.rate * 100).toFixed(0)}%`,
              taxableAmount: taxOnSlice,
              taxAmount: tax,
              note: band.rate === 0 ? "Tax-free threshold" : undefined
            });
          }
          
          remaining -= taxOnSlice;
          bandIndex++;
        }
        
        // Calculate CGT portion if applicable
        if (capitalGains > 0 && taxPayable > 0) {
          const effectiveRate = taxableIncome > 0 ? taxPayable / taxableIncome : 0;
          capitalGainsTax = capitalGains * effectiveRate;
          
          breakdown.push({
            label: "Capital Gains Tax",
            rate: `${(effectiveRate * 100).toFixed(1)}%`,
            taxableAmount: capitalGains,
            taxAmount: capitalGainsTax,
            note: "At marginal PIT rate (NTA 2025)"
          });
        }
      }

      // --- INSIGHTS ---
      insights.push("📊 Calculated using Nigeria Tax Act 2025 (Effective Jan 1, 2026).");
      
      if (rentRelief > 0) {
        insights.push(`🏠 Rent Relief saved you ${this.formatNaira(rentRelief)} in taxes.`);
      }
      
      const effectiveRate = grossIncome > 0 ? (taxPayable / grossIncome) * 100 : 0;
      if (effectiveRate > 0) {
        insights.push(`📉 Effective Tax Rate: ${effectiveRate.toFixed(2)}% of gross income.`);
      }
      
      // Compare with old system
      if (grossIncome > 3000000) {
        const oldCra = Math.max(200000, grossIncome * 0.01) + (grossIncome * 0.20);
        const craVsRent = oldCra - rentRelief;
        if (craVsRent > 0) {
          insights.push(`⚠️ Note: Under old CRA rules, you would have had ${this.formatNaira(oldCra)} relief vs ${this.formatNaira(rentRelief)} Rent Relief.`);
        }
      }
    }

    // --- STATUS LABEL ---
    let statusLabel = "Individual";
    if (grossIncome <= PIT_EXEMPTION_THRESHOLD) {
      statusLabel = "Exempt (Below Threshold)";
    } else if (grossIncome > 50000000) {
      statusLabel = "High Net Worth Individual";
    } else if (grossIncome > 12000000) {
      statusLabel = "High Earner";
    } else if (grossIncome > 3000000) {
      statusLabel = "Middle Income";
    } else {
      statusLabel = "Standard Taxpayer";
    }

    return {
      policyUsed: policy,
      statusLabel,
      grossRevenue: grossIncome,
      assessableProfit: profit,
      deductions: { 
        pension, 
        nhf, 
        nhis,
        rentRelief, 
        lifeInsurance: lifeInsTotal,
        cra, 
        capitalGainsTax,
        total: pension + nhf + nhis + rentRelief + lifeInsTotal + cra 
      },
      taxableIncome,
      incomeTaxLiability: taxPayable,
      developmentLevy: 0,
      vatOutput: 0,
      vatInputCredit: 0,
      vatPayable: 0,
      totalTaxLiability: taxPayable,
      effectiveTaxRate: grossIncome > 0 ? (taxPayable / grossIncome) * 100 : 0,
      breakdown,
      insights,
      complianceFlags: flags
    };
  }
}
