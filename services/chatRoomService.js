import ChatRoomModel from "../models/chatRoom.js";
import MessageModel from "../models/message.js";

async function createRoom(creatorId, data) {
    const { roomName, participants } = data;

    const chatRoom = await ChatRoomModel.create({
        roomName,
        creatorId,
        participants
    })

    return chatRoom;
}

async function sendMessage(senderId, roomId, message) {

    if (!roomId) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!senderId) {
        throw new Error("USER_NOT_FOUND");
    }

    const content = await MessageModel.create({
        senderId,
        roomId,
        message
    })

    return content;
}

async function getMessages(roomId) {
    if (!roomId) {
        throw new Error("ROOM_NOT_FOUND");
    }

    const content = await MessageModel.find({
        roomId
    })

    return content;
}

export { createRoom, sendMessage, getMessages };