import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";

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

    // Check if the user already has a partial profile
    const existingUser = await User.findOne({ email });
    const isNewUser = !existingUser;

    if (isNewUser) {
      // Create partial user record to secure the email
      const newUser = new User({ email, isRegistered: false });
      await newUser.save();
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      isNewUser,
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
