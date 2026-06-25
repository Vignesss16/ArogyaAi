import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Consultation from "@/models/Consultation";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    // Voice agent sends JSON payload mid-call
    const body = await req.json();
    const doctorName = body.doctorName || body.doctor_name;
    
    // Max slots per doctor per day
    const MAX_SLOTS = 20;
    
    let doctorQuery = {};
    if (doctorName) {
        doctorQuery = { name: { $regex: new RegExp(doctorName, "i") } };
    }
    
    const doctor = await Doctor.findOne(doctorQuery);
    
    if (!doctor) {
        return NextResponse.json({
            message: "I could not find a doctor with that name. We have general physicians available."
        });
    }
    
    // Find pending consultations for this doctor today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const bookedCount = await Consultation.countDocuments({
        doctorId: doctor._id.toString(),
        status: { $ne: "completed" },
        createdAt: { $gte: startOfDay }
    });
    
    const remainingSlots = Math.max(0, MAX_SLOTS - bookedCount);
    
    if (remainingSlots > 0) {
        return NextResponse.json({
            status: "success",
            doctorId: doctor._id,
            doctorName: doctor.name,
            remainingSlots: remainingSlots,
            message: `Dr. ${doctor.name} has ${remainingSlots} slots available today. Should I proceed with booking the appointment?`
        });
    } else {
        return NextResponse.json({
            status: "full",
            doctorId: doctor._id,
            doctorName: doctor.name,
            remainingSlots: 0,
            message: `Dr. ${doctor.name} is fully booked today. Would you like to schedule an appointment for tomorrow or see another available doctor?`
        });
    }
    
  } catch (error) {
    console.error("Voice Agent Check Slots Error:", error);
    return NextResponse.json(
      { message: "There was an error checking the schedule. Please try again." },
      { status: 500 }
    );
  }
}
