import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data Schema - LevyMate Tax App
 * Maps TypeScript types to DynamoDB with Amplify Gen 2.
 * 
 * Authorization: owner-based (each user can only access their own profile and transactions)
 */
const schema = a.schema({
  /**
   * TaxProfile Model
   * Represents a user's tax profile (Individual or Company)
   * Linked to authenticated user via owner field
   */
  TaxProfile: a.model({
    // Primary key and owner link (implicit - Amplify adds id automatically)
    // owner is implicit in authorization and links to Cognito sub
    
    // User Identity
    name: a.string().required(),
    email: a.string(),
    entityType: a.enum(['Individual', 'Company']).required(), // From EntityType enum
    persona: a.enum(['Salary Earner', 'Sole Proprietor / Enterprise', 'Freelancer', 'Limited Liability Co (Ltd)', 'Crypto Trader']).required(),
    
    // Contact & Compliance
    stateOfResidence: a.string().required(),
    phoneNumber: a.string(),

    // Financials
    annualGrossIncome: a.float(), // For Individuals
    annualTurnover: a.float(), // For Companies (crucial for Small Company status)
    totalFixedAssets: a.float(), // For Company classification

    // Statutory Deductions (monthly amounts that we'll multiply as needed)
    pensionContribution: a.float(), // monthly
    nhfContribution: a.float(), // monthly
    rentPaid: a.float(), // annual
    lifeInsurance: a.float(), // annual

    // Subscription & Usage
    tier: a.enum(['Free', 'Pro']).required(),
    aiQueriesToday: a.integer(), // Resets daily (handled in service)
    lastLoginDate: a.string(), // ISO 8601 date

    // Tax Policy Preference
    preferredPolicy: a.enum(['2024_ACT', '2026_PROPOSED']).required(),

    // Related Transactions (one-to-many relationship)
    transactions: a.hasMany('TransactionModel', 'profileId'),

    // Timestamps (automatic)
    createdAt: a.string(),
    updatedAt: a.string(),
  })
  .authorization(allow => [
    allow.owner() // User can read, create, update, delete their own profile
  ]),

  /**
   * TransactionModel
   * Represents individual income or expense transactions
   * Linked to TaxProfile via profileId
   */
  TransactionModel: a.model({
    // Relationship to parent profile
    profileId: a.id().required(),
    profile: a.belongsTo('TaxProfile', 'profileId'),

    // Transaction Details
    type: a.enum(['income', 'expense']).required(),
    date: a.string().required(), // ISO 8601
    amount: a.float().required(), // In Naira
    category: a.string().required(), // e.g. 'Salary', 'Supplies', 'Rent'
    description: a.string(),

    // Source & Classification
    source: a.enum(['manual', 'ocr', 'whatsapp']),
    isVerified: a.boolean(),
    
    // Tax Treatment (WREN Test & VAT)
    isTaxDeductible: a.boolean(), // Passes WREN test (Wholly, Reasonably, Exclusively, Necessarily)
    hasInputVat: a.boolean(), // Input VAT claimable (2026 rule)

    // Timestamps
    createdAt: a.string(),
    updatedAt: a.string(),
  })
  .authorization(allow => [
    allow.owner() // User can only access transactions for their profile
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // Cognito User Pool
  },
});
