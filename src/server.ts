import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import router from "./routes/authRoutes";
import connectDB from "./config/db";
import cors from "cors";

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

app.use("/api/auth", router);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
