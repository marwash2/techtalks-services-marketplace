import { Document } from "mongoose";

export interface ILocation extends Document {
  name: string;
  region?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}