export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Consultation from "@/models/Consultation";

// GET /api/consultations/slots?doctorId=D1
// Returns booked slots for a given doctor (today only, non-completed)
export async function GET(req: NextRequest) {
  const doctorId = req.nextUrl.searchParams.get("doctorId");
  if (!doctorId) return NextResponse.json({ bookedSlots: [] });
  try {
    await dbConnect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const consultations = await Consultation.find({
      doctorId,
      status: { $in: ["pending", "in-review"] },
      createdAt: { $gte: today, $lt: tomorrow },
    }).select("slot -_id");

    const bookedSlots = consultations.map((c) => c.slot).filter(Boolean);
    return NextResponse.json({ bookedSlots });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}