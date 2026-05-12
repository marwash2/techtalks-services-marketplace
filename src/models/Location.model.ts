import mongoose, { Schema, Model } from "mongoose";
import { ILocation } from "@/types/location";

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Efficient lookup for provider dropdowns — active locations sorted by name
LocationSchema.index({ isActive: 1, name: 1 });

export const Location: Model<ILocation> =
  mongoose.models.Location ??
  mongoose.model<ILocation>("Location", LocationSchema);