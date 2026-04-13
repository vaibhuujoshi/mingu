import { messageConnection } from "./message.socket.js";
import typingConnection from "./typing.socket.js";
import presenceConnection from "./presence.socket.js";

export default function registerSocketHandler(io, socket) {
    messageConnection(io, socket);
    typingConnection(socket);
    presenceConnection(io, socket);
}