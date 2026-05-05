import mongoose from "mongoose";
import serviceSchema from "@/lib/schemas/Service.schema";

export const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

 