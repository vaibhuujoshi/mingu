import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
    logger.error({
        event: "API_ERROR",
        path: req.path,
        method: req.method,
        error: err.message
    });

    res.status(500).json({
        message: "Internal Server Error"
    })
}