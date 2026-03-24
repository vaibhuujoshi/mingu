import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid userId" }
);

export const createRoomSchema = z.object({
  roomName: z.string().trim().min(1).max(100).optional(),

  participants: z
    .array(objectIdSchema)
    .min(1, "At least 1 participant required")
});

export const messageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
})