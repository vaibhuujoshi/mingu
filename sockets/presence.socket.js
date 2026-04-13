import logger from "../utils/logger.js";
import { pubClient, subClient } from "../config/redis.js";
// const onlineUsers = new Map();

export default async function presenceConnection(io, socket) {
    const userId = socket.user.id;

    // onlineUsers.set(userId, socket.id);
    await pubClient.set(`user:${userId}`, socket.id);

    const keys = await pubClient.keys("user:*");
    const users = keys.map(k => k.split(":")[1]);

    // socket.emit("online_users", Array.from(onlineUsers.keys()));
    socket.emit("online_users", users);
    socket.broadcast.emit("user_online", userId);

    socket.on("disconnect", async () => {
        // onlineUsers.delete(userId);
        await pubClient.del(`user:${userId}`);
        socket.broadcast.emit("user_offline", userId);
        logger.info({
            event: "USER_DISCONNECTED",
            userId,
            time: new Date().toISOString()
        });
    });
}