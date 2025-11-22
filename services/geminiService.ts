
import { GoogleGenAI, Type } from "@google/genai";
import { TaxProfile, Transaction } from '../types';

// Initialize Gemini AI
// Safely handle missing API key to prevent crash on load
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = "gemini-2.5-flash";

export const getTaxAdvice = async (profile: TaxProfile, question: string): Promise<string> => {
  if (!ai) return "AI Service Unavailable: API Key not configured.";
  
  try {
    const totalIncome = profile.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0) || profile.annualGrossIncome;

    const systemInstruction = `
      You are Levy, a helpful Nigerian tax assistant. 
      Your goal is to explain Nigerian tax laws (PITA, CITA, Finance Acts) in simple terms.
      
      Context for the user:
      - Persona: ${profile.persona}
      - Annual Gross Est: ₦${totalIncome.toLocaleString()}
      - Rent Paid: ₦${profile.rentPaid.toLocaleString()}
      - Policy Year: ${profile.preferredPolicy === '2026_PROPOSED' ? 'Nigeria Tax Act 2025 (Effective 2026)' : 'Finance Act 2020'}
      
      Key Definitions to use if asked:
      1. **WREN Test (for Expenses)**: An expense is only deductible if it is incurred "Wholly, Reasonably, Exclusively, and Necessarily" for the business. Personal costs, domestic expenses, and capital withdrawals fail this test.
      2. **Input VAT Claim (New 2026 Rule)**: Under the new act, businesses can claim "Input VAT" (VAT paid on purchases) on SERVICES and ASSETS, not just goods sold. This reduces the total VAT they must remit to the government.
      3. **Rent Relief**: Specific deduction of 20% of annual rent paid (capped at ₦500k).
      
      Rules:
      1. Be concise and friendly.
      2. Use Naira (₦) for currency.
      3. ALWAYS include a disclaimer that you are an AI and this is not legal advice.
      4. If the user asks about evasion, strictly refuse and explain the legal consequences.
      5. Focus on "Tax Optimization" (legal) vs "Tax Evasion" (illegal).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the tax knowledge base right now.";
  }
};

export const generateTaxTips = async (profile: TaxProfile): Promise<string> => {
  try {
    const totalIncome = profile.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || profile.annualGrossIncome;
    
    const prompt = `
      Generate 3 specific, legal tax-saving or financial health tips for a Nigerian ${profile.persona} 
      earning approximately ₦${totalIncome.toLocaleString()} annually.
      Format as a simple bulleted list.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Check your pension contributions to optimize tax relief.";
  } catch (error) {
    console.error("Gemini Tips Error:", error);
    return "Keep accurate records of all business expenses to lower your tax liability.";
  }
};

export const parseReceiptImage = async (base64Image: string): Promise<Partial<Transaction>> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Extract the following from this receipt image: Total Amount (number only), Date (YYYY-MM-DD), Merchant Name (as description), and a Category (e.g., Supplies, Food, Utilities). Respond in JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        amount: data.amount,
        date: data.date,
        description: data.description,
        category: data.category,
        type: 'expense',
        source: 'ocr'
      };
    }
    throw new Error("No data extracted");
  } catch (error) {
    console.error("Receipt OCR Error:", error);
    throw error;
  }
};

