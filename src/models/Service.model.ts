import mongoose, { Schema, Model } from "mongoose";
import { IService } from "@/types/service";

const ServiceSchema = new Schema<IService>(
  {
    providerId:   { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    title:        { type: String, required: true },
    category:     { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price:        { type: Number, required: true },
    tags:         { type: [String], default: [] }, // powers AI semantic search
    availability: { type: String, required: true },
    description: { type: String },
    image: { type: String, default: null },
     isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Service: Model<IService> =
  mongoose.models.Service ?? mongoose.model<IService>("Service", ServiceSchema);

export default Service;