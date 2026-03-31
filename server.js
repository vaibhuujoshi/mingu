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
import MessageModel from "./models/message.js";
import { sendMessage, lastMessage } from "./services/chatRoomService.js";

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

const onlineUsers = new Map();

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

    onlineUsers.set(userId, socket.id);

    socket.emit("online_users", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("user_online", userId);

    console.log({
        event: "USER_CONNECTED",
        userId,
        time: new Date().toISOString()
    });


    const rooms = await ChatRoomModel.find({
        participants: userId
    });

    rooms.forEach((room) => {
        socket.join(room._id.toString());
    });

    socket.emit("ready");

    console.log(`User joined ${rooms.length} rooms`);
    console.log("Rooms Joined: ", rooms.map(r => r._id.toString()));

    socket.on("sync_messages", async (data) => {
        try {
            const { roomId } = data;

            const lastEntry = await lastMessage(userId, roomId);

            socket.emit("sync_messages", lastEntry);
        } catch (err) {
            console.log("Error getting message:", err.message);
            socket.emit("error_message", err.message);
        }
    })

    socket.on("send_message", async (data) => {
        console.log("📨 send_message event received");

        try {
            const { roomId, message } = data;

            const roomExist = await ChatRoomModel.findById(roomId);

            if (!roomExist) {
                socket.emit("error_message", "ROOM_NOT_FOUND");
                return;
            }

            const savedMessage = await MessageModel.create({
                senderId: userId,
                roomId,
                message,
                deliveredTo: [userId],
                readBy: []
            })

            console.log({
                event: "SEND_MESSAGE",
                userId,
                roomId,
                message
            });

            const messageId = savedMessage._id;

            socket.to(roomId).emit("receive_message", savedMessage);

            io.to(roomId).emit("message_delivered", {
                messageId
            })

        } catch (err) {
            console.log("Error sending message:", err.message);
            socket.emit("error_message", err.message);
        }
    });

    socket.on("read_message", async (data) => {
        const { messageId, roomId } = data;

        try {
            await MessageModel.findByIdAndUpdate(
                messageId,
                { $addToSet: { readBy: userId } }
            )
        } catch (err) {
            console.error("READ ERROR:", err.message);
        }

        socket.to(roomId).emit("message_read", { messageId, userId });
    })

    socket.on("message_delivered", async (data) => {
        const { messageId, roomId } = data;

        try {
            await MessageModel.findByIdAndUpdate(
                messageId,
                { $addToSet: { deliveredTo: userId } }
            )

        } catch (err) {
            console.error("DELIVERY ERROR:", err.message);
        }
    })

    socket.on("typing", async (data) => {
        const { roomId } = data;

        if (!roomId) {
            socket.emit("error_message", "ROOM_NOT_FOUND");
            return;
        }

        socket.to(roomId).emit("typing", {
            userId
        });
    });

    socket.on("stop_typing", async (data) => {
        const { roomId } = data;

        if (!roomId) {
            socket.emit("error_message", "ROOM_NOT_FOUND");
            return;
        }

        socket.to(roomId).emit("stop_typing", {
            userId
        });
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);

        socket.broadcast.emit("user_offline", userId);

        console.log("User disconnected:", socket.user?.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})