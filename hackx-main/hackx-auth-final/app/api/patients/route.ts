export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const village = req.nextUrl.searchParams.get("village");
  try {
    await dbConnect();
    
    let query: any = {};
    if (phone) {
      // If it contains only digits or starts with 'unknown-', treat as phone
      if (/^\d+$/.test(phone) || phone.startsWith("unknown-")) {
        query.phone = phone;
      } else {
        // Otherwise treat as a case-insensitive name search
        query.name = { $regex: new RegExp(phone, "i") };
      }
    }
    
    if (village) {
      const villagesList = village.split(",").map(v => v.trim()).filter(Boolean);
      if (villagesList.length > 0) {
        query.village = { $in: villagesList.map(v => new RegExp(v, "i")) };
      }
    }

    const patients = phone
      ? await Patient.findOne(query)
      : await Patient.find(query).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(phone ? { patient: patients } : { patients });
  } catch (err) {
    return NextResponse.json({ error: "DB error", details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await dbConnect();
    const existing = await Patient.findOne({ phone: body.phone });
    if (existing) return NextResponse.json({ patient: existing });
    const patient = await Patient.create(body);
    return NextResponse.json({ patient }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "DB error", details: String(err) }, { status: 500 });
  }
}
