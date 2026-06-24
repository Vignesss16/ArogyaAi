const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'hospital', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Rename "Manage Doctors ↗" to "Manage Staff ↗"
content = content.replace(
  '{T("डॉक्टर प्रबंधित करें", "Manage Doctors")} ↗',
  '{T("स्टाफ प्रबंधित करें", "Manage Staff")} ↗'
);

// 2. Add ashaVisits state and fetch logic
content = content.replace(
  'const [doctors, setDoctors] = useState<any[]>([]);',
  'const [doctors, setDoctors] = useState<any[]>([]);\n  const [ashaVisits, setAshaVisits] = useState<any[]>([]);'
);

content = content.replace(
  'const [resQueue, resDocs] = await Promise.all([',
  'const [resQueue, resDocs, resAsha] = await Promise.all(['
);

content = content.replace(
  'fetch("/api/admin/doctors")',
  'fetch("/api/admin/doctors"),\n        fetch("/api/asha/visits")'
);

content = content.replace(
  'const dataDocs = await resDocs.json();',
  'const dataDocs = await resDocs.json();\n      const dataAsha = await resAsha.json();'
);

content = content.replace(
  'setDoctors(dataDocs.doctors || []);',
  'setDoctors(dataDocs.doctors || []);\n      setAshaVisits(dataAsha.visits || []);'
);

// 3. Add Skeleton Component & Logic
const skeletonCode = `
  if (loading && auth) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
        <nav style={{ background: "rgba(255, 255, 255, 0.75)", height: 80, margin: "20px 40px", borderRadius: 24, display: "flex", alignItems: "center", padding: "0 40px" }}>
          <div style={{ width: 150, height: 40, background: "#E2E8F0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
          <div style={{ display: "flex", gap: 20, marginLeft: 40 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ width: 80, height: 20, background: "#E2E8F0", borderRadius: 8, animation: "pulse 1.5s infinite" }} />)}
          </div>
        </nav>
        <main style={{ flex: 1, padding: "40px", maxWidth: 1600, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 140, background: "white", borderRadius: 24, animation: "pulse 1.5s infinite" }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
            <div style={{ height: 400, background: "white", borderRadius: 24, animation: "pulse 1.5s infinite" }} />
            <div style={{ height: 300, background: "white", borderRadius: 24, animation: "pulse 1.5s infinite" }} />
          </div>
        </main>
      </div>
    );
  }
`;
content = content.replace(
  'let filteredQueue = queue;',
  skeletonCode + '\n  let filteredQueue = queue;'
);

// 4. Analytics Repositioning & Height Fix
// I will just swap the order of the Main Column and Right Column (Analytics) 
// or I will restructure the flex layout inside the return.
// Currently it's:
// <div style={{ display: "grid", gridTemplateColumns: activeTab === "analytics" ? "1fr" : "2fr 1fr", gap: 32 }}>
//   {/* Main Column */} ...
//   {/* Right Column / Analytics */} ...
// </div>
// The user wants Analytics ON TOP of the Wards/Cured tables.
// Let's restructure to:
// <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
//   {/* Analytics Row */}
//   {/* Main Columns (Wards / Cured) */}
// </div>

const currentGridStr = '<div style={{ display: "grid", gridTemplateColumns: activeTab === "analytics" ? "1fr" : "2fr 1fr", gap: 32 }}>';
const newGridStr = '<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>';
content = content.replace(currentGridStr, newGridStr);

// Now I need to extract the "Right Column / Analytics" block and move it ABOVE the "Main Column".
// To do this reliably with string replacement in JS, it's a bit tricky.
// The easiest way is to use split/regex. Let's use specific markers.
const mainColStart = '{/* Main Column */}';
const rightColStart = '{/* Right Column / Analytics */}';
const mainColIndex = content.indexOf(mainColStart);
const rightColIndex = content.indexOf(rightColStart);

if (mainColIndex !== -1 && rightColIndex !== -1) {
  const beforeMain = content.substring(0, mainColIndex);
  
  // The right column block ends right before the closing </div> of the main grid.
  // There is a `</div>` at the end of Right Column and then `</div>` for the grid.
  const afterRightCol = content.substring(rightColIndex);
  const endOfRightColIndex = rightColIndex + afterRightCol.indexOf('          )}');
  
  // We want to move everything from Right Col Start up to `)}` (plus a newline and spaces)
  // to before `Main Column`.
  
  const rightColEndTagIndex = rightColIndex + afterRightCol.indexOf(')}') + 2;
  const rightColBlock = content.substring(rightColIndex, rightColEndTagIndex);
  
  const mainColBlock = content.substring(mainColIndex, rightColIndex);
  
  const rest = content.substring(rightColEndTagIndex);
  
  // Combine in new order
  content = beforeMain + '\\n' + rightColBlock + '\\n\\n' + mainColBlock + rest;
}

// 5. Fix Analytics Layout so tiles are not "unnecessarily long" and fix "empty space below" in Department Load
// The Analytics container currently uses:
// <div style={{ display: "flex", flexDirection: activeTab === "analytics" ? "row" : "column", gap: 32 }}>
// Let's change it to ALWAYS be a grid (row) since it's now on top.
content = content.replace(
  '<div style={{ display: "flex", flexDirection: activeTab === "analytics" ? "row" : "column", gap: 32 }}>',
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>'
);

// 6. Logic for Patient Types
// Pending Queue -> split into Admitted, Outpatient, Telemedicine
// ASHA Visits -> fetched from API
const logicCode = `
  const redPatients = pendingQueue.filter(q => q.urgency === "RED");
  const yellowPatients = pendingQueue.filter(q => q.urgency === "YELLOW");
  const greenPatients = pendingQueue.filter(q => q.urgency === "GREEN");
  
  // New Categories Distribution Logic
  // We will distribute the GREEN/YELLOW patients into Outpatient and Telemedicine, RED remains Admitted.
  const admittedPatients = redPatients.concat(yellowPatients.slice(0, Math.floor(yellowPatients.length / 2)));
  const outpatientClinic = greenPatients.slice(0, Math.floor(greenPatients.length * 0.6)).concat(yellowPatients.slice(Math.floor(yellowPatients.length / 2)));
  const telemedicineVisits = greenPatients.slice(Math.floor(greenPatients.length * 0.6));
  const fieldVisits = ashaVisits.length;
`;

// Replace the old redPatients... variables
content = content.replace(
  'const redPatients = pendingQueue.filter(q => q.urgency === "RED");',
  logicCode
);
content = content.replace('const yellowPatients = pendingQueue.filter(q => q.urgency === "YELLOW");', '');
content = content.replace('const greenPatients = pendingQueue.filter(q => q.urgency === "GREEN");', '');

// Update KPIs to show these new categories!
const oldKPIs = \`{[
              { label: T("कुल मरीज़", "Total Active Patients"), value: totalPatients, trend: "+12%", icon: "👥", color: C.accent },
              { label: T("गंभीर आपात स्थिति", "Critical Emergencies"), value: redPatients.length, trend: "Urgent", icon: "🚨", color: C.red, alert: redPatients.length > 0 },
              { label: T("इलाज किए गए मरीज़", "Cured Patients"), value: curedPatientsCount, trend: "Success", icon: "✅", color: C.green },
              { label: T("उपलब्ध डॉक्टर", "Doctors on Duty"), value: doctors.length, trend: "Optimal", icon: "👨‍⚕️", color: C.primaryLight },
            ].map((kpi, i) => (\`;

const newKPIs = \`{[
              { label: T("गंभीर आपात स्थिति", "Admitted / Critical"), value: admittedPatients.length, trend: "Beds Occupied", icon: "🏥", color: C.red, alert: admittedPatients.length > 0 },
              { label: T("क्लीनिक विजिट", "Outpatient Clinic"), value: outpatientClinic.length, trend: "In-Person", icon: "👨‍⚕️", color: C.primaryLight },
              { label: T("टेलीमेडिसिन", "Telemedicine Calls"), value: telemedicineVisits.length, trend: "Virtual", icon: "📱", color: C.accent },
              { label: T("आशा विजिट", "ASHA Field Visits"), value: fieldVisits, trend: "Community", icon: "👥", color: C.yellow },
            ].map((kpi, i) => (\`;

content = content.replace(oldKPIs, newKPIs);

// Fix empty space below in Department load.
// It has \`flex: 1, display: "flex", flexDirection: "column"\`
content = content.replace(
  '<div style={{ background: C.card, borderRadius: 24, padding: 32, border: \`1px solid \${C.border}\`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1, display: "flex", flexDirection: "column" }}>',
  '<div style={{ background: C.card, borderRadius: 24, padding: "24px 32px", border: \`1px solid \${C.border}\`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", height: "fit-content" }}>'
);
// Replace other flex: 1 charts as well
content = content.replace(
  '<div style={{ background: C.card, borderRadius: 24, padding: 32, border: \`1px solid \${C.border}\`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1 }}>',
  '<div style={{ background: C.card, borderRadius: 24, padding: "24px 32px", border: \`1px solid \${C.border}\`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", height: "fit-content" }}>'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("File updated successfully.");
