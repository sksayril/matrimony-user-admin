import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ITransaction extends Document {
  email: string;
  packageType: "subscription" | "superlikes" | "messages" | "boost";
  packageName: string;
  amount: number;
  paymentIntentId?: string;
  status: "succeeded" | "failed";
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  email: { type: String, required: true, index: true },
  packageType: { type: String, enum: ["subscription", "superlikes", "messages", "boost"], required: true },
  packageName: { type: String, default: "Package Purchase" },
  amount: { type: Number, required: true },
  paymentIntentId: { type: String },
  status: { type: String, enum: ["succeeded", "failed"], default: "succeeded" },
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
