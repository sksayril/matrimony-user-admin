import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  user1: string; // email of first user
  user2: string; // email of second user
  createdAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  user1: { type: String, required: true, index: true },
  user2: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Enforce unique compound index so we don't have duplicate matches
MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
