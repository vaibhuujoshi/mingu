import MessageModel from "../models/message.js";
import { lastMessage } from "../services/chatRoomService.js";
import ChatRoomModel from "../models/chatRoom.js";

export default function messageConnection(io, socket) {
    const userId = socket.user.id;

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
}