import mongoose from "mongoose";
import providerSchema from "@/lib/schemas/Provider.schema";

export const Provider =
  mongoose.models.Provider || mongoose.model("Provider", providerSchema);