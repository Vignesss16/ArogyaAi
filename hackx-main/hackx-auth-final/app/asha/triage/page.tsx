"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SYMPTOMS = [
  { id: "fever",      emoji: "🌡️", hi: "बुखार",              en: "Fever" },
  { id: "chest",      emoji: "💔",  hi: "सीने में दर्द",      en: "Chest Pain" },
  { id: "breath",     emoji: "😮‍💨", hi: "सांस में तकलीफ",    en: "Breathlessness" },
  { id: "cough",      emoji: "😮",  hi: "खांसी",              en: "Cough" },
  { id: "cold",       emoji: "🤧",  hi: "जुकाम",              en: "Cold / Runny Nose" },
  { id: "headache",   emoji: "🤕",  hi: "सिरदर्द",            en: "Headache" },
  { id: "vomit",      emoji: "🤢",  hi: "उल्टी",              en: "Vomiting" },
  { id: "diarrhea",   emoji: "💧",  hi: "दस्त",               en: "Diarrhea" },
  { id: "rash",       emoji: "🔴",  hi: "दाने / चकत्ते",     en: "Skin Rash" },
  { id: "pain",       emoji: "🦴",  hi: "जोड़ों में दर्द",    en: "Joint Pain" },
  { id: "weakness",   emoji: "😴",  hi: "कमज़ोरी",            en: "Weakness" },
  { id: "stomach",    emoji: "😣",  hi: "पेट में दर्द",       en: "Stomach Pain" },
  { id: "eyes",       emoji: "👁️", hi: "आँखों में जलन",      en: "Eye Problem" },
  { id: "back",       emoji: "🔙",  hi: "कमर दर्द",           en: "Back Pain" },
  { id: "dizzy",      emoji: "💫",  hi: "चक्कर",              en: "Dizziness" },
  { id: "swelling",   emoji: "🦵",  hi: "सूजन",               en: "Swelling" },
  { id: "chills",     emoji: "🥶",  hi: "ठंड लगना / कंपकंपी", en: "Chills / Shivering" },
  { id: "body_ache",  emoji: "🤸",  hi: "पूरे शरीर में दर्द", en: "Body Ache" },
  { id: "sweat",      emoji: "💦",  hi: "अत्यधिक पसीना",      en: "Excessive Sweating" },
  { id: "urine_burn", emoji: "🔥",  hi: "पेशाब में जलन",      en: "Burning Urination" },
  { id: "nausea",     emoji: "😰",  hi: "जी मिचलाना",         en: "Nausea" },
  { id: "unconscious",emoji: "😵",  hi: "बेहोशी",             en: "Unconsciousness" },
  { id: "seizure",    emoji: "⚡",  hi: "दौरे पड़ना",          en: "Seizures" },
  { id: "bleed",      emoji: "🩸",  hi: "असामान्य रक्तस्राव", en: "Unusual Bleeding" },
];

const C = { primary: "#1B6CA8", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", purple: "#7D3C98", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

export default function ASHATriagePage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const lang = typeof window !== "undefined" ? localStorage.getItem("lang") || "hi" : "hi";
  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleTriage = async () => {
    if (!symptoms.trim() && selected.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      // Map selected IDs back to English names for the AI
      const selectedNames = selected.map(id => SYMPTOMS.find(s => s.id === id)?.en).filter(Boolean);
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedNames, customSymptoms: symptoms, duration: "", diseases: [] }),
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
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 12 }}>
              {T("लक्षणों पर टैप करें", "Tap Symptoms")}
            </label>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {SYMPTOMS.map(sym => {
                const sel = selected.includes(sym.id);
                return (
                  <div key={sym.id} onClick={() => toggle(sym.id)}
                    style={{ background: sel ? "#EBF4FD" : C.bg, borderRadius: 12, border: `2px solid ${sel ? C.primary : "transparent"}`, padding: "8px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", transition: "all .2s", minHeight: 70, justifyContent: "center", position: "relative" }}>
                    {sel && <div style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 800 }}>✓</div>}
                    <div style={{ fontSize: 24, lineHeight: 1 }}>{sym.emoji}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, textAlign: "center", color: sel ? C.primary : C.text, lineHeight: 1.2 }}>{lang === "hi" ? sym.hi : sym.en}</div>
                  </div>
                );
              })}
            </div>

            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8, marginTop: 12 }}>
              {T("अन्य लक्षण (लिखें)", "Other Symptoms (Describe)")}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={T("मरीज़ को क्या परेशानी है?", "What else is bothering the patient?")}
              style={{ width: "100%", height: 80, borderRadius: 12, border: `1px solid ${C.border}`, padding: 12, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", background: C.bg }}
            />
            
            <button 
              onClick={handleTriage}
              disabled={loading || (!symptoms.trim() && selected.length === 0)}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading || (!symptoms.trim() && selected.length === 0) ? C.muted : `linear-gradient(135deg,${C.purple},#5B2C6F)`, color: "white", fontWeight: 700, fontSize: 14, marginTop: 16, cursor: loading || (!symptoms.trim() && selected.length === 0) ? "not-allowed" : "pointer", transition: "all 0.2s" }}
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
