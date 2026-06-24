import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getOTP, deleteOTP } from "@/lib/otpStore";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { ASHAWorker } from "@/models/index";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, role, otp, newPassword } = await req.json();

    if (!identifier || !role || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Verify OTP
    const stored = await getOTP(identifier);
    if (!stored || stored.otp !== otp || stored.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await dbConnect();

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password based on role
    let updated = false;

    if (role === "patient") {
      const patient = await Patient.findOneAndUpdate({ phone: identifier }, { password: hashedPassword });
      if (patient) updated = true;
    } else if (role === "doctor") {
      const doctor = await Doctor.findOneAndUpdate({ email: identifier.toLowerCase().trim() }, { passwordHash: hashedPassword });
      if (doctor) updated = true;
    } else if (role === "ashaworker" || role === "pharmacist") {
      // In this system, ASHAWorker and Pharmacist share a similar phone-based login page.
      // We'll just reset ASHAWorker here. If Pharmacist needs it too, we'd add that model.
      const worker = await ASHAWorker.findOneAndUpdate({ phone: identifier }, { password: hashedPassword });
      if (worker) updated = true;
    }

    if (!updated) {
      return NextResponse.json({ error: "Account not found with this identifier" }, { status: 404 });
    }

    // Consume the OTP so it can't be reused
    await deleteOTP(identifier);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    console.error("Reset Password Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
