import { NextRequest, NextResponse } from "next/server";
import { storeOTP, getOTP } from "@/lib/otpStore";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.TWOFACTOR_API_KEY;


  if (!apiKey) {
    // Dev mode — log OTP to console, don't attempt to send
    console.warn("[OTP] No TWOFACTOR_API_KEY set. Dev OTP:", otp);
    return { success: true };
  }

  try {
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/SehatSetu+OTP`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();
    console.log("[2Factor]", JSON.stringify(data));
    if (data.Status === "Success") return { success: true };
    return { success: false, error: data.Details || "SMS failed" };
  } catch (err) {
    console.error("[2Factor] Error:", err);
    return { success: false, error: String(err) };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    const isPhone = /^\d{10}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!identifier || (!isPhone && !isEmail)) {
      return NextResponse.json(
        { error: "Enter valid 10-digit number or email address" },
        { status: 400 }
      );
    }

    // Rate-limit: don't allow a new OTP if one was sent within the last 60s
    const existing = await getOTP(identifier);
    if (existing && existing.expiresAt.getTime() - Date.now() > 4 * 60 * 1000) {
      return NextResponse.json(
        { error: "OTP already sent. Wait 60 seconds." },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    await storeOTP(identifier, otp);

    let result: { success: boolean; error?: string } = { success: true, error: "" };
    if (isPhone) {
      result = await sendSMS(identifier, otp);
    } else {
      // Simulate Email OTP (in a real app, use SendGrid/Resend)
      console.log(`[Email Mock] Sending OTP ${otp} to ${identifier}`);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const isDev = process.env.NODE_ENV === "development" && !process.env.TWOFACTOR_API_KEY;
    // Always return devOtp in dev environment for easy testing, even for emails
    return NextResponse.json({
      success: true,
      ...(isDev && { devOtp: otp }),
    });
  } catch (err) {
    console.error("[OTP] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
