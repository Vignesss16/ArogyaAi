import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { VitalSigns } from "@/models/index";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const patientPhone = req.nextUrl.searchParams.get("patientPhone");
    const recordedBy = req.nextUrl.searchParams.get("recordedBy");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    let query: any = {};
    if (patientPhone) {
      if (/^\d+$/.test(patientPhone) || patientPhone.startsWith("unknown-")) {
        query.patientPhone = patientPhone;
      } else {
        query.patientName = { $regex: new RegExp(patientPhone, "i") };
      }
    }
    if (recordedBy) query.recordedBy = recordedBy;

    const vitals = await VitalSigns.find(query).sort({ recordedAt: -1 }).limit(limit);
    return NextResponse.json({ vitals });
  } catch (err: any) {
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const {
      patientPhone,
      patientName,
      recordedBy,
      recordedByName,
      bpSystolic,
      bpDiastolic,
      heartRate,
      temperature,
      spo2,
      weight,
      randomBloodSugar,
      respiratoryRate,
      notes,
      visitId,
      recordedAt,
    } = body;

    if (!patientPhone || !recordedBy) {
      return NextResponse.json({ error: "Patient phone and recorder are required" }, { status: 400 });
    }

    // Auto-create patient if they don't exist in the system
    if (patientName) {
      const Patient = (await import("@/models/Patient")).default;
      const patientQuery = patientPhone && patientPhone !== "unknown"
        ? { phone: patientPhone }
        : { name: patientName };
        
      const existingPatient = await Patient.findOne(patientQuery);
      
      if (!existingPatient) {
        await Patient.create({
          name: patientName,
          phone: patientPhone && patientPhone !== "unknown" ? patientPhone : `unknown-${Date.now()}`,
          age: 0,
          gender: "unknown",
          village: "Auto-registered via Vitals",
        });
      }
    }

    const vital = await VitalSigns.create({
      patientPhone,
      patientName: patientName || "Unknown",
      recordedBy,
      recordedByName: recordedByName || "Unknown",
      bpSystolic: bpSystolic || null,
      bpDiastolic: bpDiastolic || null,
      heartRate: heartRate || null,
      temperature: temperature || null,
      spo2: spo2 || null,
      weight: weight || null,
      randomBloodSugar: randomBloodSugar || null,
      respiratoryRate: respiratoryRate || null,
      notes: notes || "",
      visitId: visitId || "",
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });

    return NextResponse.json({ vital });
  } catch (err: any) {
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}
