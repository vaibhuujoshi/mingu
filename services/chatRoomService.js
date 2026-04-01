import ChatRoomModel from "../models/chatRoom.js";
import MessageModel from "../models/message.js";

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

async function getMessages(senderId, roomId, cursor, limit) {
    const roomExist = await ChatRoomModel.findById(roomId);

    if (!roomExist) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!roomExist.participants.some(
        (id) => id.toString() === senderId.toString()
    )) {
        throw new Error("NOT_A_PARTICIPANT");
    }

    const query = { roomId };

    if (cursor) {
        query._id = { $lt: cursor };
    }

    const messages = await MessageModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

    const nextCursor = messages.length > 0
        ? messages[messages.length - 1].id : null;

    return {
        messages: messages.reverse(),
        nextCursor
    };
}

async function getUnreadCount(userId, roomId) {
    const roomExist = await ChatRoomModel.findById(roomId);

    if (!roomExist) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!roomExist.participants.some(
        (id) => id.toString() === userId.toString()
    )) {
        throw new Error("NOT_A_PARTICIPANT");
    }

    const count = await MessageModel.countDocuments({
        roomId,
        senderId: { $ne: userId },
        readBy: { $ne: userId }
    })

    return count;

}

async function lastMessage(userId, roomId) {
    const roomExist = await ChatRoomModel.findById(roomId);

    if (!roomExist) {
        throw new Error("ROOM_NOT_FOUND");
    }

    if (!roomExist.participants.some(
        (id) => id.toString() === userId.toString()
    )) {
        throw new Error("NOT_A_PARTICIPANT");
    }

    const content = await MessageModel.findOne({
        roomId
    }).sort({ createdAt: -1 })

    return content;
}

async function getRooms(userId) {
    const rooms = await ChatRoomModel.find({
        participants: userId
    }).lean();

    const roomIds = rooms.map(r => r._id);

    const lastMessages = await MessageModel.aggregate([
        { $match: { roomId: { $in: roomIds } } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$roomId",
                lastMessage: { $first: "$$ROOT" }
            }
        }
    ]);

    const unreadCounts = await MessageModel.aggregate([
        {
            $match: {
                roomId: { $in: roomIds },
                readBy: { $ne: userId },
                senderId: { $ne: userId }
            }
        },
        {
            $group: {
                _id: "$roomId",
                count: { $sum: 1 }
            }
        }
    ]);

    const lastMsgMap = new Map(
        lastMessages.map(m => [m._id.toString(), m.lastMessage])
    );

    const unreadMap = new Map(
        unreadCounts.map(u => [u._id.toString(), u.count])
    );

    return rooms.map(room => {
        const roomId = room._id.toString();
        const lastMsg = lastMsgMap.get(roomId);

        return {
            roomId,
            roomName: room?.roomName || null,
            lastMessage: lastMsg?.message || null,
            lastMessageTime: lastMsg?.createdAt || null,
            unreadCount: unreadMap.get(roomId) || null
        }
    })

}

export { createRoom, sendMessage, getMessages, getRooms, lastMessage, getUnreadCount };