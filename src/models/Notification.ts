import mongoose, { Schema, Document, model, models } from "mongoose";

export interface INotification extends Document {
  senderEmail: string;
  receiverEmail: string;
  senderName: string;
  senderImage?: string;
  type: "superlike" | "match";
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  senderEmail: { type: String, required: true, index: true },
  receiverEmail: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  senderImage: { type: String, default: "/couple.png" },
  type: { type: String, enum: ["superlike", "match"], default: "superlike" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);
