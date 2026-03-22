import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema(
  {
    roomName: {
      type: String,
      trim: true
    },

    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
      }
    ]
  },
  { timestamps: true }
);

const ChatRoomModel = mongoose.model("chatRooms", ChatRoomSchema);

export default ChatRoomModel;