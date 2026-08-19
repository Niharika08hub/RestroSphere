import api from "../api/api";

export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string | null;
}

// Get all customers for logged-in owner's restaurant
export const getCustomers = async () => {
  const response = await api.get("/customers");

  return response.data;
};