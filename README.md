# Mingu

Mingu is a real-time chat application backend built with Node.js, Express, and Socket.IO. It provides a robust foundation for building feature-rich chat services, including user authentication, room management, real-time messaging, and presence indicators.

## Features

-   **User Authentication**: Secure user signup and sign-in using JWT (JSON Web Tokens) and bcrypt for password hashing.
-   **Chat Rooms**: Create one-on-one or group chat rooms.
-   **Real-time Messaging**: Instant message delivery using WebSockets.
-   **Message Status**: Supports message delivery and read receipts.
-   **Presence System**: Track and broadcast user online/offline status in real-time.
-   **Typing Indicators**: Shows when a user is typing in a chat room.
-   **Message History**: Paginated fetching of older messages within a room.
-   **Rate Limiting**: Protects against brute-force and spam attacks on both API endpoints and WebSocket events.
-   **Structured Logging**: Utilizes Winston for structured logging of application events and errors.
-   **Input Validation**: Uses Zod for robust validation of API request bodies and payloads.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Real-time Communication**: Socket.IO
-   **Authentication**: JSON Web Tokens (JWT), bcrypt
-   **Validation**: Zod
-   **Middleware**: `cookie-parser`, `express-rate-limit`
-   **Logging**: Winston

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vaibhuujoshi/mingu.git
    cd mingu
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your configuration values:
    ```env
    JWT_SECRET="your_super_secret_jwt_key"
    MONGODB_CON="your_mongodb_connection_string"
    ```

4.  **Run the server:**
    -   For development with auto-reloading:
        ```bash
        npm run dev
        ```
    -   For production:
        ```bash
        npm start
        ```
    The server will start on `http://localhost:3000`.

## API Endpoints

All API endpoints are prefixed with `/api`.

### User Authentication

-   `POST /user/signup`
    -   Registers a new user.
    -   **Body**: `{ "email", "password", "firstName", "lastName" }`

-   `POST /user/signin`
    -   Logs in a user and sets an HTTP-only `token` cookie.
    -   **Body**: `{ "email", "password" }`

-   `GET /user/me`
    -   Retrieves the profile of the currently authenticated user.
    -   Requires authentication.

### Chat Rooms & Messages

-   `POST /chat/room`
    -   Creates a new chat room.
    -   **Body**: `{ "roomName" (optional), "participants": ["userId1", "userId2"] }`
    -   Requires authentication.

-   `GET /chat/rooms`
    -   Retrieves all chat rooms for the authenticated user, including last message and unread count.
    -   Requires authentication.

-   `GET /chat/room/:roomId`
    -   Fetches messages for a specific room with pagination.
    -   **Query Params**: `limit` (default 20), `cursor` (message ID to fetch messages before it).
    -   Requires authentication.

-   `POST /chat/room/:roomId`
    -   Sends a message to a room via HTTP.
    -   **Body**: `{ "message": "Your message content" }`
    -   Requires authentication.

## WebSocket Events

The WebSocket connection requires a JWT token to be passed in the `auth` payload during the initial handshake.

**Example Client Connection:**

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your_jwt_token_here",
  },
});
```

### Emitted by Server

-   `ready`: Sent to the client upon successful connection and authentication.
-   `receive_message`: Delivers a new message to clients in a room.
-   `message_delivered`: Confirms a message has been delivered to a participant.
-   `message_read`: Notifies clients that a user has read a message.
-   `online_users`: Sends a list of all currently online user IDs to a newly connected client.
-   `user_online`: Broadcasts when a user connects.
-   `user_offline`: Broadcasts when a user disconnects.
-   `typing`: Notifies clients that a user is typing in a room.
-   `stop_typing`: Notifies clients that a user has stopped typing.
-   `error_message`: Sends an error message to the client.

### Emitted by Client

-   `send_message`: Sends a message to a room.
    -   **Payload**: `{ "roomId", "message" }`
-   `read_message`: Marks a specific message as read by the user.
    -   **Payload**: `{ "roomId", "messageId" }`
-   `typing`: Informs the server that the user is typing.
    -   **Payload**: `{ "roomId" }`
-   `stop_typing`: Informs the server that the user has stopped typing.
    -   **Payload**: `{ "roomId" }`

## Project Structure

```
.
├── controllers/      # Route handlers, manage request/response logic.
├── middlewares/      # Express middlewares (auth, error handling, rate limiting).
├── models/           # Mongoose schemas and models for the database.
├── routes/           # API route definitions.
├── services/         # Business logic and database interactions.
├── sockets/          # Handlers for specific WebSocket events.
├── utils/            # Utility functions (token generation, logger).
├── validators/       # Zod schemas for data validation.
├── .env.example      # Example environment variables.
├── package.json
└── server.js         # Main application entry point and server setup.