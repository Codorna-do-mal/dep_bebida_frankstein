import { Product, Employee, Sale, CashRegister, StockMovement } from '../types';

// Mock products
export const products: Product[] = [
  {
    id: '',
    name: '',
    category: '',
    price: 0,
    cost: 0,
    description: '',
    imageUrl: '',
    barcode: '',
    volume: '',
    stockQuantity: 0,
    minStockQuantity: 0
  },
  {
    id: '2',
    name: 'Heineken',
    category: 'Cerveja',
    price: 6.99,
    cost: 4.50,
    description: 'Cerveja Heineken 350ml',
    imageUrl: 'https://images.pexels.com/photos/2286972/pexels-photo-2286972.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7896045506130',
    volume: '350ml',
    stockQuantity: 85,
    minStockQuantity: 15
  },
  {
    id: '3',
    name: 'Coca-Cola',
    category: 'Refrigerante',
    price: 8.99,
    cost: 5.99,
    description: 'Refrigerante Coca-Cola 2L',
    imageUrl: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7894900011517',
    volume: '2L',
    stockQuantity: 40,
    minStockQuantity: 10
  },
  {
    id: '4',
    name: 'Guaraná Antarctica',
    category: 'Refrigerante',
    price: 7.99,
    cost: 4.99,
    description: 'Refrigerante Guaraná Antarctica 2L',
    imageUrl: 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7891991000833',
    volume: '2L',
    stockQuantity: 35,
    minStockQuantity: 8
  },
  {
    id: '5',
    name: 'Água Crystal',
    category: 'Água',
    price: 2.50,
    cost: 1.20,
    description: 'Água Mineral Crystal 500ml',
    imageUrl: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7894900530001',
    volume: '500ml',
    stockQuantity: 150,
    minStockQuantity: 30
  },
  {
    id: '6',
    name: 'Skol',
    category: 'Cerveja',
    price: 4.50,
    cost: 2.80,
    description: 'Cerveja Skol 350ml',
    imageUrl: 'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7891149104107',
    volume: '350ml',
    stockQuantity: 100,
    minStockQuantity: 20
  },
  {
    id: '7',
    name: 'Vodka Smirnoff',
    category: 'Destilados',
    price: 39.90,
    cost: 25.00,
    description: 'Vodka Smirnoff 998ml',
    imageUrl: 'https://images.pexels.com/photos/1304378/pexels-photo-1304378.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '7893218000495',
    volume: '998ml',
    stockQuantity: 25,
    minStockQuantity: 5
  },
  {
    id: '8',
    name: 'Red Bull',
    category: 'Energético',
    price: 9.99,
    cost: 6.50,
    description: 'Energético Red Bull 250ml',
    imageUrl: 'https://images.pexels.com/photos/2668308/pexels-photo-2668308.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    barcode: '9002490100070',
    volume: '250ml',
    stockQuantity: 45,
    minStockQuantity: 10
  }
];

// Mock employees
export const employees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@deposito.com',
    phone: '(11) 98765-4321',
    role: 'gestor',
    hireDate: '2022-01-15'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@deposito.com',
    phone: '(11) 98765-1234',
    role: 'funcionario',
    hireDate: '2022-03-10'
  },
  {
    id: '3',
    name: 'Pedro Santos',
    email: 'pedro@deposito.com',
    phone: '(11) 97654-3210',
    role: 'funcionario',
    hireDate: '2022-06-20'
  }
];

// Mock sales
export const sales: Sale[] = [
  {
    id: '1',
    items: [
      {
        productId: '1',
        productName: 'Brahma Duplo Malte',
        quantity: 6,
        unitPrice: 4.99,
        totalPrice: 29.94
      },
      {
        productId: '3',
        productName: 'Coca-Cola',
        quantity: 1,
        unitPrice: 8.99,
        totalPrice: 8.99
      }
    ],
    totalAmount: 38.93,
    discount: 0,
    finalAmount: 38.93,
    paymentMethod: 'dinheiro',
    change: 1.07,
    date: '2023-05-15T15:30:00',
    employeeId: '2',
    employeeName: 'Maria Oliveira'
  },
  {
    id: '2',
    items: [
      {
        productId: '2',
        productName: 'Heineken',
        quantity: 12,
        unitPrice: 6.99,
        totalPrice: 83.88
      }
    ],
    totalAmount: 83.88,
    discount: 5,
    finalAmount: 78.88,
    paymentMethod: 'pix',
    date: '2023-05-15T18:45:00',
    employeeId: '3',
    employeeName: 'Pedro Santos'
  },
  {
    id: '3',
    items: [
      {
        productId: '5',
        productName: 'Água Crystal',
        quantity: 2,
        unitPrice: 2.50,
        totalPrice: 5.00
      },
      {
        productId: '7',
        productName: 'Vodka Smirnoff',
        quantity: 1,
        unitPrice: 39.90,
        totalPrice: 39.90
      }
    ],
    totalAmount: 44.90,
    discount: 0,
    finalAmount: 44.90,
    paymentMethod: 'cartao',
    date: '2023-05-16T10:15:00',
    employeeId: '2',
    employeeName: 'Maria Oliveira'
  }
];

// Mock cash register
export const cashRegister: CashRegister = {
  id: '1',
  status: 'open',
  openedAt: '2023-05-15T08:00:00',
  initialAmount: 100.00,
  sales: 162.71,
  cashIn: 0,
  cashOut: 50.00,
  employeeId: '1',
  employeeName: 'João Silva'
};

// Mock stock movements
export const stockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Brahma Duplo Malte',
    type: 'in',
    quantity: 60,
    reason: 'Compra fornecedor',
    date: '2023-05-10T09:30:00',
    employeeId: '1'
  },
  {
    id: '2',
    productId: '1',
    productName: 'Brahma Duplo Malte',
    type: 'out',
    quantity: 6,
    reason: 'Venda',
    date: '2023-05-15T15:30:00',
    employeeId: '2'
  },
  {
    id: '3',
    productId: '2',
    productName: 'Heineken',
    type: 'in',
    quantity: 48,
    reason: 'Compra fornecedor',
    date: '2023-05-12T11:15:00',
    employeeId: '1'
  },
  {
    id: '4',
    productId: '2',
    productName: 'Heineken',
    type: 'out',
    quantity: 12,
    reason: 'Venda',
    date: '2023-05-15T18:45:00',
    employeeId: '3'
  }
];

// Product categories
export const categories = [
  'Cerveja',
  'Refrigerante',
  'Água',
  'Destilados',
  'Energético',
  'Suco',
  'Vinho',
  'Outros'
];

// Payment methods
export const paymentMethods = [
  { id: 'dinheiro', name: 'Dinheiro' },
  { id: 'pix', name: 'PIX' },
  { id: 'cartao', name: 'Cartão' }
];