export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
