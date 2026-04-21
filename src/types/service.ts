import { Document, Types } from "mongoose";

export interface IService extends Document {
  providerId: Types.ObjectId;
  title: string;
  category: Types.ObjectId;
  price: number;
  tags: string[];           // enables AI semantic search + keyword search
  availability: string;
  description:String;
  image:String;
  createdAt: Date;
  updatedAt: Date;
}