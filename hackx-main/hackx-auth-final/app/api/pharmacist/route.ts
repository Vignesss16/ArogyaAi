export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pharmacist } from "@/models/index";
import { hashPassword } from "@/lib/auth";

// Haversine formula to calculate distance between two GPS coordinates
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
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

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const phone = req.nextUrl.searchParams.get("phone");
    const userLat = req.nextUrl.searchParams.get("lat");
    const userLng = req.nextUrl.searchParams.get("lng");
    const medicineName = req.nextUrl.searchParams.get("medicine");

    if (phone) {
      const pharmacist = await Pharmacist.findOne({ phone }).select("-password");
      return NextResponse.json({ pharmacist: pharmacist || null });
    }

    let query: any = {};

    // Filter by medicine stock if provided
    if (medicineName) {
      query.stock = {
        $elemMatch: {
          medicineName: { $regex: medicineName, $options: "i" },
          inStock: true,
        },
      };
    }

    let pharmacies = await Pharmacist.find(query).select("-password");

    // Add distance calculation if user location is provided
    let results = pharmacies.map((p: any) => {
      const obj = p.toObject();
      let distance = parseFloat(p.distanceKm) || 0;

      // Calculate real distance if we have coordinates
      if (userLat && userLng && p.lat && p.lng) {
        distance = haversineDistance(
          parseFloat(userLat),
          parseFloat(userLng),
          p.lat,
          p.lng
        );
      }

      // Filter stock to only show matching medicines if search term provided
      if (medicineName) {
        obj.stock = obj.stock?.filter((s: any) =>
          s.medicineName.toLowerCase().includes(medicineName.toLowerCase())
        );
      }

      return {
        ...obj,
        distanceKm: distance.toFixed(1),
        distanceValue: distance,
      };
    });

    // Sort by distance (nearest first)
    results.sort((a: any, b: any) => (a.distanceValue || 0) - (b.distanceValue || 0));

    return NextResponse.json({ pharmacies: results });
  } catch (err: any) {
    console.error("GET /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, password, ...rest } = body;
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const existing = await Pharmacist.findOne({ phone });
    if (existing) return NextResponse.json({ error: "Phone already registered" }, { status: 400 });

    const hashedPassword = await hashPassword(password);
    const pharmacist = await Pharmacist.create({ phone, password: hashedPassword, ...rest, stock: [] });

    // Return without password hash
    const { password: _pw, ...safeData } = pharmacist.toObject();
    return NextResponse.json({ pharmacist: safeData });
  } catch (err: any) {
    console.error("POST /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, password, ...updates } = body; // never allow password update via this route
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    const pharmacist = await Pharmacist.findOneAndUpdate(
      { phone },
      { $set: updates },
      { new: true }
    ).select("-password");
    return NextResponse.json({ pharmacist });
  } catch (err: any) {
    console.error("PATCH /api/pharmacist error:", err.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
