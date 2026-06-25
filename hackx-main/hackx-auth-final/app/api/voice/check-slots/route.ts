import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Consultation from "@/models/Consultation";

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
    
    // Voice agent sends JSON payload mid-call
    const body = await req.json();
    const doctorName = body.doctorName || body.doctor_name;
    
    let doctorQuery = {};
    if (doctorName) {
        doctorQuery = { name: { $regex: new RegExp(doctorName, "i") } };
    }
    
    const doctor = await Doctor.findOne(doctorQuery);
    
    if (!doctor) {
        return NextResponse.json({
            message: "I could not find a doctor with that name. We have general physicians available."
        }, { headers: corsHeaders });
    }
    
    // Find consultations for this doctor today to check which slots are taken
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const bookedConsultations = await Consultation.find({
        doctorId: doctor._id.toString(),
        status: { $ne: "completed" },
        createdAt: { $gte: startOfDay }
    }).select("slot");

    const takenSlots = bookedConsultations.map(c => c.slot).filter(Boolean);
    
    // Master list of all possible slots
    const allSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM", "4:00 PM"];
    
    // Filter out the taken ones
    const availableSlots = allSlots.filter(s => !takenSlots.includes(s));
    
    if (availableSlots.length > 0) {
        return NextResponse.json({
            status: "success",
            doctorId: doctor._id,
            doctorName: doctor.name,
            availableSlots: availableSlots,
            message: `Dr. ${doctor.name} has the following slots available today: ${availableSlots.join(", ")}. What time would the patient prefer?`
        }, { headers: corsHeaders });
    } else {
        return NextResponse.json({
            status: "full",
            doctorId: doctor._id,
            doctorName: doctor.name,
            availableSlots: [],
            message: `Dr. ${doctor.name} is fully booked today. Would you like to schedule an appointment for tomorrow or see another available doctor?`
        }, { headers: corsHeaders });
    }
    
  } catch (error) {
    console.error("Voice Agent Check Slots Error:", error);
    return NextResponse.json(
      { message: "There was an error checking the schedule. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}
