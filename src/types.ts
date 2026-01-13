export interface Person {
  id: string;
  name: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'borrow' | 'return';
  date: Date;
}

export type TransactionType = 'borrow' | 'return';