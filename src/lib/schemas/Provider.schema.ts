import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isVerified: { type: Boolean, default: false },
    totalReviews: { type: Number, default: 0 },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

export const Provider =
  mongoose.models.Provider || mongoose.model("Provider", providerSchema);
