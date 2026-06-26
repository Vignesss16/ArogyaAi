"use client";
import Link from "next/link";
import { useEffect } from "react";
import { seedOfflineData } from "@/lib/db-offline";

export default function SplashPage() {

  useEffect(() => {
    // Seed offline DB on first load
    seedOfflineData().catch(console.error);
  }, []);

  return (
    <div style={{ 
      background: "linear-gradient(145deg, #0f3d61 0%, #1B6CA8 100%)", 
      minHeight: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        padding: "40px 24px", 
        gap: 0, 
        background: "transparent", 
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: 480
      }}>
        
        {/* BACKGROUND GLOW */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: 250, height: 250, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0 }} />

        {/* LOGO BOX WITH ACTUAL IMAGE */}
        <div style={{ 
          width: 100, 
          height: 100, 
          background: "rgba(255,255,255,.15)", 
          borderRadius: 30, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          marginBottom: 24, 
          border: "2px solid rgba(255,255,255,.25)", 
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          backdropFilter: "blur(10px)",
          zIndex: 1
        }}>
          <img src="/icon-192.png" alt="Aarogya AI Logo" style={{ width: 60, height: 60, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }} />
        </div>
        
        <div style={{ fontFamily: "var(--font-en)", fontSize: 38, fontWeight: 900, color: "white", textAlign: "center", lineHeight: 1.1, letterSpacing: -0.5, zIndex: 1 }}>AAROGYA.AI</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,.9)", textAlign: "center", marginTop: 8, letterSpacing: 0.5, zIndex: 1 }}>Bridge to Health — स्वास्थ्य का सेतु</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", textAlign: "center", marginTop: 6, fontStyle: "italic", zIndex: 1 }}>ग्रामीण टेलीमेडिसिन · AI-Powered · Offline-First</div>
        
        <div style={{ width: 50, height: 4, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent)", borderRadius: 4, margin: "28px auto", zIndex: 1 }} />
        
        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 14, width: "100%", zIndex: 1 }}>
          <Link href="/login" onClick={() => localStorage.setItem("lang", "hi")} style={{ 
            flex: 1, 
            padding: "16px 0", 
            borderRadius: 16, 
            border: "none", 
            fontSize: 18, 
            fontWeight: 800, 
            cursor: "pointer", 
            background: "white", 
            color: "#0F4C7A", 
            fontFamily: "var(--font-hi)", 
            textAlign: "center", 
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
          }}>हिंदी</Link>
          <Link href="/login" onClick={() => localStorage.setItem("lang", "en")} style={{ 
            flex: 1, 
            padding: "16px 0", 
            borderRadius: 16, 
            border: "2px solid rgba(255,255,255,.5)", 
            fontSize: 17, 
            fontWeight: 800, 
            cursor: "pointer", 
            background: "rgba(255,255,255,0.05)", 
            color: "white", 
            textAlign: "center", 
            textDecoration: "none",
            backdropFilter: "blur(5px)"
          }}>English</Link>
        </div>
        
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textAlign: "center", marginTop: 24, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#2ecc71", boxShadow: "0 0 6px #2ecc71" }} />
          Works offline · काम करता है बिना इंटरनेट
        </div>
      </div>
    </div>
  );
}
