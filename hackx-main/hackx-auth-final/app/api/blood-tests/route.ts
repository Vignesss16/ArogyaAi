export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { BloodTest } from "@/models/index";

// Critical value thresholds
const CRITICAL_VALUES: Record<string, { low: number; high: number }> = {
  "Hemoglobin (Hb%)": { low: 7, high: 18 },
  "Blood Sugar (Fasting)": { low: 50, high: 200 },
  "Blood Sugar (Random)": { low: 50, high: 300 },
  "Heart Rate": { low: 40, high: 150 },
  "Temperature": { low: 35, high: 40 },
  "SpO2": { low: 90, high: 100 },
};

function checkCritical(testType: string, numericValue: number): boolean {
  const range = CRITICAL_VALUES[testType];
  if (!range) return false;
  return numericValue < range.low || numericValue > range.high;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const patientPhone = req.nextUrl.searchParams.get("patientPhone");
    const submittedBy = req.nextUrl.searchParams.get("submittedBy");
    const isCritical = req.nextUrl.searchParams.get("isCritical");
    const doctorId = req.nextUrl.searchParams.get("doctorId");

    let query: any = {};
    if (patientPhone) {
      if (/^\d+$/.test(patientPhone) || patientPhone.startsWith("unknown-")) {
        query.patientPhone = patientPhone;
      } else {
        query.patientName = { $regex: new RegExp(patientPhone, "i") };
      }
    } else if (doctorId) {
      const Consultation = (await import("@/models/Consultation")).default;
      const consultations = await Consultation.find({ doctorId });
      const patientPhones = consultations.map(c => c.patientPhone);
      query.$or = [
        { assignedDoctorId: doctorId },
        { patientPhone: { $in: patientPhones } }
      ];
    }
    if (submittedBy) query.submittedBy = submittedBy;
    if (isCritical === "true") query.isCritical = true;

    const tests = await BloodTest.find(query).sort({ testDate: -1 });
    return NextResponse.json({ tests });
  } catch (err: any) {
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { patientPhone, patientName, submittedBy, submittedByName, testType, result, numericValue, unit, notes, imageDataUrl, labName, testDate, assignedDoctorId } = body;

    if (!patientPhone || !testType || !result) {
      return NextResponse.json({ error: "Patient phone, test type, and result are required" }, { status: 400 });
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
          village: "Auto-registered via Blood Test",
        });
      }
    }

    // Auto-detect critical values
    const isCritical = numericValue ? checkCritical(testType, numericValue) : false;

    // Get reference range
    const refRange = CRITICAL_VALUES[testType] ? `${CRITICAL_VALUES[testType].low}-${CRITICAL_VALUES[testType].high}` : "";

    const test = await BloodTest.create({
      patientPhone,
      patientName: patientName || "Unknown",
      submittedBy,
      submittedByName: submittedByName || "Unknown",
      testType,
      result,
      numericValue: numericValue || null,
      unit: unit || "",
      isCritical,
      referenceRange: refRange,
      notes: notes || "",
      imageDataUrl: imageDataUrl || "",
      labName: labName || "",
      testDate: testDate ? new Date(testDate) : new Date(),
      status: "completed",
      assignedDoctorId: assignedDoctorId || "",
    });

    return NextResponse.json({ test, isCritical });
  } catch (err: any) {
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { testId, reviewedBy, reviewedNotes, status } = body;

    if (!testId) {
      return NextResponse.json({ error: "Test ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (reviewedBy) updates.reviewedBy = reviewedBy;
    if (reviewedNotes) updates.reviewedNotes = reviewedNotes;
    if (status) updates.status = status;

    const test = await BloodTest.findByIdAndUpdate(testId, { $set: updates }, { new: true });
    return NextResponse.json({ test });
  } catch (err: any) {
    return NextResponse.json({ error: "DB error: " + err.message }, { status: 500 });
  }
}
