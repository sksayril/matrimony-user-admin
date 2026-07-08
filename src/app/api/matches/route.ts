import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import Match from "@/models/Match";
import Message from "@/models/Message";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, candidateEmail } = await request.json();

    if (!email || !candidateEmail) {
      return NextResponse.json({ error: "Emails are required" }, { status: 400 });
    }

    const user1 = email < candidateEmail ? email : candidateEmail;
    const user2 = email < candidateEmail ? candidateEmail : email;

    const match = await Match.findOneAndUpdate(
      { user1, user2 },
      { user1, user2 },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    console.error("Match save error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find all matches for the current user
    const matches = await Match.find({
      $or: [{ user1: email }, { user2: email }]
    });

    const threads = [];

    for (const match of matches) {
      const otherUserEmail = match.user1 === email ? match.user2 : match.user1;
      const otherUser = await User.findOne({ email: otherUserEmail });

      if (otherUser) {
        const room = match.user1 < match.user2 ? `${match.user1}_${match.user2}` : `${match.user2}_${match.user1}`;
        
        // Find last message in room
        const lastMessage = await Message.findOne({ room }).sort({ createdAt: -1 });

        threads.push({
          id: otherUser.email,
          name: otherUser.name || otherUser.email,
          avatar: otherUser.images && otherUser.images.length > 0 ? otherUser.images[0] : "/couple.png",
          lastMessage: lastMessage 
            ? (lastMessage.fileType === "text" ? lastMessage.text : `Sent a ${lastMessage.fileType}`) 
            : "You matched! Start the conversation.",
          time: lastMessage ? lastMessage.createdAt.toISOString() : match.createdAt.toISOString(),
          unread: false,
          messages: [],
          // Extra profile fields for frontend Matches grid and Detailed View
          age: otherUser.age,
          city: otherUser.livingLocation || otherUser.city || "Dubai",
          country: otherUser.country || "UAE",
          occupation: otherUser.profession,
          images: otherUser.images || [],
          attributes: otherUser.deenAttributes || [],
          bio: otherUser.bio,
          education: otherUser.education,
          interests: otherUser.hobbies || []
        });
      }
    }

    // Sort chats by most recent message/match time descending
    threads.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ success: true, chats: threads });
  } catch (err: any) {
    console.error("Fetch matches error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
