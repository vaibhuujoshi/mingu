export default function typingConnection(socket) {
    const userId = socket.user.id;

    socket.on("typing", async (data) => {
        const { roomId } = data;

        if (!roomId) {
            socket.emit("error_message", "ROOM_NOT_FOUND");
            return;
        }

        socket.to(roomId).emit("typing", {
            userId
        });
    });

    socket.on("stop_typing", async (data) => {
        const { roomId } = data;

        if (!roomId) {
            socket.emit("error_message", "ROOM_NOT_FOUND");
            return;
        }

        socket.to(roomId).emit("stop_typing", {
            userId
        });
    });
}