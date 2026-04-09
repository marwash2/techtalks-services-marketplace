import mongoose, { Schema, Model } from "mongoose";
import { IProvider } from "@/types/provider";
import { ReviewSchema } from "./Review.model";

const ProviderSchema = new Schema<IProvider>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio:      { type: String, required: true },
    location: { type: String, required: true },
    rating:   { type: Number, default: 0, min: 0, max: 5 },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    reviews:  { type: [ReviewSchema], default: [] }, // embedded for fast profile loads
  },
  { timestamps: true }
);

const Provider: Model<IProvider> =
  mongoose.models.Provider ?? mongoose.model<IProvider>("Provider", ProviderSchema);

export default Provider;