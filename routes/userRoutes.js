import express from "express";
import { userSignupHandler, userSigninHandler, getUserHandler } from "../controllers/userController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/signup', userSignupHandler);
router.post('/signin', userSigninHandler);
router.get('/me', auth, getUserHandler);

export default router;