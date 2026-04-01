const onlineUsers = new Map();

export default function presenceConnection(io, socket) {
    const userId = socket.user.id;

    onlineUsers.set(userId, socket.id);

    socket.emit("online_users", Array.from(onlineUsers.keys()));
    socket.broadcast.emit("user_online", userId);

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user_offline", userId);
        console.log("User disconnected:", socket.user?.id);
    });
}