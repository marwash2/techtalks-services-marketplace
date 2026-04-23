import mongoose, { Document, Types } from "mongoose";

export interface IService extends Document {
  providerId: Types.ObjectId;

  categoryId: Types.ObjectId;

  title: string;

  description?: string;

  price: number;

  duration: number;

  image?: string | null;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    image: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
