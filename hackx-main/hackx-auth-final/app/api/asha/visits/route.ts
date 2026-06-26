export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ASHAVisit } from "@/models/index";
import Patient from "@/models/Patient";

export async function GET(req: NextRequest) {
  const ashaPhone = req.nextUrl.searchParams.get("ashaPhone");
  const patientPhone = req.nextUrl.searchParams.get("patientPhone");

  try {
    await dbConnect();
    let query: any = {};
    if (ashaPhone) query.ashaWorkerPhone = ashaPhone;
    if (patientPhone) {
      if (/^\d+$/.test(patientPhone) || patientPhone.startsWith("unknown-")) {
        query.patientPhone = patientPhone;
      } else {
        query.patientName = { $regex: new RegExp(patientPhone, "i") };
      }
    }
    const visits = await ASHAVisit.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ visits });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await dbConnect();
    
    // Auto-create patient if they don't exist in the system
    if (body.patientName) {
      const patientQuery = body.patientPhone && body.patientPhone !== "unknown"
        ? { phone: body.patientPhone }
        : { name: body.patientName };
        
      const existingPatient = await Patient.findOne(patientQuery);
      
      if (!existingPatient) {
        await Patient.create({
          name: body.patientName,
          phone: body.patientPhone && body.patientPhone !== "unknown" ? body.patientPhone : `unknown-${Date.now()}`,
          age: 0,
          gender: "other",
          village: "Auto-registered via ASHA Visit",
          password: "auto-generated-no-login-yet",
        });
      }
    }

    const visit = await ASHAVisit.create(body);
    return NextResponse.json({ visit }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
