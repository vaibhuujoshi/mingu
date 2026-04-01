import messageConnection from "./message.socket.js";
import typingConnection from "./typing.socket.js";
import presenceConnection from "./presence.soclet.js";

export default function registerSocketHandler(io, socket) {
    messageConnection(io, socket);
    typingConnection(socket);
    presenceConnection(io, socket);
}