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
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("AI triage failed, using fallback:", err);
      // Import the fallbackTriage function dynamically on client
      const { fallbackTriage } = await import("@/lib/triage");
      const data = fallbackTriage(selected);
      setResult(data);
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

  // ── GREEN HOME REMEDIES PANEL (Copied from main triage) ──────────────────
  const GreenRemediesPanel = () => (
    <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `2px solid #27AE60` }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>
        🌿 {T("घरेलू उपचार", "Home Remedies")}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
        {T("मरीज़ के लक्षण हल्के हैं। नीचे दिए घरेलू उपाय आज़माएं।", "Symptoms are mild. Try these safe and effective home remedies.")}
      </div>
      {result.homeRemedies && result.homeRemedies.map((remedy: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < result.homeRemedies.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E8F8EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{remedy.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{lang === "hi" ? remedy.hi : remedy.en}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lang === "hi" ? remedy.en : remedy.hi}</div>
          </div>
        </div>
      ))}
      <div style={{ background: "#F0FBF4", borderRadius: 8, padding: "8px 10px", marginTop: 10, fontSize: 11, color: "#1E8449", fontWeight: 600, lineHeight: 1.5 }}>
        ✅ {T("2–3 दिनों में आराम न मिले तो डॉक्टर से मिलें।", "If no improvement in 2–3 days, consult a doctor.")}
      </div>
    </div>
  );

  const GRAD: Record<string, string> = {
    RED: "linear-gradient(160deg,#922B21,#C0392B)",
    YELLOW: "linear-gradient(160deg,#B7770D,#E67E22)",
    GREEN: "linear-gradient(160deg,#1A6B3A,#27AE60)",
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

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!result ? (
            <div style={{ padding: 16 }}>
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
            </div>
          ) : (
            <div style={{ animation: "slideUp 0.3s ease-out", paddingBottom: 100 }}>
              <div style={{ padding: "30px 16px 22px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: GRAD[result.urgency] }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 30, fontSize: 17, fontWeight: 800, color: "white", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", marginBottom: 10 }}>
                  {result.urgency === "RED" ? "🔴" : result.urgency === "YELLOW" ? "🟡" : "🟢"} {result.urgency}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{lang === "hi" ? result.conditionHi || result.diagnosis_hi : result.conditionEn || result.diagnosis_en}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4 }}>{lang === "hi" ? result.conditionEn || result.diagnosis_en : result.conditionHi || result.diagnosis_hi}</div>
              </div>

              <div style={{ padding: "0 16px" }}>
                {result.urgency === "RED" && (
                  <div style={{ background: C.card, borderRadius: 16, padding: 16, marginTop: 12, border: `2px solid ${C.red}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      🚨 {T("आपातकाल — तुरंत कार्रवाई करें", "EMERGENCY — Act Immediately")}
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#FDEDEC,#FADBD8)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>📞</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: C.red, marginBottom: 4 }}>108 पर अभी कॉल करें</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#922B21", marginBottom: 12 }}>Call 108 — National Emergency Ambulance</div>
                      <a href="tel:108" style={{ display: "block", background: "linear-gradient(135deg,#E74C3C,#922B21)", color: "white", padding: "14px 24px", borderRadius: 14, fontSize: 18, fontWeight: 900, textDecoration: "none" }}>
                        📞 {T("108 कॉल करें", "Call 108 Now")}
                      </a>
                    </div>
                  </div>
                )}

                {result.urgency === "YELLOW" && (
                  <div style={{ background: C.card, borderRadius: 16, padding: 16, marginTop: 12, border: `2px solid ${C.yellow}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#B7770D", textTransform: "uppercase", letterSpacing: .8, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      👨‍⚕️ {T("डॉक्टर को दिखाएं", "Refer to Doctor")}
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#FEF9E7,#FDEBD0)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#B7770D", marginBottom: 4 }}>
                        {T("मरीज़ को अस्पताल भेजें", "Refer Patient to Hospital")}
                      </div>
                      <div style={{ fontSize: 13, color: "#7D6608", marginBottom: 14, lineHeight: 1.5 }}>
                        {T("इस मरीज़ को डॉक्टर की ज़रूरत है। इन्हें नज़दीकी PHC या CHC में भेजें।", "This patient needs medical attention. Refer them to the nearest PHC or CHC.")}
                      </div>
                    </div>
                  </div>
                )}

                {result.urgency === "GREEN" && <GreenRemediesPanel />}

                {/* Do Now / Do Not / Warnings */}
                {result.doNow && [
                  { title: T("✅ अभी यह करें", "✅ Do This Now"), items: result.doNow, cross: false, numBg: C.bg, numColor: C.primary },
                  { title: T("🚫 यह बिलकुल न करें", "🚫 Do NOT Do This"), items: result.doNot, cross: true, numBg: "#FDEDED", numColor: C.red },
                  { title: T("⚠️ इन पर ध्यान दें", "⚠️ Watch For These"), items: result.warnings, cross: false, numBg: "#FEF9E7", numColor: "#B7770D" },
                ].map((section, si) => section.items && section.items.length > 0 && (
                  <div key={si} style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>{section.title}</div>
                    {section.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < section.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: section.numBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: section.numColor, flexShrink: 0, marginTop: 1 }}>
                          {section.cross ? "✗" : i + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{lang === "hi" ? item.hi || item : item.en || item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Info cards */}
                {result.docType && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {[
                      { label: T("डॉक्टर", "Doctor"), val: lang === "hi" ? result.docType.hi : result.docType.en },
                      { label: T("प्रतीक्षा", "Wait"), val: lang === "hi" ? result.wait.hi : result.wait.en, red: result.urgency === "RED" },
                      { label: T("संक्रामक?", "Contagious?"), val: lang === "hi" ? result.contagious.hi : result.contagious.en },
                    ].map((info, i) => (
                      <div key={i} style={{ flex: 1, background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>{info.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: info.red ? C.red : C.text, marginTop: 4 }}>{info.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {(result.summary || result.explanation_hi) && (
                  <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.primary}` }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>🤖 AI Clinical Summary</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>
                      {lang === "hi" ? (result.summary_hi || result.explanation_hi || result.summary) : (result.summary_en || result.explanation_en || result.summary)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {result && (
          <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "12px 16px", zIndex: 50, display: "flex", gap: 10 }}>
            <button onClick={() => { setResult(null); setSymptoms(""); setSelected([]); }} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: C.bg, color: C.text, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              🔄 {T("नया जाँच करें", "New Triage")}
            </button>
            <button onClick={() => router.push("/asha/dashboard")} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              🏠 {T("डैशबोर्ड", "Dashboard")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
