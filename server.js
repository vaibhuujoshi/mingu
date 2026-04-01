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
import registerSocketHandler from "./sockets/socketHandler.js";
import { getRooms } from "./services/chatRoomService.js";

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

    console.log({
        event: "USER_CONNECTED",
        userId,
        time: new Date().toISOString()
    });

    const rooms = await getRooms(userId);

    rooms.forEach((room) => {
        socket.join(room.roomId);
    });

    socket.emit("ready");

    console.log(`User joined ${rooms.length} rooms`);
    console.log("Rooms Joined: ", rooms.map(r => r.roomId));

    registerSocketHandler(io, socket);
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})