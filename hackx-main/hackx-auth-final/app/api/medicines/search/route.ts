export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Pharmacist } from "@/models/index";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const name = req.nextUrl.searchParams.get("name") || "";
    if (!name) return NextResponse.json({ results: [] });

    const pharmacists = await Pharmacist.find({
      "stock.medicineName": { $regex: name, $options: "i" },
    });

    const results = pharmacists.map((p: any) => {
      const med = p.stock.find(
        (s: any) => s.medicineName.toLowerCase().includes(name.toLowerCase())
      );
      return {
        pharmacyId:   p._id,
        pharmacyName: p.storeName,
        village:      p.village,
        phone:        p.phone,
        type:         p.type,
        distanceKm:   p.distanceKm,
        medicineName: med?.medicineName || name,
        qty:          med?.qty || 0,
        price:        med?.price || "Ask at counter",
        inStock:      med?.inStock || false,
      };
    }).sort((a: any, b: any) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("GET /api/medicines/search error:", err);
    return NextResponse.json({ results: [] });
  }
}