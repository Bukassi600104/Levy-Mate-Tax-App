/**
 * Gemini AI Service
 *
 * This service proxies all Gemini API calls through a secure Lambda function.
 * The API key is stored server-side and never exposed to the client.
 */

import { TaxProfile, Transaction } from '../types';
import outputs from '../amplify_outputs.json';

// Get the Lambda proxy URL from Amplify outputs
const GEMINI_PROXY_URL = (outputs as any).custom?.geminiProxyUrl || '';

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface ProxyResponse {
  result?: string | object;
  error?: string;
  message?: string;
}

/**
 * Check if AI service is available
 */
export const isAIAvailable = (): boolean => {
  return Boolean(GEMINI_PROXY_URL);
};

/**
 * Get tax advice from the AI assistant
 */
export const getTaxAdvice = async (
  profile: TaxProfile | null,
  question: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
  if (!GEMINI_PROXY_URL) {
    return "AI Service Unavailable: Backend not configured. Please run 'npx ampx sandbox' to set up the backend.";
  }

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getTaxAdvice',
        payload: {
          profile: profile ? {
            persona: profile.persona,
            entityType: profile.entityType,
            stateOfResidence: profile.stateOfResidence,
            annualGrossIncome: profile.annualGrossIncome,
            rentPaid: profile.rentPaid,
            preferredPolicy: profile.preferredPolicy,
            transactions: profile.transactions?.map(t => ({
              type: t.type,
              amount: t.amount
            }))
          } : null,
          question,
          conversationHistory
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: ProxyResponse = await response.json();

    if (data.error) {
      console.error('Gemini Proxy Error:', data.error, data.message);
      return "Sorry, I'm having trouble connecting to the tax knowledge base right now.";
    }

    return (data.result as string) || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the tax knowledge base right now.";
  }
};

/**
 * Generate personalized tax tips
 */
export const generateTaxTips = async (profile: TaxProfile): Promise<string> => {
  if (!GEMINI_PROXY_URL) {
    return "Keep accurate records of all business expenses to lower your tax liability.";
  }

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateTips',
        payload: {
          profile: {
            persona: profile.persona,
            entityType: profile.entityType,
            stateOfResidence: profile.stateOfResidence,
            annualGrossIncome: profile.annualGrossIncome,
            transactions: profile.transactions?.map(t => ({
              type: t.type,
              amount: t.amount
            }))
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: ProxyResponse = await response.json();

    if (data.error) {
      console.error('Gemini Tips Error:', data.error);
      return "Check your pension contributions to optimize tax relief.";
    }

    return (data.result as string) || "Check your pension contributions to optimize tax relief.";
  } catch (error) {
    console.error("Gemini Tips Error:", error);
    return "Keep accurate records of all business expenses to lower your tax liability.";
  }
};

/**
 * Parse receipt image using OCR
 */
export const parseReceiptImage = async (base64Image: string): Promise<Partial<Transaction>> => {
  if (!GEMINI_PROXY_URL) {
    throw new Error("AI Service Unavailable: Backend not configured.");
  }

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'parseReceipt',
        payload: {
          base64Image
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: ProxyResponse = await response.json();

    if (data.error) {
      throw new Error(data.message || data.error);
    }

    const result = data.result as {
      amount: number;
      date: string;
      description: string;
      category: string;
      type: string;
      source: string;
    };

    return {
      amount: result.amount,
      date: result.date,
      description: result.description,
      category: result.category,
      type: 'expense',
      source: 'ocr'
    };
  } catch (error) {
    console.error("Receipt OCR Error:", error);
    throw error;
  }
};
