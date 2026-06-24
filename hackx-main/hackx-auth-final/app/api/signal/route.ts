export const dynamic = 'force-dynamic';
/**
 * WebRTC Signaling via Pusher
 *
 * POST /api/signal  — send signal via Pusher
 *
 * Pusher replaces the old SSE system.  Each consultation room becomes a
 * Pusher channel: `consultation-<patientPhone>`.
 */

import { NextRequest, NextResponse } from "next/server";
import { pusher } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, fromClientId, type, data } = body;

    if (!roomId || !type) {
      return NextResponse.json(
        { error: "Missing roomId or type" },
        { status: 400 }
      );
    }

    // Use public channel - no auth needed
    const channelName = roomId;

    console.log(`[Pusher Signal] Sending ${type} to ${channelName}`);

    await pusher.trigger(channelName, "signal", {
      type,
      data,
      fromClientId,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Pusher signal error:", error);
    return NextResponse.json(
      { error: "Failed to send signal" },
      { status: 500 }
    );
  }
}
