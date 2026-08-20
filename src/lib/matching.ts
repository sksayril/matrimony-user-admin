import { IUser } from "@/models/User";
import { IMatchingWeights } from "@/models/Settings";

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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
}

export function calculateMatrimonyMatchScore(
  userA: IUser | any,
  userB: IUser | any,
  customWeights?: IMatchingWeights
): { score: number; breakdown: Record<string, number> } {
  // Default weights if not provided
  const weights = customWeights || {
    ageWeight: 20,
    distanceWeight: 15,
    deenWeight: 35,
    hobbiesWeight: 20,
    educationWeight: 10
  };

  const totalWeightSum =
    weights.ageWeight +
    weights.distanceWeight +
    weights.deenWeight +
    weights.hobbiesWeight +
    weights.educationWeight;

  const normalizedWeights = {
    age: weights.ageWeight / totalWeightSum,
    distance: weights.distanceWeight / totalWeightSum,
    deen: weights.deenWeight / totalWeightSum,
    hobbies: weights.hobbiesWeight / totalWeightSum,
    education: weights.educationWeight / totalWeightSum
  };

  // 1. Gender check
  const genderA = (userA.gender || "").toLowerCase();
  const targetGenderA = (userA.targetGender || "").toLowerCase();
  const genderB = (userB.gender || "").toLowerCase();

  if (targetGenderA && genderB && targetGenderA !== genderB) {
    return { score: 0, breakdown: { deen: 0, hobbies: 0, age: 0, distance: 0, education: 0 } };
  }

  // 2. Deen & Spiritual Attributes Overlap (0 - 100)
  const deenA = (userA.deenAttributes || []).map((d: string) => d.toLowerCase().trim());
  const deenB = (userB.deenAttributes || []).map((d: string) => d.toLowerCase().trim());

  let deenScore = 70; // baseline score if empty
  if (deenA.length > 0 && deenB.length > 0) {
    const commonDeen = deenA.filter((d: string) => deenB.includes(d)).length;
    const maxDeen = Math.max(deenA.length, deenB.length);
    deenScore = Math.round((commonDeen / maxDeen) * 100);
    // Give bonus for matching key attributes
    if (commonDeen > 0) deenScore = Math.min(100, deenScore + 15);
  } else if (deenA.length > 0 || deenB.length > 0) {
    deenScore = 50;
  }

  // 3. Hobbies Overlap (0 - 100)
  const hobbiesA = (userA.hobbies || []).map((h: string) => h.toLowerCase().trim());
  const hobbiesB = (userB.hobbies || []).map((h: string) => h.toLowerCase().trim());

  let hobbiesScore = 65;
  if (hobbiesA.length > 0 && hobbiesB.length > 0) {
    const commonHobbies = hobbiesA.filter((h: string) => hobbiesB.includes(h)).length;
    const maxHobbies = Math.max(hobbiesA.length, hobbiesB.length);
    hobbiesScore = Math.round((commonHobbies / maxHobbies) * 100);
    if (commonHobbies > 0) hobbiesScore = Math.min(100, hobbiesScore + 20);
  }

  // 4. Age Compatibility Curve (0 - 100)
  const ageA = userA.age || 25;
  const ageB = userB.age || 24;
  let ageScore = 100;

  if (genderA === "male" && genderB === "female") {
    // Ideal: female is 1 to 5 years younger
    const diff = ageA - ageB; // positive if male older
    if (diff >= 1 && diff <= 5) {
      ageScore = 100;
    } else if (diff === 0) {
      ageScore = 90;
    } else if (diff > 5) {
      ageScore = Math.max(40, 100 - (diff - 5) * 8);
    } else {
      // Female older than male
      ageScore = Math.max(30, 80 - Math.abs(diff) * 12);
    }
  } else if (genderA === "female" && genderB === "male") {
    const diff = ageB - ageA; // positive if male older
    if (diff >= 1 && diff <= 6) {
      ageScore = 100;
    } else if (diff === 0) {
      ageScore = 90;
    } else if (diff > 6) {
      ageScore = Math.max(40, 100 - (diff - 6) * 8);
    } else {
      ageScore = Math.max(30, 80 - Math.abs(diff) * 12);
    }
  } else {
    const ageDiff = Math.abs(ageA - ageB);
    ageScore = Math.max(30, 100 - ageDiff * 7);
  }

  // 5. Distance & Location Proximity (0 - 100)
  let distanceScore = 75;
  if (
    userA.latitude !== undefined &&
    userA.longitude !== undefined &&
    userB.latitude !== undefined &&
    userB.longitude !== undefined
  ) {
    const distKm = getDistanceKm(userA.latitude, userA.longitude, userB.latitude, userB.longitude);
    if (distKm <= 20) distanceScore = 100;
    else if (distKm <= 75) distanceScore = 90;
    else if (distKm <= 200) distanceScore = 75;
    else if (distKm <= 500) distanceScore = 60;
    else distanceScore = 40;
  } else {
    // Check city / country match string
    const cityA = (userA.livingLocation || userA.city || "").toLowerCase();
    const cityB = (userB.livingLocation || userB.city || "").toLowerCase();
    const countryA = (userA.country || "").toLowerCase();
    const countryB = (userB.country || "").toLowerCase();

    if (cityA && cityB && cityA === cityB) distanceScore = 95;
    else if (countryA && countryB && countryA === countryB) distanceScore = 80;
    else distanceScore = 60;
  }

  // 6. Education Compatibility (0 - 100)
  const eduA = (userA.education || "").toLowerCase();
  const eduB = (userB.education || "").toLowerCase();
  let eduScore = 70;
  if (eduA && eduB) {
    if (eduA === eduB) eduScore = 100;
    else if (
      (eduA.includes("master") || eduA.includes("phd") || eduA.includes("doctor")) &&
      (eduB.includes("master") || eduB.includes("phd") || eduB.includes("doctor"))
    ) {
      eduScore = 95;
    } else if (eduA.includes("bachelor") && eduB.includes("bachelor")) {
      eduScore = 90;
    } else {
      eduScore = 80;
    }
  }

  // Weighted score calculation
  const totalScore = Math.round(
    deenScore * normalizedWeights.deen +
      hobbiesScore * normalizedWeights.hobbies +
      ageScore * normalizedWeights.age +
      distanceScore * normalizedWeights.distance +
      eduScore * normalizedWeights.education
  );

  return {
    score: Math.min(99, Math.max(50, totalScore)),
    breakdown: {
      deen: Math.round(deenScore),
      hobbies: Math.round(hobbiesScore),
      age: Math.round(ageScore),
      distance: Math.round(distanceScore),
      education: Math.round(eduScore)
    }
  };
}
