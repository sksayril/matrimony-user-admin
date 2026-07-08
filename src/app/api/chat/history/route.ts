import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room");
    const email = searchParams.get("email");

    if (!room || !email) {
      return NextResponse.json({ error: "Room and email are required" }, { status: 400 });
    }

    const messages = await Message.find({ room }).sort({ createdAt: 1 });

    const formatted = messages.map((m: any) => {
      const isMe = m.sender === email;
      const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return {
        sender: isMe ? "me" : "them",
        text: m.text,
        type: m.fileType === "audio" ? "voice" : m.fileType,
        imageSrc: m.fileType === "image" ? m.fileUrl : undefined,
        videoSrc: m.fileType === "video" ? m.fileUrl : undefined,
        fileUrl: m.fileUrl,
        voiceDuration: m.fileType === "audio" ? "Play" : undefined,
        time: timeStr
      };
    });

    return NextResponse.json({ success: true, messages: formatted });
  } catch (err: any) {
    console.error("Chat history error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
