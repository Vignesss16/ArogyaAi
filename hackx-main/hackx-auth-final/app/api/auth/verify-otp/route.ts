export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getOTP, deleteOTP } from "@/lib/otpStore";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const record = await getOTP(phone);

    if (!record) {
      return NextResponse.json(
        { error: "No OTP found for this number. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await deleteOTP(phone);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json(
        { error: "Incorrect OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP is valid — delete it so it can't be reused
    await deleteOTP(phone);

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
