import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Consultation from "@/models/Consultation";
import Doctor from "@/models/Doctor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { patientPhone, patientName, symptoms, doctorId, slot } = body;
    
    if (!patientPhone || !patientName || !symptoms) {
        return NextResponse.json({
            message: "I am missing some required details like your name, phone number, or symptoms. Could you please provide them?"
        }, { status: 400, headers: corsHeaders });
    }
    
    // Simple triage logic based on voice symptoms
    let urgency = "GREEN";
    const symptomStr = typeof symptoms === "string" ? symptoms.toLowerCase() : symptoms.join(" ").toLowerCase();
    
    if (symptomStr.includes("chest pain") || symptomStr.includes("breathless") || symptomStr.includes("bleeding") || symptomStr.includes("heart")) {
        urgency = "RED";
    } else if (symptomStr.includes("fever") || symptomStr.includes("pain") || symptomStr.includes("vomiting")) {
        urgency = "YELLOW";
    }
    
    // Assign a default doctor if none provided
    let assignedDoctorId = doctorId;
    let assignedDoctorName = "General Physician";
    
    if (!assignedDoctorId) {
        const defaultDoctor = await Doctor.findOne();
        if (defaultDoctor) {
            assignedDoctorId = defaultDoctor._id.toString();
            assignedDoctorName = defaultDoctor.name;
        }
    } else {
        const doc = await Doctor.findById(assignedDoctorId);
        if (doc) assignedDoctorName = doc.name;
    }
    
    // Generate queue number
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await Consultation.countDocuments({ createdAt: { $gte: startOfDay } });
    const queueNo = `V-${todayCount + 1}`; // V for Voice
    
    // Create Consultation
    const newConsultation = new Consultation({
        patientPhone: patientPhone.toString(),
        patientName: patientName,
        symptoms: typeof symptoms === "string" ? [symptoms] : symptoms,
        urgency: urgency,
        triageResult: { 
            reason: `Voice AI determined urgency based on symptoms: ${symptomStr}`,
            source: "VOICE_AGENT" 
        },
        doctorId: assignedDoctorId,
        doctorName: assignedDoctorName,
        slot: slot || "",
        queueNo: queueNo,
        status: "pending"
    });
    
    await newConsultation.save();
    
    let message = `Your appointment is confirmed with Dr. ${assignedDoctorName}. Your queue number is ${queueNo}. `;
    if (urgency === "RED") {
        message += "Please proceed to the emergency room immediately as your symptoms indicate a critical condition.";
    } else {
        message += slot ? `Please arrive at ${slot}.` : "Please arrive 15 minutes before your slot.";
    }
    
    return NextResponse.json({
        status: "success",
        queueNo: queueNo,
        urgency: urgency,
        message: message
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error("Voice Agent Book Appointment Error:", error);
    return NextResponse.json(
      { message: "There was an error booking your appointment. Please try again or visit the hospital directly." },
      { status: 500, headers: corsHeaders }
    );
  }
}
