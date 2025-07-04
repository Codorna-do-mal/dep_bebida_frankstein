// Legacy types for compatibility - now using database types from services/database.ts
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  description: string;
  imageUrl: string;
  barcode?: string;
  volume?: string;
  stockQuantity: number;
  minStockQuantity: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'gestor' | 'funcionario';
  hireDate: string;
}

export interface Sale {
  id: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
  change?: number;
  date: string;
  employeeId: string;
  employeeName: string;
}

export interface CashRegister {
  id: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount?: number;
  sales: number;
  cashIn: number;
  cashOut: number;
  employeeId: string;
  employeeName: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'refund' | 'expense' | 'cashin' | 'cashout';
  amount: number;
  description: string;
  date: string;
  employeeId: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: string;
  employeeId: string;
}