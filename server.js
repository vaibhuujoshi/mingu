import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const MongoDB_URL = process.env.MONGODB_CON;

mongoose.connect(MongoDB_URL)
    .then(() => {
        console.log("MongoDB connected");
    });

app.use("/api/user", userRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})