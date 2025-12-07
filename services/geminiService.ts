
import { GoogleGenAI, Type } from "@google/genai";
import { TaxProfile, Transaction } from '../types';
import { TAX_RESEARCH_DOCUMENT } from '../constants';

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
      You are Levy, a helpful Nigerian tax assistant powered by the LevyMate app.
      Your goal is to explain Nigerian tax laws in simple, friendly terms.
      
      === USER CONTEXT ===
      - Persona: ${profile.persona}
      - Entity Type: ${profile.entityType}
      - Annual Gross Est: ₦${totalIncome.toLocaleString()}
      - Rent Paid: ₦${profile.rentPaid.toLocaleString()}
      - State: ${profile.stateOfResidence}
      - Policy Year: ${profile.preferredPolicy === 'ACT_2026_PROPOSED' ? 'Nigeria Tax Act 2025 (Effective 2026)' : 'Finance Act 2020'}
      
      === KNOWLEDGE BASE ===
      Use the following verified research document as your PRIMARY source of truth. 
      Answer questions based on this information. If the answer is not in the document, say so clearly.
      
      ${TAX_RESEARCH_DOCUMENT}
      
      === RESPONSE RULES ===
      1. Be concise, friendly, and use simple language.
      2. Use Naira (₦) for all currency amounts.
      3. Reference specific sections from the knowledge base when relevant.
      4. For state-specific questions, check the State-Specific section.
      5. ALWAYS end with: "⚠️ Disclaimer: I'm an AI assistant. This is educational information, not legal or tax advice. Consult a qualified tax professional for your specific situation."
      6. If the user asks about tax evasion, firmly refuse and explain that tax evasion is a criminal offense with penalties including fines and imprisonment.
      7. Emphasize the difference between "Tax Optimization" (legal) and "Tax Evasion" (illegal).
      8. If something is an ILLEGAL/NUISANCE TAX, tell them clearly and advise how to report it.
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

