import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 300 seconds = 5 minutes TTL
});

export const Otp = models.Otp || model<IOtp>("Otp", OtpSchema);
