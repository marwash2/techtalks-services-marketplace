import mongoose, { Document, Types } from "mongoose";
import {IService } from "@/types/service";

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
    tags: { type: [String], default: [] },
    availability: { type: String, required: true },
    location: { type: String },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0, min: 0 },
    favoritesCount: { type: Number, default: 0, min: 0 },
  },
  
  { timestamps: true },
);

export default serviceSchema;
