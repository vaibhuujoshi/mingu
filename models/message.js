import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chatRooms",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]
}, { timestamps: true });

const MessageModel = mongoose.model("messages", MessageSchema);

export default MessageModel;