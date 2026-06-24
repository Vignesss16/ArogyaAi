"use client";
import { useState, useEffect } from "react";
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

const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

export default function SymptomsPage() {
  const router = useRouter();
  const lang = typeof window !== "undefined" ? localStorage.getItem("lang") || "hi" : "hi";
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // Clear previous session data when starting fresh
    if (typeof window !== "undefined") {
      localStorage.removeItem("symptomDetailData");
      localStorage.removeItem("triageResult");
      localStorage.removeItem("uploadedRecords");
      localStorage.removeItem("customSymptoms");
    }
  }, []);

  const [customSymptoms, setCustomSymptoms] = useState("");

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const goToDetail = () => {
    if (selected.length === 0 && customSymptoms.trim().length === 0) return;
    localStorage.setItem("selectedSymptoms", JSON.stringify(selected));
    localStorage.setItem("customSymptoms", customSymptoms);
    router.push("/symptom-detail");
  };

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }} className="screen-animate">
        {/* Offline bar */}
        <div style={{ background: "#E8F8EF", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#1E8449", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1E8449" }} />
          {t("AI सक्रिय है", "AI Active")}
        </div>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t("आप कैसा महसूस कर रहे हैं?", "How are you feeling?")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{t("सभी लक्षण टैप करें", "Tap all your symptoms")}</div>
          </div>
        </div>
        <div style={{ background: "#EBF4FD", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: C.primary, margin: "8px 16px 0" }}>
          💡 {t("लक्षणों पर टैप करें या नीचे लिखें", "Tap icons or describe below")}
        </div>
        
        <div style={{ padding: "10px 16px 0" }}>
          <textarea
            value={customSymptoms}
            onChange={(e) => setCustomSymptoms(e.target.value)}
            placeholder={t("मुझे बुखार और सिरदर्द है...", "I have fever and headache...")}
            style={{ width: "100%", height: 80, borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", color: C.text }}
          />
        </div>
        {/* Symptom grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {SYMPTOMS.map(sym => {
              const sel = selected.includes(sym.id);
              return (
                <div key={sym.id} onClick={() => toggle(sym.id)}
                  style={{ background: sel ? "#EBF4FD" : C.card, borderRadius: 14, border: `2px solid ${sel ? C.primary : C.border}`, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", transition: "all .18s", minHeight: 80, justifyContent: "center", position: "relative" }}>
                  {sel && <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 800 }}>✓</div>}
                  <div style={{ fontSize: 26, lineHeight: 1 }}>{sym.emoji}</div>
                  <div style={{ fontFamily: "var(--font-hi)", fontSize: 10, fontWeight: 600, textAlign: "center", color: sel ? C.primary : C.text, lineHeight: 1.3 }}>{lang === "hi" ? sym.hi : sym.en}</div>
                  {lang === "hi" && <div style={{ fontSize: 9, color: C.muted, textAlign: "center" }}>{sym.en}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ height: 100 }} />
        </div>
        {/* Bottom bar */}
        <div style={{ background: C.card, borderTop: `2px solid ${C.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: (selected.length > 0 || customSymptoms.length > 0) ? "#EBF4FD" : C.bg, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: (selected.length > 0 || customSymptoms.length > 0) ? C.primary : C.muted, flexShrink: 0, minWidth: 64, textAlign: "center" }}>
            {selected.length} {t("चुने", "sel")}
          </div>
          <button onClick={goToDetail} disabled={selected.length === 0 && customSymptoms.trim().length === 0}
            style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white", opacity: (selected.length === 0 && customSymptoms.trim().length === 0) ? .5 : 1, boxShadow: "0 4px 16px rgba(27,108,168,.4)" }}>
            {t("आगे बढ़ें", "Continue")} →
          </button>
        </div>
      </div>
    </div>
  );
}