"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const C = {
  primary: "#1B6CA8",
  primaryDark: "#0F4C7A",
  bg: "#F0F4F8",
  card: "#FFFFFF",
  text: "#1A2332",
  muted: "#6B7C93",
  border: "#DDE3EC",
};

export default function TermsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"hi" | "en">("hi");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "en") setLang("en");
  }, []);

  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  const toggleLang = () => {
    const nextLang = lang === "hi" ? "en" : "hi";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
  };

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(160deg,#0F4C7A,#1B6CA8)", padding: "40px 16px 20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.get("closeable") === "true") {
                  window.close();
                } else if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push("/login");
                }
              }}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 10,
                color: "white",
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← {t("वापस", "Back")}
            </button>
            <button
              onClick={toggleLang}
              style={{
                background: "white",
                border: "none",
                borderRadius: 10,
                color: C.primaryDark,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "English" : "हिन्दी"}
            </button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: 0 }}>
            {t("नियम और शर्तें", "Terms & Conditions")}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
            {t("AarogyaAI गोपनीयता और सेवा नीतियां", "AarogyaAI Privacy & Service Policies")}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Card 1: Privacy and Access Control */}
          <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.primaryDark, margin: "0 0 8px 0" }}>
              🔒 1. {t("गोपनीयता और डेटा सुरक्षा", "Privacy & Data Protection")}
            </h3>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>
              {t(
                "AarogyaAI आपके स्वास्थ्य डेटा की गोपनीयता को लेकर प्रतिबद्ध है। आपका मेडिकल रिकॉर्ड और लैब रिपोर्ट्स केवल आपके अधिकृत डॉक्टर को ही दिखाई जाएंगी। अन्य डॉक्टर या अनधिकृत कर्मचारी आपकी रिपोर्ट्स नहीं देख सकते।",
                "AarogyaAI is committed to the privacy of your health data. Your medical history and lab reports are strictly visible only to your assigned doctor. No other doctor or unauthorized staff can view your reports."
              )}
            </p>
          </div>

          {/* Card 2: AI Triage Disclaimer */}
          <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.primaryDark, margin: "0 0 8px 0" }}>
              🤖 2. {t("AI प्राथमिक जांच (Triage) अस्वीकरण", "AI Triage Disclaimer")}
            </h3>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>
              {t(
                "AarogyaAI का AI लक्षण जांचकर्ता केवल तत्काल मार्गदर्शन और प्राथमिक परामर्श के लिए है। यह वास्तविक डॉक्टर की जांच का विकल्प नहीं है। गंभीर स्थिति या आपातकाल में तुरंत 108 नंबर डायल करें या नजदीकी अस्पताल जाएं।",
                "AarogyaAI's AI symptom checker is only for immediate guidance and basic reference. It is NOT a replacement for a real doctor's clinical examination. In case of serious emergencies, immediately call 108 or visit the nearest hospital."
              )}
            </p>
          </div>

          {/* Card 3: Telemedicine and Consultation Consent */}
          <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.primaryDark, margin: "0 0 8px 0" }}>
              📞 3. {t("टेलीमेडिसिन और परामर्श सहमति", "Telemedicine & Consultation Consent")}
            </h3>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>
              {t(
                "पंजीकरण करने पर आप डिजिटल परामर्श, वीडियो कॉल्स और डॉक्टरों द्वारा दी गई दवाओं की सलाह के माध्यम से उपचार प्राप्त करने की सहमति देते हैं। डॉक्टर द्वारा रिकॉर्ड किए गए वॉयस नोट्स का सुरक्षित विश्लेषण किया जाता है।",
                "By registering, you consent to receive treatment via digital consultation, video calls, and medical prescriptions. Voice notes recorded by doctors are securely processed for automated clinical summaries."
              )}
            </p>
          </div>

          {/* Card 4: User Accountability */}
          <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.primaryDark, margin: "0 0 8px 0" }}>
              📋 4. {t("सटीक जानकारी की जिम्मेदारी", "Responsible Data Submission")}
            </h3>
            <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6, margin: 0 }}>
              {t(
                "मरीज या आशा (ASHA) कार्यकर्ता को सही और सटीक लक्षण, पुरानी बीमारी और रिपोर्ट अपलोड करने होंगे। गलत डेटा सबमिशन उपचार में बाधा या गलत दवा का कारण बन सकता है।",
                "Patients and ASHA workers are responsible for entering accurate symptoms, history, and records. Submitting false or incorrect information can lead to medical errors."
              )}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
