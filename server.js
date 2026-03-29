import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/chatRoomRoutes.js"
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import ChatRoomModel from "./models/chatRoom.js";
import { sendMessage } from "./services/chatRoomService.js";

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
app.use("/api/chat", roomRoutes);

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        console.log("No token Provided");
        socket.disconnect();
        return;
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.log("Invalid Token");
        socket.disconnect();
        return;
    }

    socket.user = decoded;
    const userId = socket.user.id;

    console.log("User connected:", userId);

    try {
        const rooms = await ChatRoomModel.find({
            participants: userId
        });

        rooms.forEach((room) => {
            socket.join(room._id.toString());
        });

        console.log(`User joined ${rooms.length} rooms`);
    } catch (err) {
        console.log("Room fetch error:", err.message);
    }

    socket.on("send_message", async (data) => {
        console.log("📨 send_message event received");

        try {
            const { roomId, message } = data;

            const savedMessage = await sendMessage(
                userId,
                roomId,
                message
            );

            console.log("✅ Message saved");

            io.to(roomId).emit("receive_message", savedMessage);

        } catch (err) {
            console.log("Error sending message:", err.message);
            socket.emit("error_message", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user?.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})