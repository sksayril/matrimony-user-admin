import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  age?: number;
  phone?: string;
  targetGender?: string;
  hobbies?: string[];
  deenAttributes?: string[];
  city?: string;
  country?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  gender?: string;
  livingLocation?: string;
  workLocation?: string;
  education?: string;
  profession?: string;
  bio?: string;
  isRegistered: boolean;
  role: "user" | "admin";
  password?: string;
  superLikes: number;
  messageCredits: number;
  dailySwipesCount: number;
  lastSwipeResetDate?: Date;
  isPremium: boolean;
  isBoosted?: boolean;
  boostUntil?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  age: { type: Number },
  phone: { type: String },
  targetGender: { type: String },
  hobbies: { type: [String], default: [] },
  deenAttributes: { type: [String], default: [] },
  city: { type: String },
  country: { type: String },
  images: { type: [String], default: [] },
  latitude: { type: Number },
  longitude: { type: Number },
  gender: { type: String },
  livingLocation: { type: String },
  workLocation: { type: String },
  education: { type: String },
  profession: { type: String },
  bio: { type: String },
  isRegistered: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  password: { type: String },
  superLikes: { type: Number, default: 5 },
  messageCredits: { type: Number, default: 10 },
  dailySwipesCount: { type: Number, default: 0 },
  lastSwipeResetDate: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  isBoosted: { type: Boolean, default: false },
  boostUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model<IUser>("User", UserSchema);
