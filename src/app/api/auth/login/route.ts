import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Find OTP document
    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Delete OTP document since it's verified
    await Otp.deleteMany({ email });

    // Verify user profile exists and is registered completely
    const user = await User.findOne({ email });
    if (!user || !user.isRegistered) {
      return NextResponse.json({ error: "Profile is not completely registered. Please sign up." }, { status: 400 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      token,
      user
    });
  } catch (error: any) {
    console.error("Login verification error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
