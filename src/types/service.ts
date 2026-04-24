import { Document, Types } from "mongoose";

export interface IService extends Document {
  providerId: Types.ObjectId;
  title: string;
  categoryId: Types.ObjectId;
  price: number;
  tags: string[]; // enables AI semantic search + keyword search
  availability: string;
  description: string;
  location: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // for soft deletes and admin control
}
