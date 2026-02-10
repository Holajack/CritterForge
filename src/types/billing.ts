export interface CreditPack {
  id: string;
  name: string;
  price: number; // cents
  credits: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  transactionType: "purchase" | "subscription" | "usage" | "refund" | "bonus";
  description?: string;
  createdAt: number;
}
