आरोग्य एआई — स्वास्थ्य सेवा (Aarogya AI — Health Service)🏥 

> AI-Powered Rural Telemedicine · ग्रामीण टेलीमेडिसिन · Offline-First PWA

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local` and fill in your values:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sehat-setu
NEXTAUTH_SECRET=your-secret-here
GROQ_API_KEY=your-groq-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials
| Role | Credential |
|------|-----------|
| Patient | Phone: **9876501001** (Ramkali Devi) |
| Doctor | **doctor@sehat.com** / **doctor123** |
| ASHA Worker | Phone: **9876502001** (Priya Sharma) |

---

## 📱 App Screens

| Screen | Path | Description |
|--------|------|-------------|
| Splash | `/` | Language selection (Hindi/English) |
| Login | `/login` | Patient phone login + registration |
| Home | `/home` | Patient dashboard |
| Symptoms | `/symptoms` | 16-icon tap-based symptom checker |
| AI Triage | `/triage` | Groq AI triage result (RED/YELLOW/GREEN) |
| Confirm | `/confirm` | Appointment booking confirmation |
| Records | `/records` | Patient health history |
| Medicine | `/medicine` | Find medicine at nearby pharmacies |
| Doctor Login | `/doctor/login` | Doctor authentication |
| Doctor Dashboard | `/doctor/dashboard` | Patient queue sorted by urgency |
| Consultation | `/doctor/consultation/[id]` | Patient detail + notes + prescription |
| ASHA Dashboard | `/asha/dashboard` | Village patient list |
| SOS | `/asha/sos` | Emergency broadcast to hospital |
| Log Visit | `/asha/log-visit` | Record patient home visit |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI Engine**: Groq LLaMA (llama-3.3-70b-versatile) via `/api/triage`
- **Database**: MongoDB Atlas via Mongoose
- **Offline**: Dexie.js (IndexedDB) + next-pwa (Service Worker)
- **Maps**: Leaflet / react-leaflet
- **Auth**: NextAuth.js (3 roles: patient, doctor, ashaworker)

---

## 🌐 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/triage` | Groq AI symptom triage |
| GET/POST | `/api/patients` | Patient CRUD |
| GET/POST | `/api/consultations` | Consultation queue (RED first) |
| POST | `/api/sos` | SOS alert broadcast |
| GET | `/api/medicines/search` | Find medicine at pharmacies |
| GET/POST | `/api/asha/visits` | ASHA visit logs |
| POST | `/api/sync` | Bulk offline sync |

---

## 📦 Offline Architecture

```
User taps symptoms → /api/triage (if online) → Groq AI result
                  ↓ (if offline)
             IndexedDB fallback triage
                  ↓
             Sync queue → auto-sync when online
```

- Medicines pre-seeded in IndexedDB on first install
- All consultations / visits / SOS saved locally if offline
- Background sync via Service Worker + manual "Sync Now" button

---

## 🎯 The Core Mission

> A rural patient with no internet must tap symptom icons and get a life-saving triage result in Hindi within 3 seconds.

---

## 🏗 Next Steps (from your roadmap)

- [ ] NextAuth role-based sessions
- [ ] Real Leaflet map integration  
- [ ] 10-second auto-refresh polling on Doctor Dashboard
- [ ] QR code for live Vercel URL
- [ ] Error boundaries + loading skeletons
- [ ] Touch target audit (min 48×48px)
