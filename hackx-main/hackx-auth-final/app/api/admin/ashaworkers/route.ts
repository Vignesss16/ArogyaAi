export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ASHAWorker } from "@/models/index";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const workers = await ASHAWorker.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ workers });
  } catch (err) {
    console.error("GET ASHA Workers Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, phone, password, villages } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await ASHAWorker.findOne({ phone });
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    // In a real app we'd want to store hashed passwords for ASHAWorkers as well.
    // For now we hash it. The login route will need to verify it via verifyPassword.
    const hashedPassword = await hashPassword(password);
    
    // Parse villages
    let villageArr: string[] = [];
    if (villages && typeof villages === "string") {
      villageArr = villages.split(",").map(v => v.trim()).filter(Boolean);
    }

    const worker = await ASHAWorker.create({
      name,
      phone,
      password: hashedPassword,
      villages: villageArr,
      role: "ashaworker",
    });

    return NextResponse.json({ success: true, worker }, { status: 201 });
  } catch (err: any) {
    console.error("POST ASHA Worker Error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
