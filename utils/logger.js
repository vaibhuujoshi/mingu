import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/error.log"),
            level: "error"
        }),
        new winston.transports.File({
            filename: path.join(__dirname,"../logs/combined.log")
        })
    ]
});

export default logger;