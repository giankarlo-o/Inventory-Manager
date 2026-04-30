export interface Product {
  _id?: string;
  title: string;
  description: string;
  price: number;
  quantityInStock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  errors?: string[];
}
