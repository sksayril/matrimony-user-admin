import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import Match from "@/models/Match";
import { Settings } from "@/models/Settings";
import { calculateMatrimonyMatchScore, getDistanceKm } from "@/lib/matching";

import Message from "@/models/Message";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "";

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (email && searchParams.get("self") === "true") {
      const currentUser = await User.findOne({ email });
      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Count sent messages by user to calculate remaining free messages + purchased credits
      const sentMessagesCount = await Message.countDocuments({ sender: email });
      const freeLimit = settings.freeMessagesCount !== undefined ? settings.freeMessagesCount : 5;
      const purchasedCredits = currentUser.messageCredits || 0;
      const totalAvailable = Math.max(0, freeLimit + purchasedCredits - sentMessagesCount);

      const userObj = currentUser.toObject();
      userObj.sentMessagesCount = sentMessagesCount;
      userObj.remainingMessageCredits = totalAvailable;

      return NextResponse.json({ success: true, user: userObj, settings });
    }

    let query: any = { isRegistered: true };

    if (email) {
      const currentUser = await User.findOne({ email });
      if (currentUser) {
        // Reset daily swipes counter if last reset was previous day
        const now = new Date();
        const lastReset = currentUser.lastSwipeResetDate ? new Date(currentUser.lastSwipeResetDate) : new Date(0);
        if (now.toDateString() !== lastReset.toDateString()) {
          currentUser.dailySwipesCount = 0;
          currentUser.lastSwipeResetDate = now;
          await currentUser.save();
        }

        // Exclude self and already matched users from discover candidates
        const existingMatches = await Match.find({
          $or: [{ user1: email }, { user2: email }]
        });
        const matchedEmails = existingMatches.map((m) => (m.user1 === email ? m.user2 : m.user1));
        query.email = { $ne: email, $nin: matchedEmails };

        // Bidirectional gender matchmaking checks
        if (currentUser.targetGender) {
          query.$or = [
            { gender: { $regex: new RegExp("^" + currentUser.targetGender + "$", "i") } },
            {
              gender: { $exists: false },
              targetGender: {
                $regex: new RegExp(
                  "^" + (currentUser.targetGender.toLowerCase() === "male" ? "female" : "male") + "$",
                  "i"
                )
              }
            }
          ];
        }

        const currentUserOwnGender =
          currentUser.gender ||
          (currentUser.targetGender &&
            (currentUser.targetGender.toLowerCase() === "male" ? "Female" : "Male")) ||
          "Male";
        query.targetGender = { $regex: new RegExp("^" + currentUserOwnGender + "$", "i") };

        // Fetch candidates
        let candidates = await User.find(query);

        // Apply strict matrimony matching algorithm using Admin configured weights
        const processedCandidates = candidates
          .map((candidate: any) => {
            const { score, breakdown } = calculateMatrimonyMatchScore(
              currentUser,
              candidate,
              settings?.matchingWeights
            );

            let distance = Infinity;
            if (
              currentUser.latitude !== undefined &&
              currentUser.longitude !== undefined &&
              candidate.latitude !== undefined &&
              candidate.longitude !== undefined
            ) {
              distance = getDistanceKm(
                Number(currentUser.latitude),
                Number(currentUser.longitude),
                Number(candidate.latitude),
                Number(candidate.longitude)
              );
            }

            candidate._doc = {
              ...candidate._doc,
              matchPercent: score,
              matchBreakdown: breakdown,
              distance: Math.round(distance)
            };
            candidate.matchPercent = score;
            candidate.matchBreakdown = breakdown;
            candidate.distance = Math.round(distance);
            return candidate;
          })
          .filter((c: any) => c.matchPercent >= 40); // threshold for recommended discover feed

        // Sort candidates: Boosted profiles FIRST, then by highest Matrimony Match score
        processedCandidates.sort((a: any, b: any) => {
          const aIsBoosted = Boolean(a.isBoosted && a.boostUntil && new Date(a.boostUntil) > new Date());
          const bIsBoosted = Boolean(b.isBoosted && b.boostUntil && new Date(b.boostUntil) > new Date());
          if (aIsBoosted && !bIsBoosted) return -1;
          if (!aIsBoosted && bIsBoosted) return 1;
          return b.matchPercent - a.matchPercent;
        });

        return NextResponse.json({
          success: true,
          users: processedCandidates,
          user: currentUser,
          settings: {
            dailyFreeSwipes: settings.dailyFreeSwipes,
            freeMessagesCount: settings.freeMessagesCount,
            messagesFree: settings.messagesFree,
            pricePerMessage: settings.pricePerMessage
          }
        });
      }
    }

    // Default fallback
    let users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({
      success: true,
      users,
      settings
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, name, age, phone, city, country, profession, education, bio, deenAttributes, hobbies, images, addImages, removeImageIndex, gender, targetGender } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required to update profile" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = Number(age);
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (profession !== undefined) user.profession = profession;
    if (education !== undefined) user.education = education;
    if (bio !== undefined) user.bio = bio;
    if (deenAttributes !== undefined) {
      user.deenAttributes = Array.isArray(deenAttributes)
        ? deenAttributes
        : deenAttributes.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (hobbies !== undefined) {
      user.hobbies = Array.isArray(hobbies)
        ? hobbies
        : hobbies.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    // Replace all images
    if (images !== undefined) {
      user.images = Array.isArray(images) ? images : [images];
    }
    // Append new photos
    if (addImages !== undefined) {
      const newPhotos = Array.isArray(addImages) ? addImages : [addImages];
      user.images = [...(user.images || []), ...newPhotos].filter(Boolean);
    }
    // Remove a photo by index
    if (removeImageIndex !== undefined && user.images) {
      user.images = user.images.filter((_: string, i: number) => i !== Number(removeImageIndex));
    }
    if (gender !== undefined) user.gender = gender;
    if (targetGender !== undefined) user.targetGender = targetGender;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user
    });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user profile" }, { status: 500 });
  }
}
