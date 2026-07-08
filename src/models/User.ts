import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  age?: number;
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
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  age: { type: Number },
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
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model<IUser>("User", UserSchema);
