import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
    }

    const notifications = await Notification.find({ receiverEmail: email })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      receiverEmail: email,
      read: false
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { senderEmail, receiverEmail, senderName, senderImage, type, message } = await request.json();

    if (!senderEmail || !receiverEmail) {
      return NextResponse.json({ error: "Sender and receiver email required" }, { status: 400 });
    }

    const notification = await Notification.create({
      senderEmail,
      receiverEmail,
      senderName: senderName || "Someone",
      senderImage: senderImage || "/couple.png",
      type: type || "superlike",
      message: message || "Sent you a Super Like! ⭐",
      read: false
    });

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error: any) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
    }

    await Notification.updateMany({ receiverEmail: email, read: false }, { read: true });

    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error: any) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
