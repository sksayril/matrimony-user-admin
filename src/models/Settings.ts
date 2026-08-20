import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISuperLikePackage {
  id: string;
  name: string;
  price: number; // in USD
  superLikesCount: number;
}

export interface IMessageCreditPackage {
  id: string;
  name: string;
  price: number; // in USD
  creditsCount: number;
}

export interface IMatchingWeights {
  ageWeight: number; // weight percentage (e.g. 20)
  distanceWeight: number; // weight percentage (e.g. 15)
  deenWeight: number; // weight percentage (e.g. 35)
  hobbiesWeight: number; // weight percentage (e.g. 20)
  educationWeight: number; // weight percentage (e.g. 10)
}

export interface IBoostPackage {
  id: string;
  name: string;
  price: number; // in USD
  durationDays: number;
}

export interface ISettings extends Document {
  stripeSecretKey: string;
  stripePublishableKey: string;
  freeMessagesCount: number;
  pricePerMessage: number;
  messagesFree: boolean;
  dailyFreeSwipes: number;
  superLikePackages: ISuperLikePackage[];
  messageCreditPackages: IMessageCreditPackage[];
  boostPackages: IBoostPackage[];
  matchingWeights: IMatchingWeights;
  subscriptionPrice: number;
  subscriptionName: string;
  subscriptionFeatures: string[];
  requireSubscriptionToViewPhotos: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    stripeSecretKey: {
      type: String,
      default: "rk_test_51U6UIgAG1417j3BHW4UYsvSx7OQvJ3h73rIdEvOpRkQb5bF8QgoYHXQac2uCWMI6su12Tk4tMGbpyuxlIfiIL6Hd00pFcui3di"
    },
    stripePublishableKey: {
      type: String,
      default: "pk_test_51U6UIgAG1417j3BHqSCCksuGePXtOcYyogQ8lm4bVueUZSzbll8YNttjCoqakg718BMCy31a6fdhEjxpZxLURtqv00st0A6RUD"
    },
    freeMessagesCount: { type: Number, default: 5 },
    pricePerMessage: { type: Number, default: 0.5 },
    messagesFree: { type: Boolean, default: false },
    dailyFreeSwipes: { type: Number, default: 10 },
    superLikePackages: {
      type: [
        {
          id: String,
          name: String,
          price: Number,
          superLikesCount: Number
        }
      ],
      default: [
        { id: "sl_starter", name: "5 Super Likes", price: 4.99, superLikesCount: 5 },
        { id: "sl_popular", name: "15 Super Likes", price: 11.99, superLikesCount: 15 },
        { id: "sl_pro", name: "40 Super Likes", price: 24.99, superLikesCount: 40 }
      ]
    },
    messageCreditPackages: {
      type: [
        {
          id: String,
          name: String,
          price: Number,
          creditsCount: Number
        }
      ],
      default: [
        { id: "msg_basic", name: "20 Messages", price: 2.99, creditsCount: 20 },
        { id: "msg_standard", name: "60 Messages", price: 6.99, creditsCount: 60 },
        { id: "msg_unlimited", name: "150 Messages", price: 14.99, creditsCount: 150 }
      ]
    },
    boostPackages: {
      type: [
        {
          id: String,
          name: String,
          price: Number,
          durationDays: Number
        }
      ],
      default: [
        { id: "boost_1day", name: "1 Day Spotlight Boost", price: 2.99, durationDays: 1 },
        { id: "boost_7days", name: "7 Days Super Boost", price: 7.99, durationDays: 7 },
        { id: "boost_30days", name: "1 Month VIP Mega Boost", price: 19.99, durationDays: 30 }
      ]
    },
    matchingWeights: {
      type: {
        ageWeight: { type: Number, default: 20 },
        distanceWeight: { type: Number, default: 15 },
        deenWeight: { type: Number, default: 35 },
        hobbiesWeight: { type: Number, default: 20 },
        educationWeight: { type: Number, default: 10 }
      },
      default: {
        ageWeight: 20,
        distanceWeight: 15,
        deenWeight: 35,
        hobbiesWeight: 20,
        educationWeight: 10
      }
    },
    subscriptionPrice: { type: Number, default: 19.99 },
    subscriptionName: { type: String, default: "Matrimony VIP Premium" },
    subscriptionFeatures: {
      type: [String],
      default: [
        "Unblur crystal-clear profile photos of all potential matches",
        "Unlimited direct messages with matches",
        "Unlimited Super Likes & Matrimony Algorithm priority ranking",
        "View who liked your profile & VIP badge"
      ]
    },
    requireSubscriptionToViewPhotos: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Settings = models.Settings || model<ISettings>("Settings", SettingsSchema);
