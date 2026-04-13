import MessageModel from "../models/message.js";
import { lastMessage } from "../services/chatRoomService.js";
import ChatRoomModel from "../models/chatRoom.js";
import logger from "../utils/logger.js";
import { pubClient } from "../config/redis.js";

export async function messageConnection(io, socket) {
    const userId = socket.user.id;

    const socketId = await pubClient.get(`user:${userId}`);

    socket.on("sync_messages", async (data) => {
        try {
            const { roomId } = data;

            const lastEntry = await lastMessage(userId, roomId);

            socket.emit("sync_messages", lastEntry);
        } catch (err) {
            logger.error({
                event: "SYNC_MESSAGE_FAILED",
                userId,
                roomId,
                error: err.message
            });
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

            logger.info({
                event: "SEND_MESSAGE",
                userId,
                roomId,
                message
            });

            const messageId = savedMessage._id;

            socket.to(socketId).emit("receive_message", savedMessage);

            io.to(socketId).emit("message_delivered", {
                messageId
            })

        } catch (err) {
            logger.error({
                event: "SEND_MESSAGE_FAILED",
                userId,
                roomId,
                error: err.message
            });
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
            logger.error({
                event: "READ_MESSAGE_FAILED",
                userId,
                roomId,
                error: err.message
            });
        }

        socket.to(socketId).emit("message_read", { messageId, userId });
    })

    socket.on("message_delivered", async (data) => {
        const { messageId, roomId } = data;

        try {
            await MessageModel.findByIdAndUpdate(
                messageId,
                { $addToSet: { deliveredTo: userId } }
            )

        } catch (err) {
            logger.error({
                event: "DELIVERY_MESSAGE_FAILED",
                userId,
                roomId,
                error: err.message
            });
        }
    })
}