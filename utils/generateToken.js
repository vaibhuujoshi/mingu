import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export default function generateToken(userId) {
    return jwt.sign({
        id: userId
    }, JWT_SECRET,
        { expiresIn: "1h" }
    )
}