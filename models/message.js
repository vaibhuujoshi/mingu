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

MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ roomId: 1, readBy: 1 });
MessageSchema.index({ senderId: 1 });

const MessageModel = mongoose.model("messages", MessageSchema);

export default MessageModel;