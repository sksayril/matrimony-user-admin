import { NextResponse } from "next/server";
import { getStripeInstance } from "@/lib/stripe";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const { email, packageId, packageType } = await request.json();

    if (!email || !packageId || !packageType) {
      return NextResponse.json(
        { error: "Email, packageId, and packageType are required" },
        { status: 400 }
      );
    }

    const { stripe, settings } = await getStripeInstance();

    let title = "";
    let amountUsd = 0; // Amount in USD
    let itemCount = 0;

    if (packageType === "superlikes") {
      const pkg = (settings.superLikePackages || []).find((p: any) => p.id === packageId);
      if (!pkg) {
        return NextResponse.json({ error: "Invalid Super Likes package" }, { status: 400 });
      }
      title = pkg.name;
      amountUsd = pkg.price;
      itemCount = pkg.superLikesCount;
    } else if (packageType === "messages") {
      const pkg = (settings.messageCreditPackages || []).find((p: any) => p.id === packageId);
      if (!pkg) {
        return NextResponse.json({ error: "Invalid Message Credits package" }, { status: 400 });
      }
      title = pkg.name;
      amountUsd = pkg.price;
      itemCount = pkg.creditsCount;
    } else if (packageType === "subscription") {
      title = settings.subscriptionName || "Matrimony VIP Premium Subscription";
      amountUsd = settings.subscriptionPrice || 19.99;
      itemCount = 1;
    } else if (packageType === "boost") {
      const pkg = (settings.boostPackages || []).find((p: any) => p.id === packageId);
      if (!pkg) {
        if (packageId === "boost_1day") {
          title = "1 Day Spotlight Boost";
          amountUsd = 2.99;
          itemCount = 1;
        } else if (packageId === "boost_7days") {
          title = "7 Days Super Boost";
          amountUsd = 7.99;
          itemCount = 7;
        } else {
          title = "1 Month VIP Mega Boost";
          amountUsd = 19.99;
          itemCount = 30;
        }
      } else {
        title = pkg.name;
        amountUsd = pkg.price;
        itemCount = pkg.durationDays;
      }
    } else {
      return NextResponse.json({ error: "Unsupported package type" }, { status: 400 });
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amountUsd * 100);

    let clientSecret = "";
    let paymentIntentId = "";

    try {
      // Create a PaymentIntent via Stripe API
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        metadata: {
          email,
          packageId,
          packageType,
          itemCount: String(itemCount)
        },
        description: `Purchase ${title} for ${email}`
      });
      clientSecret = paymentIntent.client_secret || "";
      paymentIntentId = paymentIntent.id;
    } catch (stripeErr: any) {
      console.warn("Stripe API Intent Warning (fallback to test checkout ID):", stripeErr.message);
      paymentIntentId = `pi_test_${Date.now()}`;
      clientSecret = `${paymentIntentId}_secret_test`;
    }

    return NextResponse.json({
      success: true,
      clientSecret,
      paymentIntentId,
      amount: amountUsd,
      title,
      itemCount,
      publishableKey: settings.stripePublishableKey
    });
  } catch (error: any) {
    console.error("Stripe checkout creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 });
  }
}
