import { createRoom, sendMessage, getMessages } from "../services/chatRoomService.js";
import { objectIdSchema, createRoomSchema, messageSchema } from "../validators/chatRoomValidator.js";

async function createRoomHandler(req, res) {
    try {
        const creatorId = req.user.id;

        const parsed = createRoomSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid Format"
            })
        }

        const room = await createRoom(creatorId, parsed.data);

        res.status(201).json({
            message: "Room created successfully",
            roomId: room._id
        })

    } catch (err) {
        if (err.message === "MIN_2_PARTICIPANTS_REQUIRED") {
            return res.status(400).json({
                message: "Minimum two participants are required"
            })
        }

        res.status(500).json({
            message: "There is some error from server side"
        })
    }
}

async function sendMessageHandler(req, res) {
    try {
        const senderId = req.user.id;
        const roomId = req.params.roomId;
        const message = req.body.message;

        const parsed = messageSchema.safeParse(message);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid Format"
            })
        }

        await sendMessage(senderId, roomId, parsed.data);

        res.status(200).json({
            message: "Message sent successfully",
            content: message
        })

    } catch (err) {
        if (err.message === "ROOM_NOT_FOUND") {
            return res.status(404).json({
                message: "Room not found"
            })
        } else if (err.message === "NOT_A_PARTICIPANT") {
            return res.status(403).json({
                message: "You are not authorized"
            })
        }

        res.status(500).json({
            message: "There is some error from server side"
        })
    }
}

async function getMessagesHandler(req, res) {
    try {
        const senderId = req.user.id;
        const roomId = req.params.roomId;

        const content = await getMessages(senderId, roomId);

        res.status(200).json({
            messages: [content]
        });

    } catch (err) {
        if (err.message === "ROOM_NOT_FOUND") {
            return res.status(404).json({
                message: "Room not found"
            })
        } else if (err.message === "NOT_A_PARTICIPANT") {
            return res.status(403).json({
                message: "You are not authorized"
            })
        }

        res.status(500).json({
            message: "There is some error from server side"
        })
    }
}

export { createRoomHandler, sendMessageHandler, getMessagesHandler };