"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

const C = { primary: "#1B6CA8", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

function PatientHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [lang, setLang] = useState("hi");
  const [patientPhone, setPatientPhone] = useState(searchParams.get("phone") || "");
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [bloodTests, setBloodTests] = useState<any[]>([]);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"overview" | "visits" | "blood-tests" | "vitals">("overview");

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
    if (status === "unauthenticated" || session?.user?.role !== "ashaworker") router.replace("/asha/login");
  }, [status]);

  useEffect(() => {
    if (!patientPhone) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/patients?phone=${patientPhone}`).then(r => r.json()).then(d => {
        setPatient(d.patient || null);
      }),
      fetch(`/api/asha/visits?patientPhone=${patientPhone}`).then(r => r.json()).then(d => {
        setVisits(d.visits || []);
      }),
      fetch(`/api/blood-tests?patientPhone=${patientPhone}`).then(r => r.json()).then(d => {
        setBloodTests(d.tests || []);
      }),
      fetch(`/api/vital-signs?patientPhone=${patientPhone}`).then(r => r.json()).then(d => {
        setVitalSigns(d.vitals || []);
      }),
    ]).finally(() => setLoading(false));
  }, [patientPhone]);

  if (status === "loading") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>⏳</div>;
  if (!session) return null;

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/asha/dashboard")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{T("मरीज़ इतिहास", "Patient History")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{patientPhone}</div>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {!patientPhone ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Please enter a patient phone number</div>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>⏳ Loading patient data...</div>
          ) : !patient ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>Patient not found</div>
          ) : (
            <>
              {/* Patient Card */}
              <div style={{ background: `linear-gradient(135deg,${C.primary},#0F4C7A)`, borderRadius: 16, padding: 16, marginBottom: 16, color: "white" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{patient.name}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                  📞 {patient.phone} · {patient.age || "—"} yrs · {patient.gender || "—"}
                </div>
                {patient.village && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>📍 {patient.village}</div>}
                {patient.conditions && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>⚕️ {patient.conditions.join(", ")}</div>}
              </div>

              {/* Section Tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
                {[
                  { id: "overview", label: "Overview", icon: "📊" },
                  { id: "visits", label: `Visits (${visits.length})`, icon: "🏠" },
                  { id: "blood-tests", label: `Tests (${bloodTests.length})`, icon: "🩸" },
                  { id: "vitals", label: `Vitals (${vitalSigns.length})`, icon: "🫀" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveSection(tab.id as typeof activeSection)}
                    style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, background: activeSection === tab.id ? C.primary : C.bg, color: activeSection === tab.id ? "white" : C.text }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeSection === "overview" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Total Visits", val: visits.length, icon: "🏠", color: C.primary },
                      { label: "Blood Tests", val: bloodTests.length, icon: "🩸", color: C.red },
                      { label: "Vital Records", val: vitalSigns.length, icon: "🫀", color: C.green },
                      { label: "Critical Tests", val: bloodTests.filter(t => t.isCritical).length, icon: "⚠️", color: C.yellow },
                    ].map((s, i) => (
                      <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {bloodTests.filter(t => t.isCritical).length > 0 && (
                    <div style={{ background: "#FEF9E7", border: "1px solid #F4D03F", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#7D6608" }}>⚠️ Critical Test Results Detected</div>
                      <div style={{ fontSize: 12, color: "#7D6608", marginTop: 4 }}>
                        {bloodTests.filter(t => t.isCritical).length} test(s) require immediate attention
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visits */}
              {activeSection === "visits" && (
                <div>
                  {visits.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 20px", color: C.muted }}>No visits recorded</div>
                  ) : (
                    visits.map((v, i) => (
                      <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>🏠 Visit</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{v.visitDate || new Date(v.createdAt).toLocaleDateString()}</div>
                        </div>
                        {v.notes && <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>{v.notes}</div>}
                        {v.appLearned && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>✅ App onboarding completed</div>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Blood Tests */}
              {activeSection === "blood-tests" && (
                <div>
                  {bloodTests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 20px", color: C.muted }}>No blood tests recorded</div>
                  ) : (
                    bloodTests.map((t, i) => (
                      <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${t.isCritical ? C.yellow : C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>🩸 {t.testType}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: t.isCritical ? C.red : C.green, marginTop: 4 }}>{t.result}</div>
                          </div>
                          {t.isCritical && (
                            <span style={{ background: "#FDEDED", color: C.red, padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>⚠️ CRITICAL</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                          👤 Patient: {t.patientName || patient?.name} · 📅 {new Date(t.testDate).toLocaleDateString()}
                          {t.labName && ` · 🏥 ${t.labName}`}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          👩‍⚕️ Submitted by: {t.submittedByName}
                        </div>
                        {t.reviewedNotes && (
                          <div style={{ fontSize: 12, color: C.primary, marginTop: 6, background: "#EBF4FD", padding: "8px 10px", borderRadius: 8 }}>
                            👨‍⚕️ Doctor: {t.reviewedNotes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Vital Signs */}
              {activeSection === "vitals" && (
                <div>
                  {vitalSigns.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 20px", color: C.muted }}>No vital signs recorded</div>
                  ) : (
                    vitalSigns.map((v, i) => (
                      <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>👤 Patient: {v.patientName || patient?.name} · 📅 {new Date(v.recordedAt).toLocaleDateString()}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>👩‍⚕️ Recorded by: {v.recordedByName}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {v.bpSystolic && v.bpDiastolic && <div style={{ fontSize: 13 }}>❤️ BP: <b>{v.bpSystolic}/{v.bpDiastolic}</b> mmHg</div>}
                          {v.heartRate && <div style={{ fontSize: 13 }}>💓 HR: <b>{v.heartRate}</b> bpm</div>}
                          {v.temperature && <div style={{ fontSize: 13 }}>🌡️ Temp: <b>{v.temperature}</b>°F</div>}
                          {v.spo2 && <div style={{ fontSize: 13 }}>🫁 SpO2: <b>{v.spo2}</b>%</div>}
                          {v.weight && <div style={{ fontSize: 13 }}>⚖️ Wt: <b>{v.weight}</b> kg</div>}
                          {v.randomBloodSugar && <div style={{ fontSize: 13 }}>🩸 RBS: <b>{v.randomBloodSugar}</b> mg/dL</div>}
                        </div>
                        {v.notes && <div style={{ fontSize: 12, color: C.text, marginTop: 8, lineHeight: 1.5 }}>{v.notes}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ASHAPatientHistoryPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>⏳</div>}>
      <PatientHistoryContent />
    </Suspense>
  );
}
