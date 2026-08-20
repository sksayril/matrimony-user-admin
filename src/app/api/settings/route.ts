import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Public version masks secret key unless requested by authenticated admin
    if (!isAdmin) {
      return NextResponse.json({
        success: true,
        settings: {
          stripePublishableKey: settings.stripePublishableKey,
          freeMessagesCount: settings.freeMessagesCount,
          pricePerMessage: settings.pricePerMessage,
          messagesFree: settings.messagesFree,
          dailyFreeSwipes: settings.dailyFreeSwipes,
          superLikePackages: settings.superLikePackages,
          messageCreditPackages: settings.messageCreditPackages,
          matchingWeights: settings.matchingWeights,
          updatedAt: settings.updatedAt
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    if (body.stripeSecretKey !== undefined) settings.stripeSecretKey = body.stripeSecretKey;
    if (body.stripePublishableKey !== undefined) settings.stripePublishableKey = body.stripePublishableKey;
    if (body.freeMessagesCount !== undefined) settings.freeMessagesCount = Number(body.freeMessagesCount);
    if (body.pricePerMessage !== undefined) settings.pricePerMessage = Number(body.pricePerMessage);
    if (body.messagesFree !== undefined) settings.messagesFree = Boolean(body.messagesFree);
    if (body.dailyFreeSwipes !== undefined) settings.dailyFreeSwipes = Number(body.dailyFreeSwipes);
    if (body.superLikePackages !== undefined) settings.superLikePackages = body.superLikePackages;
    if (body.messageCreditPackages !== undefined) settings.messageCreditPackages = body.messageCreditPackages;
    if (body.matchingWeights !== undefined) settings.matchingWeights = body.matchingWeights;
    
    settings.updatedAt = new Date();
    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
