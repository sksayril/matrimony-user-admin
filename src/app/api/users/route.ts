import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import Match from "@/models/Match";

// Haversine formula to compute distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "";

    if (email && searchParams.get("self") === "true") {
      const currentUser = await User.findOne({ email });
      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, user: currentUser });
    }

    let query: any = { isRegistered: true };

    if (email) {
      const currentUser = await User.findOne({ email });
      if (currentUser) {
        // Exclude self and already matched users from discover candidates
        const existingMatches = await Match.find({
          $or: [{ user1: email }, { user2: email }]
        });
        const matchedEmails = existingMatches.map(m => m.user1 === email ? m.user2 : m.user1);
        query.email = { $ne: email, $nin: matchedEmails };

        // Bidirectional gender matchmaking checks with case insensitivity
        if (currentUser.targetGender) {
          query.$or = [
            { gender: { $regex: new RegExp("^" + currentUser.targetGender + "$", "i") } },
            {
              gender: { $exists: false },
              targetGender: { $regex: new RegExp("^" + (currentUser.targetGender.toLowerCase() === "male" ? "female" : "male") + "$", "i") }
            }
          ];
        }

        const currentUserOwnGender = currentUser.gender || (currentUser.targetGender && (currentUser.targetGender.toLowerCase() === "male" ? "Female" : "Male")) || "Male";
        query.targetGender = { $regex: new RegExp("^" + currentUserOwnGender + "$", "i") };

        // Fetch all potential database users matching general gender targets
        let candidates = await User.find(query);

        // Apply strict in-memory age rules and > 60% attributes overlap check
        const currentUserGender = (currentUser.gender || "").toLowerCase();
        const currentUserAge = currentUser.age || 0;

        const filtered = candidates.filter((candidate: any) => {
          const candidateAge = candidate.age || 0;
          const candidateGender = (candidate.gender || "").toLowerCase();

          // 1. Enforce strict opposite gender age comparison:
          // If Male is looking for Female, Female's age must be strictly less than Male's age.
          if (currentUserGender === "male" && candidateGender === "female") {
            if (!currentUserAge || !candidateAge || candidateAge >= currentUserAge) {
              return false;
            }
          }
          // If Female is looking for Male, Male's age must be strictly greater than Female's age.
          if (currentUserGender === "female" && candidateGender === "male") {
            if (!currentUserAge || !candidateAge || candidateAge <= currentUserAge) {
              return false;
            }
          }

          // 2. Enforce 60% attributes matching threshold (hobbies + deenAttributes):
          const userHobbies = (currentUser.hobbies || []).map((h: string) => h.toLowerCase().trim());
          const userDeen = (currentUser.deenAttributes || []).map((d: string) => d.toLowerCase().trim());

          const candidateHobbies = (candidate.hobbies || []).map((h: string) => h.toLowerCase().trim());
          const candidateDeen = (candidate.deenAttributes || []).map((d: string) => d.toLowerCase().trim());

          const hobbiesOverlap = candidateHobbies.filter((h: string) => userHobbies.includes(h)).length;
          const deenOverlap = candidateDeen.filter((d: string) => userDeen.includes(d)).length;

          const totalUserItems = userHobbies.length + userDeen.length;
          const overlapCount = hobbiesOverlap + deenOverlap;

          const matchPercent = totalUserItems > 0 ? (overlapCount / totalUserItems) * 100 : 100;
          if (matchPercent < 60) {
            return false;
          }

          candidate._doc = { ...candidate._doc, matchPercent: Math.round(matchPercent) };
          candidate.matchPercent = Math.round(matchPercent);
          return true;
        });

        // 3. Compute distances and sort by closest location
        const usersWithDistance = filtered.map((candidate: any) => {
          let distance = Infinity;
          if (
            currentUser.latitude !== undefined &&
            currentUser.longitude !== undefined &&
            candidate.latitude !== undefined &&
            candidate.longitude !== undefined
          ) {
            distance = getDistance(
              Number(currentUser.latitude),
              Number(currentUser.longitude),
              Number(candidate.latitude),
              Number(candidate.longitude)
            );
          }
          candidate._doc = { ...candidate._doc, distance };
          candidate.distance = distance;
          return candidate;
        });

        // Sort: closest distance first, tie-breaker with highest matchPercent
        usersWithDistance.sort((a: any, b: any) => {
          if (a.distance !== b.distance) {
            return a.distance - b.distance;
          }
          return (b.matchPercent || 0) - (a.matchPercent || 0);
        });

        return NextResponse.json({
          success: true,
          users: usersWithDistance
        });
      }
    }

    // Default fallback
    let users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
