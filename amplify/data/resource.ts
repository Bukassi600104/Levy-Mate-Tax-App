import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data Schema
 * Maps the TaxProfile and Transaction types to DynamoDB.
 */
const schema = a.schema({
  // Enum-like types are stored as strings in DynamoDB
  
  Transaction: a.customType({
    id: a.string().required(),
    type: a.string().required(), // 'income' | 'expense'
    date: a.string().required(),
    amount: a.float().required(),
    category: a.string().required(),
    description: a.string(),
    source: a.string(), // 'manual' | 'ocr' | 'whatsapp'
    isVerified: a.boolean(),
    isTaxDeductible: a.boolean(),
    hasInputVat: a.boolean(),
  }),

  TaxProfile: a.model({
    owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete'])]), // Links to Auth User
    
    name: a.string(),
    entityType: a.string(), // 'Individual' | 'Company'
    persona: a.string(),
    
    // Contact
    stateOfResidence: a.string(),
    phoneNumber: a.string(),

    // Financials
    annualGrossIncome: a.float(),
    annualTurnover: a.float(),
    totalFixedAssets: a.float(),
    
    // Statutory
    pensionContribution: a.float(),
    nhfContribution: a.float(),
    rentPaid: a.float(),
    lifeInsurance: a.float(),
    
    // Transactions (Stored as a JSON list or separate model? 
    // For simplicity in Gen 2, we can use a related model or JSON. 
    // Let's use a related model for scalability)
    transactions: a.hasMany('TransactionModel', 'profileId'),

    tier: a.string(),
    aiQueriesToday: a.integer(),
    lastLoginDate: a.string(),
    preferredPolicy: a.string(),
  })
  .authorization(allow => [allow.owner()]),

  // Separate model for Transactions to allow querying/filtering
  TransactionModel: a.model({
    profileId: a.id().required(),
    profile: a.belongsTo('TaxProfile', 'profileId'),
    
    type: a.string().required(),
    date: a.string().required(),
    amount: a.float().required(),
    category: a.string().required(),
    description: a.string(),
    source: a.string(),
    isVerified: a.boolean(),
    isTaxDeductible: a.boolean(),
    hasInputVat: a.boolean(),
  })
  .authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
