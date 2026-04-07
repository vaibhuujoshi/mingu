import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const pubClient = createClient({
    url: process.env.REDIS_URL
})

const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

export { pubClient, subClient };