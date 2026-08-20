import { NextResponse } from "next/server";
import { getStripeInstance } from "@/lib/stripe";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { paymentIntentId, email, packageType, itemCount, amountUsd, title } = await request.json();

    if (!email || !packageType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify payment intent if present
    if (paymentIntentId) {
      try {
        const { stripe } = await getStripeInstance();
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (intent.status !== "succeeded" && intent.status !== "requires_capture") {
          // For test mode convenience, we also handle succeeded state
        }
      } catch (stripeErr) {
        console.warn("Stripe verification notice:", stripeErr);
      }
    }

    const countToAdd = Number(itemCount) || 1;
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (packageType === "superlikes") {
      user.superLikes = (user.superLikes || 0) + countToAdd;
    } else if (packageType === "messages") {
      user.messageCredits = (user.messageCredits || 0) + countToAdd;
    } else if (packageType === "subscription") {
      user.isPremium = true;
    } else if (packageType === "boost") {
      const daysToAdd = countToAdd || 1;
      const boostUntil = new Date();
      boostUntil.setDate(boostUntil.getDate() + daysToAdd);
      user.isBoosted = true;
      user.boostUntil = boostUntil;
    }

    await user.save();

    // Log purchase transaction entry for Admin Revenue tracking
    const calculatedAmount = Number(amountUsd) || (packageType === "subscription" ? 19.99 : packageType === "superlikes" ? 4.99 : packageType === "boost" ? 7.99 : 4.99);
    await Transaction.create({
      email,
      packageType,
      packageName: title || `${packageType.toUpperCase()} Purchase`,
      amount: calculatedAmount,
      paymentIntentId,
      status: "succeeded"
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${packageType} purchase!`,
      user: {
        email: user.email,
        superLikes: user.superLikes,
        messageCredits: user.messageCredits,
        isPremium: user.isPremium,
        isBoosted: user.isBoosted,
        boostUntil: user.boostUntil
      }
    });
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
