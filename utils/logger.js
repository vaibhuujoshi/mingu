import winston, { transports } from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({fileName: "logs/error.log", level: "error"}),
        new winston.transports.File({fileName: "logs/combined.log"})
    ]
});

export default logger;