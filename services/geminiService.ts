
import { GoogleGenAI, Type } from "@google/genai";
import { TaxProfile, Transaction } from '../types';
import { TAX_RESEARCH_DOCUMENT } from '../constants';

// Initialize Gemini AI
// Safely handle missing API key to prevent crash on load
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = "gemini-2.5-flash";

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const getTaxAdvice = async (
  profile: TaxProfile | null, 
  question: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
  if (!ai) return "AI Service Unavailable: API Key not configured.";
  
  try {
    const totalIncome = profile 
      ? (profile.transactions?.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) || profile.annualGrossIncome || 0)
      : 0;

    const systemInstruction = `
      You are Levy, a helpful Nigerian tax assistant powered by the LevyMate app.
      Your goal is to explain Nigerian tax laws in simple, friendly terms.
      
      === IMPORTANT BEHAVIOR ===
      - NEVER introduce yourself in responses. The user already knows who you are.
      - Go straight to answering the question without preamble.
      - Be smart about understanding tax-related questions. Questions like "Will I pay tax as a mechanic?", "Do tailors pay tax?", "What about Uber drivers?" ARE tax questions - answer them using the Informal Sector / Presumptive Tax information from the knowledge base.
      - Any question about whether someone pays tax, how much tax, tax rates, tax filing, etc. is a tax question - answer it helpfully.
      
      === TOPICS YOU HANDLE ===
      1. Nigerian tax laws and regulations (PIT, CIT, VAT, CGT, etc.)
      2. Tax for ANY profession or business type (use Informal Sector knowledge for artisans, traders, etc.)
      3. The LevyMate app features and how to use them
      4. Tax compliance, filing, and payment processes in Nigeria
      5. The Nigeria Tax Act 2025 and Finance Act 2020
      
      === OFF-TOPIC HANDLING ===
      Only decline questions that are clearly NOT about taxes or LevyMate (like "What's the weather?" or "Tell me a joke").
      For those, simply say: "That's outside my area! I'm here to help with Nigerian tax questions. What would you like to know about taxes?"
      
      ${profile ? `=== USER CONTEXT ===
      - Persona: ${profile.persona}
      - Entity Type: ${profile.entityType}
      - Annual Gross Est: ₦${totalIncome.toLocaleString()}
      - Rent Paid: ₦${(profile.rentPaid || 0).toLocaleString()}
      - State: ${profile.stateOfResidence}
      - Policy Year: ${profile.preferredPolicy === 'ACT_2026_PROPOSED' ? 'Nigeria Tax Act 2025 (Effective 2026)' : 'Finance Act 2020'}` : ''}
      
      === LEVYMATE APP KNOWLEDGE ===
      LevyMate is a Nigerian tax calculator app that helps individuals and businesses:
      
      FEATURES:
      - Tax Calculator: Calculate PAYE, CIT, and VAT based on both Finance Act 2020 and Nigeria Tax Act 2025
      - Income & Expense Tracking: Log income and expenses with categories
      - Receipt Scanning: OCR-powered receipt scanning for Pro users
      - AI Tax Assistant: Ask questions about Nigerian tax laws (that's me, Levy!)
      - Education Hub: Learn about tax laws with articles and explanations
      - Tax Comparison: Compare tax under old vs new Nigerian tax laws
      - VAT Input Credit: Track and optimize VAT recoveries
      - Compliance Calendar: Never miss filing deadlines
      
      PRICING:
      - Free Plan: Basic calculator, 50 transactions/month, 5 AI queries/day, Education Hub access
      - Pro Plan (₦2,999/month): Unlimited transactions, receipt scanning, CSV export, unlimited AI queries
      
      PERSONAS SUPPORTED:
      - Salary Earner (PAYE): Employees with regular salary income
      - Sole Proprietor/Enterprise: Unincorporated business owners
      - Freelancer: Digital workers, consultants, content creators
      - Limited Company (Ltd): Registered limited liability companies
      - Crypto Trader: Digital asset traders (Capital Gains Tax)
      
      HOW TO USE:
      1. Create an account or use as guest
      2. Select your persona (employment type)
      3. Enter your income and expenses
      4. View calculated tax breakdown
      5. Use AI assistant for questions
      6. Export or save your tax records
      
      === KNOWLEDGE BASE ===
      Use the following verified research document as your PRIMARY and ONLY source of truth for tax information.
      NEVER make up tax rates, thresholds, or rules that are not in this document.
      If the answer is not in the document, say: "I don't have specific information about that in my knowledge base. Please consult FIRS or a tax professional."
      
      ${TAX_RESEARCH_DOCUMENT}
      
      === CONVERSATION STYLE ===
      - Be warm, friendly, and conversational - like a knowledgeable friend helping out
      - NEVER use markdown formatting like ** for bold, - for bullets, or # for headers
      - Write in plain, natural sentences and paragraphs like a human would in a chat
      - Use line breaks between paragraphs for readability
      - Use emojis sparingly to add warmth (1-2 per response max)
      - Go straight to the answer - no introductions or preamble
      - Ask follow-up questions when clarification would help
      - Use "you" and "your" to make it personal
      - Keep responses concise - aim for 2-4 short paragraphs max
      
      === FORMATTING RULES ===
      - NO dashes (-) for lists. Use numbers (1, 2, 3) or write in prose.
      - NO asterisks (**) for bold. Just write normally.
      - NO markdown at all. Write like you're texting a friend.
      - When listing items, use line breaks and numbers, or incorporate into sentences.
      
      === RESPONSE RULES ===
      1. Jump straight into the answer. No "Great question!" or "Sure!" openers.
      2. Use Naira (₦) for all currency amounts.
      3. Reference specific information from the knowledge base when relevant, but present it naturally.
      4. For state-specific questions, check the State-Specific section.
      5. DO NOT add disclaimers at the end of every message - the app already shows a permanent disclaimer.
      6. If the user asks about tax evasion, firmly but kindly explain that's illegal and could lead to serious penalties.
      7. Emphasize the difference between "Tax Optimization" (legal) and "Tax Evasion" (illegal) when relevant.
      8. If something is an ILLEGAL/NUISANCE TAX, tell them clearly and advise how to report it.
      9. When asked about LevyMate Pro plan or pricing, explain the features naturally and end your response with exactly: [SHOW_PRO_CARD]
      10. When asked about the Free plan, how to sign up, or creating a free account, explain the free features and end with exactly: [SHOW_FREE_CARD]
      11. For LevyMate app questions, explain the feature clearly and guide them on how to use it.
    `;

    // Build conversation contents with history for context
    const contents = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: question }] }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
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

