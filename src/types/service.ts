import { Document, Types } from "mongoose";

export interface IService extends Document {
  providerId: Types.ObjectId;
  title: string;
  categoryId: Types.ObjectId;
  price: number;
  duration: number; // in minutes
  tags: string[]; // enables AI semantic search + keyword search
  availability: string;
  description: string;
  location: string;
  image: string;
  reviews?: Types.ObjectId[]; 
  averageRating: number;
  reviewCount: number;
  favoritesCount: number;
  // for future use, to link to Review documents
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // for soft deletes and admin control
}
