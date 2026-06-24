import { NextRequest, NextResponse } from "next/server";
import { runAITriage, fallbackTriage } from "@/lib/triage";

export async function POST(req: NextRequest) {
  const { symptoms, customSymptoms, duration, diseases, otherDisease } = await req.json();

  if ((!symptoms || symptoms.length === 0) && (!customSymptoms || customSymptoms.trim().length === 0)) {
    return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
  }

  let result;
  try {
    const context = { duration, diseases, otherDisease };
    result = await runAITriage(symptoms, customSymptoms, context);
  } catch (err) {
    console.warn("AI triage — using fallback:", (err as Error).message);

    const idMap: Record<string, string> = {
      "Fever": "fever",
      "Chest Pain": "chest",
      "Breathlessness": "breath",
      "Cough": "cough",
      "Cold / Runny Nose": "cold",
      "Headache": "headache",
      "Vomiting": "vomit",
      "Diarrhea": "diarrhea",
      "Skin Rash": "rash",
      "Joint Pain": "pain",
      "Weakness": "weakness",
      "Stomach Pain": "stomach",
      "Eye Problem": "eyes",
      "Back Pain": "back",
      "Dizziness": "dizzy",
      "Swelling": "swelling",
      "Chills / Shivering": "chills",
      "Body Ache": "body_ache",
      "Excessive Sweating": "sweat",
      "Burning Urination": "urine_burn",
      "Nausea": "nausea",
      "Unconsciousness": "unconscious",
      "Seizures": "seizure",
      "Unusual Bleeding": "bleed",
    };

    const selectedIds: string[] = [];
    for (const s of symptoms) {
      for (const [name, id] of Object.entries(idMap)) {
        if (s.includes(name)) {
          selectedIds.push(id);
          break;
        }
      }
    }

    result = fallbackTriage(selectedIds);
  }

  // Save consultation to DB — fire and forget.
  // Do NOT await this: we return the triage result immediately so the
  // client isn't blocked by MongoDB retries / timeouts / IP whitelist failures.
  (async () => {
    try {
      const dbConnect = (await import("@/lib/mongodb")).default;
      await dbConnect();
      const Consultation = (await import("@/models/Consultation")).default;
      await Consultation.create({
        patientPhone: "unknown",
        patientName: "Unknown",
        symptoms: [...symptoms, customSymptoms].filter(Boolean),
        urgency: result.urgency,
        triageResult: result,
        status: "pending",
      });
    } catch (err) {
      console.warn("Failed to save consultation (non-critical):", (err as Error).message);
    }
  })();

  return NextResponse.json(result);
}