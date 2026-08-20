import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { email, password, name, age, targetGender, hobbies, deenAttributes, city, country, images, latitude, longitude, gender, livingLocation, workLocation, education, profession, bio } = data;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify user profile exists
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    // Check if user is already registered completely
    if (user.isRegistered) {
      return NextResponse.json({ error: "User already registered" }, { status: 400 });
    }

    // Update details
    if (password) user.password = password;
    user.name = name;
    user.age = Number(age) || undefined;
    user.targetGender = targetGender;
    user.hobbies = hobbies;
    user.deenAttributes = deenAttributes;
    user.city = city;
    user.country = country;
    user.images = images;
    user.latitude = latitude !== undefined ? Number(latitude) : undefined;
    user.longitude = longitude !== undefined ? Number(longitude) : undefined;
    user.gender = gender;
    user.livingLocation = livingLocation;
    user.workLocation = workLocation;
    user.education = education;
    user.profession = profession;
    user.bio = bio;
    user.isRegistered = true;

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully",
      token,
      user,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
