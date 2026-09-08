export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isLocked: boolean;
}

export interface Settings {
  parcelCharge: number;
  businessDate?: string; // Format YYYY-MM-DD. If not set, uses system date
  theme: 'light' | 'dark';
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  priceAtOrder: number;
  quantity: number;
  parcelQuantity: number;
}

export type OrderStatus = 'DRAFT' | 'PENDING' | 'SUCCESSFUL';
export type PaymentStatus = 'PAID' | 'NOT_PAID';

export interface Order {
  id: string;
  serialNumber: number;
  customerName: string;
  items: OrderItem[];
  parcelChargeAtOrder: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: number;
  completedAt?: number;
  paymentUpdatedAt?: number;
}
