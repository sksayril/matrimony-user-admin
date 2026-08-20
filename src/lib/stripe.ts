import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";

export async function getActiveSettings() {
  await connectToDatabase();
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  } else if (settings.stripeSecretKey && settings.stripeSecretKey.startsWith("sk_test_51U6UIgAG1417j3BHHBGz")) {
    // Migrate from broken test key to working test key provided by user
    settings.stripeSecretKey = "rk_test_51U6UIgAG1417j3BHW4UYsvSx7OQvJ3h73rIdEvOpRkQb5bF8QgoYHXQac2uCWMI6su12Tk4tMGbpyuxlIfiIL6Hd00pFcui3di";
    await settings.save();
  }
  return settings;
}

export async function getStripeInstance(): Promise<{ stripe: Stripe; settings: any }> {
  const settings = await getActiveSettings();
  const secretKey =
    settings.stripeSecretKey ||
    process.env.STRIPE_SECRET_KEY ||
    "rk_test_51U6UIgAG1417j3BHW4UYsvSx7OQvJ3h73rIdEvOpRkQb5bF8QgoYHXQac2uCWMI6su12Tk4tMGbpyuxlIfiIL6Hd00pFcui3di";

  const stripe = new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia" as any
  });

  return { stripe, settings };
}
