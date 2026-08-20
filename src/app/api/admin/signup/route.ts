import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, name, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.role === "admin") {
        return NextResponse.json({ error: "Admin account already exists with this email" }, { status: 400 });
      }
      user.role = "admin";
      user.password = password; // In production, hash with bcrypt/argon2
      user.isRegistered = true;
      await user.save();
    } else {
      user = await User.create({
        email,
        name: name || "Admin",
        password,
        role: "admin",
        isRegistered: true,
        superLikes: 9999,
        messageCredits: 9999
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Admin signup error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
