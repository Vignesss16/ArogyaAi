"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [authError, setAuthError] = useState("");

  const [doctors, setDoctors] = useState<any[]>([]);
  const [ashaWorkers, setAshaWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsha, setLoadingAsha] = useState(false);

  // Doctor Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [specialization, setSpecialization] = useState("General Physician");
  const [hospital, setHospital] = useState("Nabha Civil Hospital");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asha Form state
  const [ashaName, setAshaName] = useState("");
  const [ashaPhone, setAshaPhone] = useState("");
  const [ashaPassword, setAshaPassword] = useState("");
  const [showAshaPassword, setShowAshaPassword] = useState(false);
  const [ashaVillages, setAshaVillages] = useState("");
  const [ashaFormError, setAshaFormError] = useState("");
  const [ashaFormSuccess, setAshaFormSuccess] = useState("");
  const [isSubmittingAsha, setIsSubmittingAsha] = useState(false);

  // Simple hardcoded auth for hackathon
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      fetchDoctors();
      fetchAshaWorkers();
    } else {
      setAuthError("Invalid admin password. Try 'admin123'");
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctors");
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error("Error fetching doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAshaWorkers = async () => {
    setLoadingAsha(true);
    try {
      const res = await fetch("/api/admin/ashaworkers");
      const data = await res.json();
      if (res.ok) {
        setAshaWorkers(data.workers);
      }
    } catch (err) {
      console.error("Error fetching ASHA workers", err);
    } finally {
      setLoadingAsha(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, specialization, hospital }),
      });
      const data = await res.json();

      if (res.ok) {
        setFormSuccess("Doctor account created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        // refresh list
        fetchDoctors();
      } else {
        setFormError(data.error || "Failed to create doctor");
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAsha = async (e: React.FormEvent) => {
    e.preventDefault();
    setAshaFormError("");
    setAshaFormSuccess("");
    setIsSubmittingAsha(true);

    try {
      const res = await fetch("/api/admin/ashaworkers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ashaName, phone: ashaPhone, password: ashaPassword, villages: ashaVillages }),
      });
      const data = await res.json();

      if (res.ok) {
        setAshaFormSuccess("ASHA Worker account created successfully!");
        setAshaName("");
        setAshaPhone("");
        setAshaPassword("");
        setAshaVillages("");
        fetchAshaWorkers();
      } else {
        setAshaFormError(data.error || "Failed to create ASHA worker");
      }
    } catch (err: any) {
      setAshaFormError(err.message || "An error occurred");
    } finally {
      setIsSubmittingAsha(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ background: "radial-gradient(circle at 80% 20%, rgb(17, 24, 39) 0%, rgb(30, 58, 138) 100%)", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Outfit, sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Animated Mesh Background Elements */}
        <div style={{ position: "absolute", width: 500, height: 500, background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)", top: "-10%", left: "-10%", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 600, height: 600, background: "radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)", bottom: "-20%", right: "-10%", borderRadius: "50%", filter: "blur(60px)" }} />
        
        <div style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "48px 24px", borderRadius: 24, width: "100%", maxWidth: 400, margin: "0 20px", boxSizing: "border-box", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", color: "white", width: 64, height: 64, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "bold", boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)" }}>🔐</div>
          </div>
          <h2 style={{ textAlign: "center", color: "white", marginBottom: 8, marginTop: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>Admin Portal</h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", marginBottom: 32, fontSize: 15 }}>Enter administrative password to continue</p>
          
          <form onSubmit={handleLogin}>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type={showAdminPass ? "text" : "password"}
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setAuthError(""); }}
                placeholder="Admin Password"
                style={{ width: "100%", padding: "16px 48px 16px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", fontSize: 16, boxSizing: "border-box", background: "rgba(0,0,0,0.2)", color: "white", outline: "none", transition: "all 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
              />
              <button 
                type="button"
                onClick={() => setShowAdminPass(!showAdminPass)}
                style={{ position: "absolute", right: 16, top: 16, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showAdminPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                )}
              </button>
            </div>
            {authError && <div style={{ color: "#FCA5A5", background: "rgba(239, 68, 68, 0.2)", padding: "12px", borderRadius: 8, fontSize: 14, marginBottom: 16, textAlign: "center", fontWeight: 600, border: "1px solid rgba(239, 68, 68, 0.4)" }}>{authError}</div>}
            <button type="submit" style={{ width: "100%", padding: "16px", background: "white", color: "#1E3A8A", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              Unlock Dashboard
            </button>
          </form>
          <button onClick={() => router.push("/")} style={{ width: "100%", padding: "12px", background: "transparent", color: "rgba(255,255,255,0.6)", border: "none", marginTop: 16, cursor: "pointer", fontWeight: 600 }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F8", padding: "40px 20px", fontFamily: "Outfit, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: 0, color: "#1A2332", fontSize: 28 }}>System Administration</h1>
            <p style={{ margin: "5px 0 0 0", color: "#6B7C93" }}>Manage healthcare personnel and system access</p>
          </div>
          <button onClick={() => router.push("/")} style={{ padding: "10px 20px", background: "white", border: "1px solid #DDE3EC", borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#1A2332" }}>
            Exit Admin
          </button>
        </div>

        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          
          {/* Create Doctor Form */}
          <div style={{ flex: "1 1 350px", background: "white", padding: 30, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "#1B6CA8", borderBottom: "1px solid #EBF4FD", paddingBottom: 10 }}>Register New Doctor</h2>
            
            {formSuccess && (
              <div style={{ background: "#E8F8EF", color: "#1E8449", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                ✓ {formSuccess}
              </div>
            )}
            
            {formError && (
              <div style={{ background: "#FDEDEC", color: "#C0392B", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateDoctor} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Ramesh Kumar" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Email Address (Login ID)</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@aarogyaai.org" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Secure Password</label>
                <div style={{ position: "relative" }}>
                  <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 10, background: "none", border: "none", color: "#6B7C93", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Specialization</label>
                <input required type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. General Physician" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Assigned Hospital</label>
                <input required type="text" value={hospital} onChange={e => setHospital(e.target.value)} placeholder="e.g. Nabha Civil Hospital" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={isSubmitting} style={{ marginTop: 10, padding: "12px", background: "#1B6CA8", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Creating..." : "+ Create Doctor Account"}
              </button>
            </form>
          </div>

          {/* List of Doctors */}
          <div style={{ flex: "1 1 500px", background: "white", padding: 30, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #EBF4FD", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#1A2332" }}>Active Doctors ({doctors.length})</h2>
              <button onClick={fetchDoctors} style={{ background: "transparent", border: "1px solid #DDE3EC", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#6B7C93" }}>Loading records...</div>
            ) : doctors.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", background: "#F5F8FA", borderRadius: 10, color: "#6B7C93" }}>
                No doctors registered yet. Create one using the panel on the left.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {doctors.map((doc: any) => (
                  <div key={doc._id} style={{ display: "flex", alignItems: "center", padding: "15px", border: "1px solid #DDE3EC", borderRadius: 10, background: "#FAFAFA" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EBF4FD", color: "#1B6CA8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, marginRight: 15 }}>
                      {doc.name.replace("Dr. ", "").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: 15, color: "#1A2332" }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7C93", marginTop: 2 }}>📧 {doc.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E8449", background: "#E8F8EF", padding: "2px 8px", borderRadius: 20, display: "inline-block", marginBottom: 4 }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7C93" }}>🏥 {doc.hospital}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 30 }}>
          
          {/* Create ASHA Worker Form */}
          <div style={{ flex: "1 1 350px", background: "white", padding: 30, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, color: "#E67E22", borderBottom: "1px solid #FEF5E7", paddingBottom: 10 }}>Register New ASHA Worker</h2>
            
            {ashaFormSuccess && (
              <div style={{ background: "#E8F8EF", color: "#1E8449", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                ✓ {ashaFormSuccess}
              </div>
            )}
            
            {ashaFormError && (
              <div style={{ background: "#FDEDEC", color: "#C0392B", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
                ⚠️ {ashaFormError}
              </div>
            )}

            <form onSubmit={handleCreateAsha} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Full Name</label>
                <input required type="text" value={ashaName} onChange={e => setAshaName(e.target.value)} placeholder="e.g. Sunita Devi" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Phone Number (Login ID)</label>
                <input required type="tel" value={ashaPhone} onChange={e => setAshaPhone(e.target.value)} placeholder="e.g. 9876543210" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Secure Password</label>
                <div style={{ position: "relative" }}>
                  <input required type={showAshaPassword ? "text" : "password"} value={ashaPassword} onChange={e => setAshaPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setShowAshaPassword(!showAshaPassword)} style={{ position: "absolute", right: 12, top: 10, background: "none", border: "none", color: "#6B7C93", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {showAshaPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#6B7C93" }}>Assigned Villages (comma separated)</label>
                <input required type="text" value={ashaVillages} onChange={e => setAshaVillages(e.target.value)} placeholder="e.g. Thuhi, Rohti" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #DDE3EC", boxSizing: "border-box" }} />
              </div>

              <button type="submit" disabled={isSubmittingAsha} style={{ marginTop: 10, padding: "12px", background: "#E67E22", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: isSubmittingAsha ? "not-allowed" : "pointer", opacity: isSubmittingAsha ? 0.7 : 1 }}>
                {isSubmittingAsha ? "Creating..." : "+ Create ASHA Worker"}
              </button>
            </form>
          </div>

          {/* List of ASHA Workers */}
          <div style={{ flex: "1 1 500px", background: "white", padding: 30, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #FEF5E7", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#1A2332" }}>Active ASHA Workers ({ashaWorkers.length})</h2>
              <button onClick={fetchAshaWorkers} style={{ background: "transparent", border: "1px solid #DDE3EC", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                ↻ Refresh
              </button>
            </div>

            {loadingAsha ? (
              <div style={{ padding: 40, textAlign: "center", color: "#6B7C93" }}>Loading records...</div>
            ) : ashaWorkers.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", background: "#F5F8FA", borderRadius: 10, color: "#6B7C93" }}>
                No ASHA workers registered yet. Create one using the panel on the left.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ashaWorkers.map((worker: any) => (
                  <div key={worker._id} style={{ display: "flex", alignItems: "center", padding: "15px", border: "1px solid #DDE3EC", borderRadius: 10, background: "#FAFAFA" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF5E7", color: "#E67E22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, marginRight: 15 }}>
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", fontSize: 15, color: "#1A2332" }}>{worker.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7C93", marginTop: 2 }}>📞 {worker.phone}</div>
                    </div>
                    <div style={{ textAlign: "right", maxWidth: 200 }}>
                      <div style={{ fontSize: 11, color: "#6B7C93" }}>Assigned Villages</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1E8449", background: "#E8F8EF", padding: "2px 8px", borderRadius: 20, display: "inline-block", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {worker.villages?.join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
