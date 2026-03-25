import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createRoomHandler, sendMessageHandler, getMessagesHandler, getRoomsHandler } from "../controllers/chatRoomController.js";

const router = express.Router();

router.post('/room', auth, createRoomHandler);
router.post('/room/:roomId', auth, sendMessageHandler);
router.get('/room/:roomId', auth, getMessagesHandler);
router.get('/rooms', auth, getRoomsHandler);

export default router;