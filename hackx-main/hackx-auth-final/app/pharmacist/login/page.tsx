"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLang } from "@/lib/useLang";

const C = {
  primary: "#E67E22", primaryDark: "#D35400", green: "#1E8449",
  bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93",
  border: "#DDE3EC", red: "#C0392B", orange: "#E67E22",
};

type Screen = "login" | "register_phone" | "register_otp" | "register_details" | "forgot_password" | "reset_password";

export default function PharmacistLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { lang, setLang, mounted } = useLang();

  const [screen, setScreen] = useState<Screen>("login");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Registration state
  const [regPhone, setRegPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [reg, setReg] = useState({
    name: "", storeName: "", village: "", district: "Nabha",
    address: "", licenseNumber: "", type: "Private", distanceKm: "",
    email: "", ownerAge: "", qualification: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot password state
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRef4 = useRef<HTMLInputElement>(null);
  const otpRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "pharmacist") {
      router.replace("/pharmacist/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  if (!mounted) return null;

  // ─── HANDLERS ───────────────────────────────────────────

  const handleLogin = async () => {
    if (loginPhone.length !== 10) { setError(T("10 अंक का नंबर दर्ज करें", "Enter valid 10-digit number")); return; }
    if (!loginPassword) { setError(T("पासवर्ड दर्ज करें", "Enter your password")); return; }
    setError(""); setLoading(true);
    const res = await signIn("pharmacist-credentials", { phone: loginPhone, password: loginPassword, redirect: false });
    if (res?.ok) {
      // Always set a minimal localStorage entry first so dashboard never bounces
      localStorage.setItem("pharmacist", JSON.stringify({ phone: loginPhone, name: "", storeName: "", village: "", district: "", address: "", type: "Private", distanceKm: "", licenseNumber: "", stock: [] }));
      // Then try to enrich it with real data from DB
      try {
        const data = await fetch(`/api/pharmacist?phone=${loginPhone}`).then(r => r.json());
        if (data.pharmacist) {
          localStorage.setItem("pharmacist", JSON.stringify(data.pharmacist));
        }
      } catch {}
      router.replace("/pharmacist/dashboard");
    } else {
      setError(T("नंबर या पासवर्ड गलत है", "Incorrect phone number or password"));
    }
    setLoading(false);
  };

  const sendOtp = async () => {
    if (regPhone.length !== 10) { setError(T("10 अंक का नंबर दर्ज करें", "Enter valid 10-digit number")); return; }
    try {
      const check = await fetch(`/api/pharmacist?phone=${regPhone}`);
      const data = await check.json();
      if (data.pharmacist) {
        setError(T("यह नंबर पहले से रजिस्टर है। लॉगिन करें।", "This number is already registered. Please login.")); return;
      }
    } catch {}
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || T("OTP नहीं भेज सका", "Could not send OTP")); setLoading(false); return; }
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(code);
    }
    setLoading(false); setScreen("register_otp"); setTimer(30);
  };

  const verifyOtp = async () => {
    const entered = otp.join("");
    if (entered.length !== 6) { setError(T("6 अंक का OTP दर्ज करें", "Enter 6-digit OTP")); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone, otp: entered }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || T("OTP गलत है", "Incorrect OTP")); setLoading(false); return; }
    } catch {
      if (entered !== devOtp) { setError(T("OTP गलत है", "Incorrect OTP")); setLoading(false); return; }
    }
    setLoading(false); setScreen("register_details");
  };

  const handleRegister = async () => {
    if (!reg.name || !reg.storeName || !reg.village) {
      setError(T("नाम, दुकान और गाँव ज़रूरी है", "Name, store and village are required")); return;
    }
    if (!reg.licenseNumber) {
      setError(T("लाइसेंस नंबर ज़रूरी है", "License number is required")); return;
    }
    if (!password || password.length < 6) {
      setError(T("कम से कम 6 अक्षर का पासवर्ड चुनें", "Choose a password with at least 6 characters")); return;
    }
    if (password !== password2) {
      setError(T("पासवर्ड मेल नहीं खाता", "Passwords do not match")); return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pharmacist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone, password, ...reg, stock: [] }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      const signInRes = await signIn("pharmacist-credentials", { phone: regPhone, password, redirect: false });
      if (signInRes?.ok) {
        try {
          const d = await fetch(`/api/pharmacist?phone=${regPhone}`).then(r => r.json());
          if (d.pharmacist) localStorage.setItem("pharmacist", JSON.stringify(d.pharmacist));
        } catch {}
        router.replace("/pharmacist/dashboard");
      } else {
        setError(T("रजिस्ट्रेशन हुआ! अब लॉगिन करें।", "Registered! Please login now."));
        setScreen("login"); setLoginPhone(regPhone);
      }
    } catch {
      setError(T("कुछ गलत हुआ", "Something went wrong"));
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (loginPhone.length !== 10) { setError(T("10 अंक का नंबर दर्ज करें", "Enter valid 10-digit number")); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      if (data.devOtp) setDevOtp(data.devOtp);
      setScreen("reset_password");
      setTimer(60);
    } catch {
      setError(T("नेटवर्क त्रुटि", "Network error"));
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setError("");
    const entered = otp.join("");
    if (entered.length !== 6) { setError(T("6 अंक का OTP दर्ज करें", "Enter 6-digit OTP")); return; }
    if (newPassword.length < 6) { setError(T("कम से कम 6 अक्षर का पासवर्ड चुनें", "Choose a password with at least 6 characters")); return; }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginPhone, role: "pharmacist", otp: entered, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setScreen("login");
        setLoginPassword("");
        setNewPassword("");
        setOtp(["", "", "", "", "", ""]);
        alert(T("पासवर्ड सफलतापूर्वक बदल दिया गया!", "Password reset successfully!"));
      } else {
        setError(data.error || T("पासवर्ड रीसेट विफल", "Password reset failed"));
      }
    } catch {
      setError(T("नेटवर्क त्रुटि", "Network error"));
    }
    setLoading(false);
  };

  const handleOtpKey = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs[idx + 1].current?.focus();
    if (!val && idx > 0) otpRefs[idx - 1].current?.focus();
  };

  // ─── SHARED STYLES ──────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", border: `2px solid ${C.border}`,
    borderRadius: 12, fontSize: 15, fontFamily: "inherit", background: C.card,
    color: C.text, outline: "none", boxSizing: "border-box",
  };
  const btnPrimary: React.CSSProperties = {
    width: "100%", marginTop: 16, padding: 17, borderRadius: 14, border: "none",
    cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 16,
    background: loading ? "#ccc" : `linear-gradient(135deg,${C.orange},${C.primaryDark})`,
    color: "white",
  };
  const btnOutline: React.CSSProperties = {
    width: "100%", padding: 14, borderRadius: 14, border: `2px solid ${C.border}`,
    background: C.card, color: C.orange, fontWeight: 700, fontSize: 14, cursor: "pointer",
  };

  const Header = ({ title, sub, onBack }: { title: string; sub: string; onBack?: () => void }) => (
    <div style={{ background: `linear-gradient(135deg,${C.orange},${C.primaryDark})`, padding: "56px 24px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: .06, pointerEvents: "none" }}>💊</div>
      {onBack && (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, color: "white", padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
          ← {T("वापस", "Back")}
        </button>
      )}
      <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>🏪</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 8 }}>{sub}</p>
    </div>
  );

  const ErrorBox = () => error ? (
    <div style={{ background: "#FDEDED", border: "1px solid #F1948A", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red, fontWeight: 600 }}>⚠ {error}</div>
  ) : null;

  const wrap = (children: React.ReactNode) => (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );

  // ─── SCREEN: LOGIN ───────────────────────────────────────

  if (screen === "login" || screen === "forgot_password" || screen === "register_otp" || screen === "reset_password") return wrap(<>
    <div style={{ padding: "60px 24px" }}>
      <ErrorBox />
      {screen === "login" && (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>{T("लॉगिन", "Login")}</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>{T("दवा दुकान मैनेजमेंट के लिए", "For medicine store management")}</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8, display: "block" }}>📱 {T("मोबाइल नंबर", "Mobile Number")}</label>
            <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
              <span style={{ padding: "13px", background: C.bg, fontSize: 15, fontWeight: 700, color: C.muted, borderRight: `2px solid ${C.border}` }}>+91</span>
              <input style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontWeight: 700, padding: "13px", background: "transparent", color: C.text, letterSpacing: 1 }} type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} disabled={loading} placeholder="0000000000" />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block" }}>
                🔐 {T("पासवर्ड", "Password")}
              </label>
              <button type="button" onClick={() => { setScreen("forgot_password"); setError(""); setTimer(0); setDevOtp(""); }} style={{ background: "none", border: "none", padding: 0, color: C.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                {T("भूल गए?", "Forgot?")}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input style={inputStyle} type={showLoginPwd ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={loading} placeholder="••••••••" />
              <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)} style={{ position: "absolute", right: 16, top: 12, background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
                {showLoginPwd ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                )}
              </button>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading} style={btnPrimary}>{loading ? "..." : T("लॉगिन करें", "Login")}</button>
          <div style={{ textAlign: "center", marginTop: 24, color: C.muted, fontSize: 14 }}>
            {T("नया अकाउंट?", "Don't have an account?")} <button onClick={() => setScreen("register_phone")} style={{ background: "none", border: "none", color: C.primary, fontWeight: 700, cursor: "pointer" }}>{T("रजिस्टर करें", "Register")}</button>
          </div>
        </>
      )}

      {/* ── FORGOT PASSWORD (PHONE) ──────────────────────── */}
      {screen === "forgot_password" && (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>{T("पासवर्ड रीसेट", "Reset Password")}</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.4 }}>
            {T("अपना मोबाइल नंबर दर्ज करें।", "Enter your mobile number.")}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6, display: "block" }}>📱 {T("मोबाइल नंबर", "Mobile Number")}</label>
            <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
              <span style={{ padding: "13px", background: C.bg, fontSize: 15, fontWeight: 700, color: C.muted, borderRight: `2px solid ${C.border}` }}>+91</span>
              <input style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontWeight: 700, padding: "13px", background: "transparent", color: C.text, letterSpacing: 1 }} type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} disabled={loading} placeholder="0000000000" />
            </div>
          </div>

          <button onClick={handleForgotPassword} disabled={loading || loginPhone.length !== 10} style={{ ...btnPrimary, opacity: (loading || loginPhone.length !== 10) ? 0.6 : 1 }}>
            {loading ? "..." : T("OTP भेजें", "Send OTP")}
          </button>

          <button onClick={() => { setScreen("login"); setError(""); }} disabled={loading} style={{ ...btnOutline, border: "none", marginTop: 10 }}>
            ← {T("वापस लॉगिन पर जाएं", "Back to Login")}
          </button>
        </>
      )}

      {/* ── REGISTER: OTP / RESET PASSWORD ────────────────────────────── */}
      {(screen === "register_otp" || screen === "reset_password") && (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {screen === "reset_password" ? T("पासवर्ड रीसेट", "Reset Password") : T("सत्यापन", "Verification")}
          </h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.4 }}>
            {T(`+91 ${screen === "reset_password" ? loginPhone : regPhone} पर OTP भेजा गया`, `OTP sent to +91 ${screen === "reset_password" ? loginPhone : regPhone}`)}
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginBottom: 24 }}>
            {otp.map((d, i) => (
              <input key={i} ref={otpRefs[i]} style={{ width: 45, height: 55, borderRadius: 12, border: `2px solid ${d ? C.primary : C.border}`, background: C.card, textAlign: "center", fontSize: 22, fontWeight: 800, color: C.text, outline: "none" }} type="tel" maxLength={1} value={d} onChange={e => handleOtpKey(e.target.value, i)} onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs[i - 1].current?.focus(); }} disabled={loading} />
            ))}
          </div>

          {devOtp && (
            <div style={{ background: "#FEF9E7", borderRadius: 10, padding: "10px", marginBottom: 14, border: "1px solid #F4D03F", fontSize: 13, color: "#7D6608", textAlign: "center" }}>
              🛠 Dev mode — OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {screen === "reset_password" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6, display: "block" }}>🔐 {T("नया पासवर्ड", "New Password")}</label>
              <div style={{ position: "relative" }}>
                <input style={inputStyle} type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={loading} placeholder={T("नया पासवर्ड दर्ज करें", "Enter new password")} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: 16, top: 12, background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <button onClick={screen === "reset_password" ? handleResetPassword : verifyOtp} disabled={loading || otp.join("").length !== 6 || (screen === "reset_password" && newPassword.length < 6)} style={{ ...btnPrimary, opacity: (loading || otp.join("").length !== 6) ? 0.6 : 1 }}>
            {loading ? "..." : `✓ ${screen === "reset_password" ? T("पासवर्ड बदलें", "Reset Password") : T("सत्यापित करें", "Verify & Continue")}`}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            {timer > 0 ? (
              <p style={{ fontSize: 13, color: C.muted }}>{T(`${timer}s में पुनः भेजें`, `Resend in ${timer}s`)}</p>
            ) : (
              <button onClick={screen === "reset_password" ? handleForgotPassword : sendOtp} disabled={loading} style={{ background: "none", border: "none", color: C.primary, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                🔄 {T("OTP पुनः भेजें", "Resend OTP")}
              </button>
            )}
          </div>

          <button onClick={() => { setScreen(screen === "reset_password" ? "login" : "register_phone"); setOtp(["", "", "", "", "", ""]); setError(""); }} disabled={loading} style={{ ...btnOutline, border: "none", marginTop: 10 }}>
            ← {T("पीछे जाएँ", "Go Back")}
          </button>
        </>
      )}
    </div>
  </>);

  // ─── SCREEN: REGISTER — PHONE ────────────────────────────

  if (screen === "register_phone") return wrap(<>
    <Header
      title={T("नया रजिस्ट्रेशन", "New Registration")}
      sub={T("OTP से नंबर सत्यापित करें", "Verify your number with OTP")}
      onBack={() => { setScreen("login"); setError(""); setRegPhone(""); }}
    />
    <div style={{ flex: 1, padding: "28px 20px" }}>
      <ErrorBox />

      <div style={{ background: "rgba(230,126,34,.08)", border: "1px solid rgba(230,126,34,.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#8a4a00" }}>
        ℹ️ {T("रजिस्ट्रेशन के लिए OTP सत्यापन ज़रूरी है", "OTP verification is required for registration")}
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>📱 {T("मोबाइल नंबर", "Mobile Number")}</label>
      <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.card }}>
        <div style={{ background: C.bg, padding: "0 16px", display: "flex", alignItems: "center", borderRight: `2px solid ${C.border}`, fontSize: 15, fontWeight: 700, color: C.muted }}>+91</div>
        <input style={{ flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 700, padding: "14px", background: "transparent", color: C.text, letterSpacing: 1 }}
          type="tel" inputMode="numeric" value={regPhone}
          onChange={e => { setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
          placeholder="98765 00001" autoFocus />
      </div>

      <button onClick={sendOtp} disabled={loading || regPhone.length !== 10} style={btnPrimary}>
        {loading ? "..." : `📲 ${T("OTP भेजें", "Send OTP")} →`}
      </button>

      <div style={{ height: 1, background: C.border, margin: "24px 0" }} />
      <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 12 }}>
        {T("पहले से खाता है?", "Already have an account?")}
      </p>
      <button onClick={() => { setScreen("login"); setError(""); }} style={btnOutline}>
        → {T("लॉगिन करें", "Login")}
      </button>
    </div>
  </>);

  // ─── SCREEN: REGISTER — DETAILS ──────────────────────────

  const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <div style={{ background: "rgba(230,126,34,.07)", borderRadius: 12, padding: "12px 14px", margin: "20px 0 16px", fontSize: 12, fontWeight: 700, color: C.orange }}>
      {icon} {title}
    </div>
  );

  return wrap(<>
    <Header
      title={T("दुकान रजिस्टर करें", "Register Your Store")}
      sub={`+91 ${regPhone} ✓ ${T("सत्यापित", "Verified")}`}
      onBack={() => { setScreen("register_otp"); setError(""); }}
    />
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px" }}>
      <ErrorBox />

      <SectionHeader icon="👤" title={T("व्यक्तिगत जानकारी", "Personal Information")} />
      {[
        { key: "name",          label: T("👤 आपका पूरा नाम *", "👤 Full Name *"),          ph: T("राजेश कुमार", "Rajesh Kumar"),         type: "text"   },
        { key: "ownerAge",      label: T("🎂 आयु", "🎂 Age"),                              ph: "35",                                     type: "number" },
        { key: "qualification", label: T("🎓 योग्यता", "🎓 Qualification"),                ph: "B.Pharma / D.Pharma",                    type: "text"   },
        { key: "email",         label: T("📧 ईमेल (वैकल्पिक)", "📧 Email (optional)"),     ph: "pharmacist@example.com",                 type: "email"  },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
          <input style={inputStyle} type={f.type} placeholder={f.ph}
            value={reg[f.key as keyof typeof reg]}
            onChange={e => { setReg({ ...reg, [f.key]: e.target.value }); setError(""); }} />
        </div>
      ))}

      <SectionHeader icon="🏪" title={T("दुकान की जानकारी", "Store Information")} />
      {[
        { key: "storeName",     label: T("🏪 दुकान का नाम *", "🏪 Store Name *"),        ph: T("राजेश मेडिकल स्टोर", "Rajesh Medical Store"), type: "text"   },
        { key: "licenseNumber", label: T("📋 लाइसेंस नंबर *", "📋 License Number *"),    ph: "PH/2024/001",                                   type: "text"   },
        { key: "village",       label: T("🏘️ गाँव / क्षेत्र *", "🏘️ Village / Area *"),  ph: T("केसरी", "Kesri"),                              type: "text"   },
        { key: "district",      label: T("📍 जिला", "📍 District"),                      ph: "Nabha",                                         type: "text"   },
        { key: "address",       label: T("🗺️ पूरा पता", "🗺️ Full Address"),              ph: T("मेन मार्केट, नाभा", "Main Market, Nabha"),     type: "text"   },
        { key: "distanceKm",    label: T("📏 PHC से दूरी (km)", "📏 Distance from PHC"),  ph: "2.5",                                           type: "number" },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
          <input style={inputStyle} type={f.type} placeholder={f.ph}
            value={reg[f.key as keyof typeof reg]}
            onChange={e => { setReg({ ...reg, [f.key]: e.target.value }); setError(""); }} />
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>{T("🏷️ दुकान का प्रकार", "🏷️ Store Type")}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "Private", l: T("प्राइवेट", "Private"), e: "🏪" }, { v: "Jan Aushadhi", l: "Jan Aushadhi", e: "🏛️" }, { v: "Govt Free", l: T("सरकारी", "Govt Free"), e: "🏥" }].map(g => (
            <button key={g.v} onClick={() => setReg({ ...reg, type: g.v })}
              style={{ flex: 1, padding: "12px 6px", borderRadius: 12, border: `2px solid ${reg.type === g.v ? C.orange : C.border}`, background: reg.type === g.v ? "#FEF3E8" : C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: reg.type === g.v ? C.orange : C.text }}>
              {g.e}<br /><span style={{ fontSize: 10 }}>{g.l}</span>
            </button>
          ))}
        </div>
      </div>

      <SectionHeader icon="🔒" title={T("लॉगिन सुरक्षा", "Login Security")} />

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{T("🔒 पासवर्ड बनाएं *", "🔒 Create Password *")}</label>
        <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
          <input style={{ flex: 1, border: "none", outline: "none", padding: "13px 16px", fontSize: 15, fontFamily: "inherit", background: "transparent", color: C.text }}
            type={showRegPwd ? "text" : "password"} placeholder="••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }} />
          <button type="button" onClick={() => setShowRegPwd(s => !s)} style={{ background: "none", border: "none", padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center", color: C.muted }}>
            {showRegPwd ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
            )}
          </button>
        </div>
        {password && (
          <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
            {[
              { l: "6+ chars", ok: password.length >= 6 },
              { l: "Uppercase", ok: /[A-Z]/.test(password) },
              { l: "Number", ok: /\d/.test(password) },
            ].map(r => (
              <span key={r.l} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: r.ok ? "#D5F5E3" : "#FDEDED", color: r.ok ? "#1E8449" : C.red }}>
                {r.ok ? "✓" : "✗"} {r.l}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{T("🔒 पासवर्ड दोबारा दर्ज करें *", "🔒 Confirm Password *")}</label>
        <div style={{ display: "flex", border: `2px solid ${password2 && password !== password2 ? C.red : C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
          <input style={{ flex: 1, border: "none", outline: "none", padding: "13px 16px", fontSize: 15, fontFamily: "inherit", background: "transparent", color: C.text }}
            type={showRegPwd ? "text" : "password"} placeholder="••••••••" value={password2}
            onChange={e => { setPassword2(e.target.value); setError(""); }} />
        </div>
        {password2 && password !== password2 && (
          <p style={{ fontSize: 11, color: C.red, marginTop: 4, fontWeight: 600 }}>⚠ {T("पासवर्ड मेल नहीं खाता", "Passwords do not match")}</p>
        )}
        {password2 && password === password2 && password2.length > 0 && (
          <p style={{ fontSize: 11, color: C.green, marginTop: 4, fontWeight: 600 }}>✓ {T("पासवर्ड मेल खाता है", "Passwords match")}</p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16 }}>
        <input
          type="checkbox"
          id="accept-terms"
          checked={acceptTerms}
          onChange={e => setAcceptTerms(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer", marginTop: 2 }}
        />
        <label htmlFor="accept-terms" style={{ fontSize: 12, color: C.text, cursor: "pointer", lineHeight: 1.4 }}>
          {T("मैं नियम और शर्तों को स्वीकार करता हूँ। ", "I accept the ")}
          <a href="/terms?closeable=true" target="_blank" rel="noopener noreferrer" style={{ color: C.primary, fontWeight: 700, textDecoration: "underline" }}>
            {T("नियम और शर्तें पढ़ें", "Terms & Conditions")}
          </a>
        </label>
      </div>

      <button onClick={handleRegister} disabled={loading || !acceptTerms} style={{ ...btnPrimary, background: (loading || !acceptTerms) ? "#ccc" : btnPrimary.background, cursor: (loading || !acceptTerms) ? "not-allowed" : "pointer" }}>
        {loading ? "..." : `✓ ${T("दुकान रजिस्टर करें", "Register Store")}`}
      </button>
    </div>
  </>);
}
