import ChatRoomModel from "../models/chatRoom.js";
import MessageModel from "../models/message.js";
import UserModel from "../models/user.js";

async function createRoom(creatorId, data) {

    const { roomName, participants } = data;
    let finalParticipants = [...new Set([creatorId, ...participants])];

    if (participants.length < 2) {
        throw new Error("MIN_2_PARTICIPANTS_REQUIRED")
    }

    const chatRoom = await ChatRoomModel.create({
        roomName,
        creatorId,
        participants: finalParticipants
    })

    return chatRoom;
}

async function sendMessage(senderId, roomId, message) {
    const roomExist = await ChatRoomModel.findById(roomId);

    if (!roomExist) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!roomExist.participants.some(
        (id) => id.toString() === senderId.toString()
    )) {
        throw new Error("NOT_A_PARTICIPANT");
    }

    const content = await MessageModel.create({
        senderId,
        roomId,
        message
    })

    return content;
}

async function getMessages(senderId, roomId) {
    const roomExist = await ChatRoomModel.findById(roomId);

    if (!roomExist) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!roomExist.participants.some(
        (id) => id.toString() === senderId.toString()
    )) {
        throw new Error("NOT_A_PARTICIPANT");
    }

    const content = await MessageModel.find({
        roomId
    }).sort({ createdAt: 1 })

    return content;
}

export { createRoom, sendMessage, getMessages };