import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { email, type } = data;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists and is already registered
    const existingUser = await User.findOne({ email });
    if (type === "login") {
      if (!existingUser || !existingUser.isRegistered) {
        return NextResponse.json({ error: "Email is not registered. Please sign up first." }, { status: 400 });
      }
    } else {
      if (existingUser && existingUser.isRegistered) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in database
    await Otp.deleteMany({ email });
    const otpDoc = new Otp({ email, otp: generatedOtp });
    await otpDoc.save();

    // Print to console.log as requested by the user
    console.log(`[AUTH] OTP for ${email} is ${generatedOtp}`);

    // Send email using Nodemailer (falls back to console log if SMTP is not configured)
    await sendOtpEmail(email, generatedOtp);

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
