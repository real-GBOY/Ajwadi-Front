export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  totalReturns: number;
}
