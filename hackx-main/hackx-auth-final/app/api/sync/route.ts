export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Patient from "@/models/Patient";
import Consultation from "@/models/Consultation";
import { ASHAVisit, SOSAlert } from "@/models/index";

export async function POST(req: NextRequest) {
  const { patients, consultations, ashaVisits, sosAlerts } = await req.json();
  const results = { synced: 0, errors: [] as string[] };

  try {
    await dbConnect();

    if (patients?.length) {
      for (const p of patients) {
        try { await Patient.findOneAndUpdate({ phone: p.phone }, p, { upsert: true }); results.synced++; }
        catch (e) { results.errors.push(String(e)); }
      }
    }
    if (consultations?.length) {
      for (const c of consultations) {
        try { await Consultation.create(c); results.synced++; }
        catch (e) { results.errors.push(String(e)); }
      }
    }
    if (ashaVisits?.length) {
      for (const v of ashaVisits) {
        try { await ASHAVisit.create(v); results.synced++; }
        catch (e) { results.errors.push(String(e)); }
      }
    }
    if (sosAlerts?.length) {
      for (const s of sosAlerts) {
        try { await SOSAlert.create(s); results.synced++; }
        catch (e) { results.errors.push(String(e)); }
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
