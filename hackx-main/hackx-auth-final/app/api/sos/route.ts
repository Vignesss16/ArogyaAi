export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { SOSAlert } from "@/models/index";

export async function GET() {
  try {
    await dbConnect();
    const alerts = await SOSAlert.find({ status: { $in: ["active", "acknowledged"] } }).sort({ createdAt: -1 });
    return NextResponse.json({ alerts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await dbConnect();
    const alert = await SOSAlert.create(body);
    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, doctorNotes } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await dbConnect();
    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (doctorNotes !== undefined) update.doctorNotes = doctorNotes;
    const alert = await SOSAlert.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json({ alert });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
