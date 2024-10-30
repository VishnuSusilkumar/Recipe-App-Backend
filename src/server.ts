import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes";
import connectDB from "./config/db";
import cors from "cors";
import recipeRouter from "./routes/recipeRoutes";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/recipes", recipeRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
