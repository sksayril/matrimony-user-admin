import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  room: string;          // Combined email1_email2 (sorted alphabetically)
  sender: string;        // Sender's email
  text?: string;
  fileUrl?: string;
  fileType: "text" | "image" | "video" | "audio";
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  room: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  text: { type: String },
  fileUrl: { type: String },
  fileType: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
