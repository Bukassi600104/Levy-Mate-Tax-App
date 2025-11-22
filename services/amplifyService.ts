import { generateClient } from 'aws-amplify/api';
import { TaxProfile, Transaction, EntityType, PersonaType } from '../types';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Amplify Service Layer
 * Handles all database operations for TaxProfile and Transactions
 * Automatically handles owner-based authorization
 */

// ============ PROFILE OPERATIONS ============

/**
 * Create a new tax profile
 */
export const createProfile = async (profile: Omit<TaxProfile, 'id'>): Promise<any> => {
  try {
    const result = await client.models.TaxProfile.create({
      name: profile.name,
      email: profile.email || '',
      entityType: profile.entityType,
      persona: profile.persona,
      stateOfResidence: profile.stateOfResidence,
      phoneNumber: profile.phoneNumber,
      annualGrossIncome: profile.annualGrossIncome,
      annualTurnover: profile.annualTurnover,
      totalFixedAssets: profile.totalFixedAssets,
      pensionContribution: profile.pensionContribution,
      nhfContribution: profile.nhfContribution,
      rentPaid: profile.rentPaid,
      lifeInsurance: profile.lifeInsurance,
      tier: profile.tier,
      aiQueriesToday: profile.aiQueriesToday,
      lastLoginDate: profile.lastLoginDate,
      preferredPolicy: profile.preferredPolicy,
    });
    // Return with empty transactions array to satisfy TaxProfile interface
    return { ...result.data, transactions: [] };
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

/**
 * Fetch the current user's profile
 * Amplify automatically filters by owner (authenticated user)
 */
export const getProfile = async (): Promise<any> => {
  try {
    const result = await client.models.TaxProfile.list();
    const profile = result.data?.[0] || null;
    
    if (profile) {
      // Fetch transactions for this profile
      const transactions = await getTransactionsByProfile(profile.id);
      return { ...profile, transactions };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id: string): Promise<any> => {
  try {
    const result = await client.models.TaxProfile.get({ id });
    return result.data || null;
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    throw error;
  }
};

/**
 * Update an existing profile
 */
export const updateProfile = async (id: string, updates: Partial<TaxProfile>): Promise<any> => {
  try {
    // Remove transactions from updates as it's a relation and handled separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transactions, ...safeUpdates } = updates;

    const result = await client.models.TaxProfile.update({
      id,
      ...safeUpdates,
    });
    return result.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Delete a profile (cascades to transactions)
 */
export const deleteProfile = async (id: string): Promise<void> => {
  try {
    await client.models.TaxProfile.delete({ id });
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

// ============ TRANSACTION OPERATIONS ============

/**
 * Create a new transaction
 */
export const createTransaction = async (
  profileId: string,
  transaction: Omit<Transaction, 'id'>
): Promise<any> => {
  try {
    const result = await client.models.TransactionModel.create({
      profileId,
      type: transaction.type,
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      source: transaction.source,
      isVerified: transaction.isVerified || false,
      isTaxDeductible: transaction.isTaxDeductible || false,
      hasInputVat: transaction.hasInputVat || false,
    });
    return result.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Fetch all transactions for a profile
 */
export const getTransactionsByProfile = async (profileId: string): Promise<any[]> => {
  try {
    const result = await client.models.TransactionModel.list({
      filter: {
        profileId: { eq: profileId },
      },
    });
    return result.data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get a single transaction by ID
 */
export const getTransactionById = async (id: string): Promise<any> => {
  try {
    const result = await client.models.TransactionModel.get({ id });
    return result.data || null;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    throw error;
  }
};

/**
 * Update a transaction
 */
export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<any> => {
  try {
    const result = await client.models.TransactionModel.update({
      id,
      ...updates,
    });
    return result.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await client.models.TransactionModel.delete({ id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Batch delete transactions for a profile
 */
export const deleteTransactionsByProfile = async (profileId: string): Promise<void> => {
  try {
    const transactions = await getTransactionsByProfile(profileId);
    await Promise.all(transactions.map(t => deleteTransaction(t.id)));
  } catch (error) {
    console.error('Error batch deleting transactions:', error);
    throw error;
  }
};
