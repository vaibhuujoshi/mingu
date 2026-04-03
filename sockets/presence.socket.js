import logger from "../utils/logger.js";
const onlineUsers = new Map();

export default function presenceConnection(io, socket) {
    const userId = socket.user.id;

    onlineUsers.set(userId, socket.id);

    socket.emit("online_users", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("user_online", userId);

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user_offline", userId);
        logger.info({
            event: "USER_DISCONNECTED",
            userId,
            time: new Date().toISOString()
        });
    });
}