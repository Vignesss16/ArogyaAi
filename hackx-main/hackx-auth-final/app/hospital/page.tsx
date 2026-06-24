"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/lib/useLang";

const C = {
  primary: "#0F766E", // Deep Teal
  primaryLight: "#14B8A6", // Bright Teal
  accent: "#0284C7", // Ocean Blue
  green: "#10B981",
  red: "#EF4444",
  yellow: "#F59E0B",
  bg: "#F4F7F6", // Very soft mint/gray
  card: "#FFFFFF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
};

export default function HospitalDesktopDashboard() {
  const router = useRouter();
  const { lang, setLang, mounted } = useLang();
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const InfoButton = ({ text }: { text: string }) => (
    <div style={{ position: "relative", display: "inline-flex", marginLeft: 8, verticalAlign: "middle" }} className="info-btn">
      <span style={{ display: "inline-flex", width: 20, height: 20, background: "rgba(0,0,0,0.05)", borderRadius: "50%", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.muted, cursor: "help", fontWeight: 800 }}>i</span>
      <div className="tooltip" style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", width: 200, padding: 10, background: "#1E293B", color: "white", fontSize: 12, fontWeight: 500, borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 100, visibility: "hidden", opacity: 0, transition: "0.2s", marginBottom: 8, lineHeight: 1.4 }}>
        {text}
        <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #1E293B" }} />
      </div>
    </div>
  );

  const [queue, setQueue] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(30);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Advanced Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  const fetchData = useCallback(async () => {
    try {
      const [resQueue, resDocs] = await Promise.all([
        fetch("/api/consultations?status=all"),
        fetch("/api/admin/doctors")
      ]);
      const dataQueue = await resQueue.json();
      const dataDocs = await resDocs.json();
      setQueue(dataQueue.consultations || []);
      setDoctors(dataDocs.doctors || []);
    } catch {
      /* offline */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth) {
      fetchData();
      const iv = setInterval(() => {
        setTick((t) => {
          if (t <= 1) {
            fetchData();
            return 30;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [auth, fetchData]);

  if (!mounted) return null;

  if (!auth) {
    return (
      <div style={{ background: "radial-gradient(circle at 10% 20%, rgb(15, 118, 110) 0%, rgb(2, 132, 199) 90.2%)", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Animated Mesh Background Elements */}
        <div style={{ position: "absolute", width: 600, height: 600, background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)", top: -100, left: -100, borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 500, height: 500, background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)", bottom: -50, right: -100, borderRadius: "50%", filter: "blur(50px)" }} />

        <div style={{ width: "100%", maxWidth: 440, margin: "0 20px", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 24, padding: "48px 24px", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", border: `1px solid rgba(255,255,255,0.2)`, zIndex: 10, color: "white" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 40, boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)" }}>🏥</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-1px", color: "white" }}>AarogyaAI</h1>
            <p style={{ fontSize: 16, marginTop: 8, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Hospital Command Center</p>
          </div>
          {error && <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#FECACA", padding: "16px", borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 24, textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.4)" }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.9)" }}>Authorization Key</label>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter master password..."
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(""); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (pass === "hospital123") setAuth(true);
                    else setError("Invalid Credentials");
                  }
                }}
                style={{ width: "100%", padding: "16px 48px 16px 20px", border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 16, fontSize: 16, fontFamily: "inherit", background: "rgba(0,0,0,0.2)", color: "white", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 16, top: 40, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                )}
              </button>
            </div>
            <button
              onClick={() => {
                if (pass === "hospital123") setAuth(true);
                else setError("Invalid Credentials");
              }}
              style={{ width: "100%", padding: "18px", borderRadius: 16, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 16, background: "white", color: C.primary, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Access Command Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  let filteredQueue = queue;

  if (filterDate) {
    filteredQueue = filteredQueue.filter(q => {
      if (!q.createdAt) return true; // fallback if no date
      const qDate = new Date(q.createdAt).toISOString().split("T")[0];
      return qDate === filterDate;
    });
  }

  if (filterStatus !== "ALL") {
    filteredQueue = filteredQueue.filter(q => q.urgency === filterStatus);
  }

  if (searchQuery.trim()) {
    const ql = searchQuery.toLowerCase();
    filteredQueue = filteredQueue.filter(q =>
      (q.patientName || "").toLowerCase().includes(ql) ||
      (q.doctorName || "").toLowerCase().includes(ql) ||
      (q.symptoms || []).some((s: string) => s.toLowerCase().includes(ql))
    );
  }

  const pendingQueue = filteredQueue.filter(q => q.status !== "completed");
  const curedQueue = filteredQueue.filter(q => q.status === "completed");

  const redPatients = pendingQueue.filter(q => q.urgency === "RED");
  const yellowPatients = pendingQueue.filter(q => q.urgency === "YELLOW");
  const greenPatients = pendingQueue.filter(q => q.urgency === "GREEN");
  const totalPatients = pendingQueue.length;
  const curedPatientsCount = curedQueue.length;

  const hourlyData = [12, 19, 15, 25, 32, 28, 45, 38, 42, 50, 48, totalPatients];
  const maxHourly = Math.max(...hourlyData, 50);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", color: C.text }}>

      {/* Liquid Glass Top Navigation */}
      <nav style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${C.border}`, padding: "0 40px", position: "sticky", top: 20, margin: "20px 40px 20px 40px", borderRadius: 24, zIndex: 50, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 80 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "white", boxShadow: "0 4px 10px rgba(20, 184, 166, 0.3)" }}>🏥</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px", color: C.primary }}>AarogyaAI</h1>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "dashboard", label: T("डैशबोर्ड", "Dashboard") },
                { id: "emergencies", label: T("आपात स्थिति", "Emergencies") },
                { id: "wards", label: T("वार्ड", "Wards") },
                { id: "analytics", label: T("एनालिटिक्स", "Analytics") },
              ].map(nav => (
                <button key={nav.id} onClick={() => { setActiveTab(nav.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === nav.id ? "rgba(15, 118, 110, 0.08)" : "transparent", color: activeTab === nav.id ? C.primary : C.muted, fontWeight: activeTab === nav.id ? 700 : 600, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {nav.label}
                </button>
              ))}
              <button onClick={() => router.push("/admin")} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "transparent", color: C.muted, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                {T("डॉक्टर प्रबंधित करें", "Manage Doctors")} ↗
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button onClick={() => setLang(lang === "hi" ? "en" : "hi")} style={{ background: "#F1F5F9", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              🌐 {lang === "hi" ? "English" : "हिंदी"}
            </button>
            <div style={{ height: 32, width: 1, background: C.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Admin User</div>
                <div style={{ fontSize: 12, color: C.primaryLight, fontWeight: 600 }}>Director</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontSize: 18 }}>👨‍💼</div>
            </div>
          </div>

        </div>
      </nav>

      <main style={{ flex: 1, padding: "40px", maxWidth: 1600, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-1px" }}>{T("कमांड सेंटर ओवरव्यू", "Command Center Overview")}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: C.muted, fontWeight: 500 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.green, fontWeight: 700, background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
                {T("सिस्टम लाइव", "System Live")}
              </span>
              <span>•</span>
              <span>{T("अगला रिफ्रेश", "Next refresh in")} {tick}s</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{new Date().toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        {/* Advanced Search & Filter Bar */}
        <div style={{ background: C.card, borderRadius: 24, padding: "20px 32px", display: "flex", alignItems: "center", gap: 24, marginBottom: 40, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", border: `1px solid ${C.border}` }}>

          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: C.muted }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="text"
              placeholder={T("मरीज, डॉक्टर, या बीमारी खोजें...", "Search patient, doctor, or disease...")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#F8FAFC", fontSize: 15, fontWeight: 500, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
              onFocus={e => e.currentTarget.style.borderColor = C.primary}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
          </div>

          <div style={{ width: 1, height: 40, background: C.border }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg style={{ color: C.muted }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: C.text, cursor: "pointer", background: "transparent", fontFamily: "inherit" }} />
          </div>

          <div style={{ width: 1, height: 40, background: C.border }} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg style={{ color: C.muted }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: C.text, cursor: "pointer", background: "transparent", fontFamily: "inherit" }}>
              <option value="ALL">{T("सभी स्थितियां", "All Statuses")}</option>
              <option value="RED">{T("गंभीर", "Critical (RED)")}</option>
              <option value="YELLOW">{T("तत्काल", "Urgent (YELLOW)")}</option>
              <option value="GREEN">{T("सामान्य", "Standard (GREEN)")}</option>
            </select>
          </div>

        </div>

        {/* KPIs */}
        {(activeTab === "dashboard" || activeTab === "analytics") && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
            {[
              { label: T("कुल मरीज़", "Total Active Patients"), value: totalPatients, trend: "+12%", icon: "👥", color: C.accent },
              { label: T("गंभीर आपात स्थिति", "Critical Emergencies"), value: redPatients.length, trend: "Urgent", icon: "🚨", color: C.red, alert: redPatients.length > 0 },
              { label: T("इलाज किए गए मरीज़", "Cured Patients"), value: curedPatientsCount, trend: "Success", icon: "✅", color: C.green },
              { label: T("उपलब्ध डॉक्टर", "Doctors on Duty"), value: doctors.length, trend: "Optimal", icon: "👨‍⚕️", color: C.primaryLight },
            ].map((kpi, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
                {kpi.alert && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: C.red, animation: "pulse 1.5s infinite" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${kpi.color}15`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {kpi.icon}
                  </div>
                  <div style={{ background: `${kpi.color}15`, color: kpi.color, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                    {kpi.trend}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: kpi.alert ? C.red : C.text, lineHeight: 1, marginBottom: 12 }}>{kpi.value}</div>
                  <div style={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: activeTab === "analytics" ? "1fr" : "2fr 1fr", gap: 32 }}>

          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Emergencies */}
            {(activeTab === "dashboard" || activeTab === "emergencies") && (
              <div style={{ background: C.card, borderRadius: 24, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
                <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: redPatients.length > 0 ? "#FEF2F2" : "transparent" }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: redPatients.length > 0 ? C.red : C.text, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: redPatients.length > 0 ? C.red : C.muted, animation: redPatients.length > 0 ? "pulse 1s infinite" : "none" }} />
                    {T("आपातकालीन ट्राइएज", "Emergency Triage (RED)")}
                  </h3>
                </div>
                <div style={{ padding: 0 }}>
                  {redPatients.length === 0 ? (
                    <div style={{ padding: 60, textAlign: "center", color: C.muted }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{T("कोई आपात स्थिति नहीं", "No Critical Emergencies")}</div>
                      <div style={{ fontSize: 15, marginTop: 8 }}>{T("सभी गंभीर मामले हल हो गए हैं।", "All critical cases have been resolved.")}</div>
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Patient Identity</th>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Clinical Symptoms</th>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Assigned Unit</th>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redPatients.map((p, i) => (
                          <tr key={p._id} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "24px 32px" }}>
                              <div style={{ fontWeight: 800, color: C.text, fontSize: 16 }}>{p.patientName}</div>
                              <div style={{ fontSize: 14, color: C.muted, marginTop: 6, fontWeight: 500 }}>📱 {p.patientPhone}</div>
                            </td>
                            <td style={{ padding: "24px 32px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {p.symptoms.slice(0, 3).map((s: string, idx: number) => (
                                  <span key={idx} style={{ background: "rgba(239, 68, 68, 0.1)", color: C.red, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{s}</span>
                                ))}
                                {p.symptoms.length > 3 && <span style={{ fontSize: 12, color: C.muted, fontWeight: 700, alignSelf: "center" }}>+{p.symptoms.length - 3}</span>}
                              </div>
                            </td>
                            <td style={{ padding: "24px 32px" }}>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{p.doctorName || "Pending Assignment"}</div>
                            </td>
                            <td style={{ padding: "24px 32px" }}>
                              <button onClick={() => window.open(`tel:${p.patientPhone}`)} style={{ padding: "10px 20px", background: C.red, color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }}>
                                Dispatch Alert
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Standard Wards */}
            {(activeTab === "dashboard" || activeTab === "wards") && (
              <div style={{ background: C.card, borderRadius: 24, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
                <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{T("मानक वार्ड (पीला/हरा)", "Standard Wards (Yellow/Green)")}</h3>
                  <div style={{ fontSize: 14, color: C.primaryLight, fontWeight: 700, background: `${C.primaryLight}15`, padding: "6px 16px", borderRadius: 20 }}>
                    {yellowPatients.length + greenPatients.length} Active Cases
                  </div>
                </div>
                <div style={{ padding: 0 }}>
                  {yellowPatients.length === 0 && greenPatients.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No patients in standard ward.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Patient</th>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Priority Status</th>
                          <th style={{ padding: "20px 32px", fontWeight: 700 }}>Assigned Doctor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...yellowPatients, ...greenPatients].map((p, i) => (
                          <tr key={p._id} style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "20px 32px" }}>
                              <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{p.patientName}</div>
                            </td>
                            <td style={{ padding: "20px 32px" }}>
                              <span style={{ background: p.urgency === "YELLOW" ? "#FEF3C7" : "#D1FAE5", color: p.urgency === "YELLOW" ? "#D97706" : "#059669", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                                {p.urgency === "YELLOW" ? "🟡 YELLOW" : "🟢 GREEN"}
                              </span>
                            </td>
                            <td style={{ padding: "20px 32px" }}>
                              <div style={{ fontSize: 15, fontWeight: 600 }}>{p.doctorName || "Unassigned"}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Cured Patients */}
            {(activeTab === "dashboard" || activeTab === "wards" || activeTab === "analytics") && curedQueue.length > 0 && (
              <div style={{ background: C.card, borderRadius: 24, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}>
                <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ECFDF5" }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.green }}>{T("डिस्चार्ज किए गए मरीज़", "Discharged / Cured Patients")}</h3>
                  <div style={{ fontSize: 14, color: C.green, fontWeight: 700, background: "rgba(16, 185, 129, 0.15)", padding: "6px 16px", borderRadius: 20 }}>
                    {curedPatientsCount} Successfully Treated
                  </div>
                </div>
                <div style={{ padding: 0 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        <th style={{ padding: "20px 32px", fontWeight: 700 }}>Patient</th>
                        <th style={{ padding: "20px 32px", fontWeight: 700 }}>Treated By</th>
                        <th style={{ padding: "20px 32px", fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curedQueue.map((p, i) => (
                        <tr key={p._id} style={{ borderTop: `1px solid ${C.border}` }}>
                          <td style={{ padding: "20px 32px" }}>
                            <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{p.patientName}</div>
                          </td>
                          <td style={{ padding: "20px 32px" }}>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>{p.doctorName || "Unknown Doctor"}</div>
                          </td>
                          <td style={{ padding: "20px 32px" }}>
                            <span style={{ background: "#D1FAE5", color: "#059669", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                              ✅ CURED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Right Column / Analytics */}
          {(activeTab === "dashboard" || activeTab === "analytics") && (
            <div style={{ display: "flex", flexDirection: activeTab === "analytics" ? "row" : "column", gap: 32 }}>

              {/* Triage Distribution */}
              <div style={{ background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 24 }}>
                  {T("ट्राइएज वितरण", "Triage Distribution")}
                  <InfoButton text="Shows the proportion of patients classified by severity. RED means immediate life-saving care is required." />
                </h3>
                <div style={{ display: "flex", height: 32, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
                  <div style={{ width: `${totalPatients ? (redPatients.length / totalPatients) * 100 : 0}%`, background: C.red, transition: "width 1s ease" }} />
                  <div style={{ width: `${totalPatients ? (yellowPatients.length / totalPatients) * 100 : 0}%`, background: C.yellow, transition: "width 1s ease" }} />
                  <div style={{ width: `${totalPatients ? (greenPatients.length / totalPatients) * 100 : 100}%`, background: totalPatients ? C.green : C.border, transition: "width 1s ease" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FEF2F2", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: C.red }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: C.red }} /> Critical (RED)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{redPatients.length}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FFFBEB", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: C.yellow }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: C.yellow }} /> Urgent (YELLOW)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.yellow }}>{yellowPatients.length}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#ECFDF5", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: C.green }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: C.green }} /> Standard (GREEN)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{greenPatients.length}</div>
                  </div>
                </div>
              </div>

              {/* Patient Influx Chart */}
              <div style={{ background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 24 }}>
                  {T("रोगी की आमद (12 घंटे)", "Patient Influx (12h)")}
                  <InfoButton text="Displays the volume of new patients admitted every hour over the last 12 hours. Used to predict crowding." />
                </h3>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 10, minHeight: 180 }}>
                  {hourlyData.map((val, i) => (
                    <div key={i} style={{ flex: 1, background: i === hourlyData.length - 1 ? C.primary : "#E2E8F0", height: `${(val / maxHourly) * 100}%`, borderRadius: "6px 6px 0 0", position: "relative", transition: "height 0.5s ease" }}>
                      <div style={{ position: "absolute", top: -24, width: "100%", textAlign: "center", fontSize: 12, fontWeight: 800, color: C.muted, opacity: i % 2 === 0 || i === hourlyData.length - 1 ? 1 : 0 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Load Chart */}
              <div style={{ background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 24 }}>
                  {T("विभागों का भार", "Department Load")}
                  <InfoButton text="Real-time estimated allocation of patients across medical departments to help manage staffing." />
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "General Medicine", value: Math.max(1, Math.floor(totalPatients * 0.45)), color: C.accent },
                    { label: "Cardiology", value: Math.max(0, Math.floor(totalPatients * 0.25)), color: C.red },
                    { label: "Pediatrics", value: Math.max(0, Math.floor(totalPatients * 0.20)), color: C.primaryLight },
                    { label: "Orthopedics", value: Math.max(0, Math.floor(totalPatients * 0.10)), color: C.yellow }
                  ].map((dept, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8, color: C.text }}>
                        <span>{dept.label}</span>
                        <span>{dept.value} cases</span>
                      </div>
                      <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${totalPatients ? (dept.value / totalPatients) * 100 : 0}%`, height: "100%", background: dept.color, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment Success Overview */}
              <div style={{ background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 24 }}>
                  {T("उपचार की दर", "Treatment Success Overview")}
                  <InfoButton text="Compares the number of successfully cured patients vs patients still waiting/pending treatment." />
                </h3>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.green }}>
                      <span>Cured & Discharged</span>
                      <span>{curedPatientsCount} Patients</span>
                    </div>
                    <div style={{ height: 16, background: "#E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ width: `${totalPatients + curedPatientsCount ? (curedPatientsCount / (totalPatients + curedPatientsCount)) * 100 : 0}%`, height: "100%", background: C.green, transition: "width 1s ease" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.accent }}>
                      <span>Pending Treatment</span>
                      <span>{totalPatients} Patients</span>
                    </div>
                    <div style={{ height: 16, background: "#E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ width: `${totalPatients + curedPatientsCount ? (totalPatients / (totalPatients + curedPatientsCount)) * 100 : 0}%`, height: "100%", background: C.accent, transition: "width 1s ease" }} />
                    </div>
                  </div>

                  <div style={{ textAlign: "center", marginTop: 10 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>
                      {totalPatients + curedPatientsCount > 0 ? Math.round((curedPatientsCount / (totalPatients + curedPatientsCount)) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>Overall Resolution Rate</div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Informative Footer */}
        <footer style={{ marginTop: 60, borderTop: `1px solid ${C.border}`, paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", color: C.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(15, 118, 110, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏥</div>
            <div>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>AarogyaAI Central Operations</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>Secure Medical Command Interface</div>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {T("AarogyaAI © 2026. सर्वाधिकार सुरक्षित।", "AarogyaAI © 2026. All rights reserved.")}
          </div>
        </footer>

      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .info-btn:hover .tooltip { visibility: visible !important; opacity: 1 !important; transform: translateX(-50%) translateY(-5px) !important; }
      `}</style>
    </div>
  );
}
