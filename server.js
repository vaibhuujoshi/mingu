import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/chatRoomRoutes.js"
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import registerSocketHandler from "./sockets/socketHandler.js";
import { getRooms } from "./services/chatRoomService.js";
import logger from "./utils/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { canSendMessage } from "./utils/socketRateLimiter.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);
app.use(apiLimiter)

connectDB();

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
        logger.error({
            event: "INVALID_TOKEN",
            error: err.message
        });
        socket.disconnect();
        return;
    }

    socket.user = decoded;
    const userId = socket.user.id;

    logger.info({
        event: "USER_CONNECTED",
        userId,
        time: new Date().toISOString()
    });

    const rooms = await getRooms(userId);

    rooms.forEach((room) => {
        socket.join(room.roomId);
    });

    socket.emit("ready");

    socket.on("ready", async (data) => {
        let spamCount = 0;
        if (!canSendMessage(userId)) {
            socket.emit("error_message", "Too many messages. Slow down.");

            if (spamCount > 3) {
                socket.disconnect();
                console.log("Too many requests!!");
            }
        }
    });

    console.log(`User joined ${rooms.length} rooms`);
    console.log("Rooms Joined: ", rooms.map(r => r.roomId));

    registerSocketHandler(io, socket);
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})