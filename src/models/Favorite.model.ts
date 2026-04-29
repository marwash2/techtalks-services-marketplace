import mongoose, { Schema, Model } from "mongoose";
import { IFavorite } from "@/types/Favorite";

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // favorites never update
  }
);

// A user can only favorite a given service once.
// The duplicate key error (code 11000) is caught in the service layer.
FavoriteSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ?? mongoose.model<IFavorite>("Favorite", FavoriteSchema);