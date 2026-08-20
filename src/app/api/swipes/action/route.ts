import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import Match from "@/models/Match";
import { Settings } from "@/models/Settings";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, candidateEmail, action } = await request.json(); // action: 'like' | 'superlike' | 'dislike'

    if (!email || !candidateEmail || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Reset daily swipes if date changed
    const now = new Date();
    const lastReset = user.lastSwipeResetDate ? new Date(user.lastSwipeResetDate) : new Date(0);
    if (now.toDateString() !== lastReset.toDateString()) {
      user.dailySwipesCount = 0;
      user.lastSwipeResetDate = now;
    }

    const dailyLimit = settings.dailyFreeSwipes || 10;

    if (action === "superlike") {
      if ((user.superLikes || 0) <= 0) {
        return NextResponse.json(
          {
            error: "OUT_OF_SUPERLIKES",
            message: "You have 0 Super Likes left. Please purchase more."
          },
          { status: 402 }
        );
      }
      user.superLikes -= 1;
    } else {
      // Normal swipe: check daily free swipe limit if not premium
      if (!user.isPremium && user.dailySwipesCount >= dailyLimit) {
        return NextResponse.json(
          {
            error: "DAILY_SWIPE_LIMIT_REACHED",
            message: `You have reached your daily free swipe limit of ${dailyLimit}.`
          },
          { status: 403 }
        );
      }
      user.dailySwipesCount += 1;
    }

    await user.save();

    let isMatch = false;
    let matchObj = null;

    if (action === "like" || action === "superlike") {
      // Create match entry
      const user1 = email < candidateEmail ? email : candidateEmail;
      const user2 = email < candidateEmail ? candidateEmail : email;

      matchObj = await Match.findOneAndUpdate(
        { user1, user2 },
        { user1, user2 },
        { upsert: true, new: true }
      );
      isMatch = true;
    }

    return NextResponse.json({
      success: true,
      isMatch,
      match: matchObj,
      remainingSwipes: Math.max(0, dailyLimit - user.dailySwipesCount),
      superLikes: user.superLikes
    });
  } catch (error: any) {
    console.error("Swipe action error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
