"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const C = { primary: "#1B6CA8", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", purple: "#7D3C98", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

export default function ASHATriagePage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const lang = typeof window !== "undefined" ? localStorage.getItem("lang") || "hi" : "hi";
  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  const handleTriage = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: [], customSymptoms: symptoms, duration: "", diseases: [] }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "44px 14px 10px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/asha/dashboard")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{T("AI Triage", "AI Triage Assistant")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{T("लक्षण दर्ज करें", "Enter patient symptoms")}</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8 }}>
              {T("मरीज़ के लक्षण (विस्तार से)", "Patient Symptoms (Detailed)")}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={T("मरीज़ को क्या परेशानी है?", "What is bothering the patient?")}
              style={{ width: "100%", height: 120, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit" }}
            />
            
            <button 
              onClick={handleTriage}
              disabled={loading || !symptoms.trim()}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading || !symptoms.trim() ? C.muted : `linear-gradient(135deg,${C.purple},#5B2C6F)`, color: "white", fontWeight: 700, fontSize: 14, marginTop: 16, cursor: loading || !symptoms.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}
            >
              {loading ? T("विश्लेषण कर रहा है...", "Analyzing...") : T("AI से जांच करें", "Analyze with AI")}
            </button>
          </div>

          {result && (
            <div style={{ marginTop: 20, background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, animation: "slideUp 0.3s ease-out" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 12px 0", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                {T("AI विश्लेषण परिणाम", "AI Analysis Result")}
              </h3>
              
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: result.urgency === "RED" ? "#F9EBEA" : result.urgency === "YELLOW" ? "#FEF5E7" : "#EAFAF1", padding: 10, borderRadius: 8, border: `1px solid ${result.urgency === "RED" ? "#F1948A" : result.urgency === "YELLOW" ? "#F8C471" : "#82E0AA"}` }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{T("प्राथमिकता", "Priority")}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: result.urgency === "RED" ? C.red : result.urgency === "YELLOW" ? C.yellow : C.green }}>
                    {result.urgency}
                  </div>
                </div>
              </div>

              {result.diagnosis_hi && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{T("संभावित बीमारी", "Possible Condition")}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{lang === "hi" ? result.diagnosis_hi : result.diagnosis_en}</div>
                </div>
              )}

              {result.explanation_hi && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{T("विवरण", "Explanation")}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{lang === "hi" ? result.explanation_hi : result.explanation_en}</div>
                </div>
              )}

              {result.next_steps_hi && result.next_steps_hi.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{T("सुझाव / कदम", "Next Steps")}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
                    {(lang === "hi" ? result.next_steps_hi : result.next_steps_en).map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
