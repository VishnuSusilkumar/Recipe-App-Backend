import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    console.log("Attempting to connect to database.....");
    await mongoose.connect(process.env.MONGO_URI as string, {});
    console.log("Connected to database.....");
  } catch (error: any) {
    console.log("Failed to connect to database.....", error.message);
    process.exit(1);
  }
};

export default connectDB;
