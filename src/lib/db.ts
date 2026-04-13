import mongoose, { Mongoose } from "mongoose";
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// This caches the connection across hot reloads in development
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
