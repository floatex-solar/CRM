import mongoose from "mongoose";
import appConfig from "./appConfig.js";

const { DATABASE, DATABASE_PASSWORD } = appConfig;

const DB_URI = DATABASE?.replace("<PASSWORD>", DATABASE_PASSWORD || "");

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
