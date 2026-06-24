import { jsPDF } from 'jspdf';
export interface Consultation {
  _id: string;
  symptoms: string[];
  urgency: "RED" | "YELLOW" | "GREEN";
  triageResult: any;
  status: "pending" | "in-review" | "completed";
  doctorNotes?: string;
  prescription?: string;
  doctorName?: string;
  hospital?: string;
  slot?: string;
  queueNo?: string;
  uploadedRecords?: any[];
  createdAt: string;
}

export interface PatientInfo {
  name: string;
  gender: string;
  age: number | string;
  phone: string;
  bloodGroup: string;
  condition: string;
}

export const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
  RED:    { label: "Emergency",       color: "#C0392B", bg: "#FDEDEC" },
  YELLOW: { label: "Needs Attention", color: "#D68910", bg: "#FEF9E7" },
  GREEN:  { label: "Routine",         color: "#1E8449", bg: "#EAFAF1" },
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

export function getTitle(c: Consultation): string {
  if (c.triageResult?.conditionEn) return c.triageResult.conditionEn;
  if (c.symptoms?.length) {
    const s = c.symptoms.join(", ");
    const cfg = urgencyConfig[c.urgency];
    return cfg ? `${s.charAt(0).toUpperCase() + s.slice(1)} — ${cfg.label}` : s;
  }
  return "Consultation";
}

export function generatePDF(patient: PatientInfo, consultations: Consultation[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 0;
  let pageNum = 1;

  const addHeader = () => {
    y = 0;
    // Top contact bar
    doc.setFillColor(245, 248, 250);
    doc.rect(0, 0, pageWidth, 18, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Aarogya AI Healthcare | contact@aarogyaai.org | www.aarogyaai.org | +91-1800-XXX-XXXX", pageWidth / 2, 11, { align: "center" });

    // Main header with logo
    doc.setFillColor(27, 108, 168);
    doc.rect(0, 18, pageWidth, 22, "F");

    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 8, 29, 7, "F");
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.text("AA", margin + 8, 32, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AAROGYA AI", margin + 20, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 240);
    doc.text("AI-Powered Rural Healthcare Initiative", margin + 20, 35);

    // Report title on right
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("CLINICAL HANDOFF REPORT", pageWidth - margin, 28, { align: "right" });
    
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 240);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth - margin, 35, { align: "right" });

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 14, { align: "right" });

    y = 48;
  };

  const addFooter = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text("Aarogya AI Clinical Handoff Report | Confidential Medical Document | Authorized Personnel Only", pageWidth / 2, pageHeight - 15, { align: "center" });
    doc.text(`Page ${pageNum} | Generated on ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, pageHeight - 11, { align: "center" });
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      addFooter();
      doc.addPage();
      pageNum++;
      addHeader();
    }
  };

  const drawSectionHeader = (title: string, sectionNum: string) => {
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.setFillColor(235, 244, 253);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
    doc.text(`${sectionNum} ${title}`, margin + 4, y + 6);
    y += 12;
  };

  const drawSubsectionHeader = (title: string, num: string) => {
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text(`${num} ${title}`, margin + 2, y);
    y += 7;
    doc.setFont("helvetica", "normal");
  };

  const drawField = (label: string, value: string, indent: number = 0) => {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, margin + indent, y);
    
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(value || "N/A", margin + indent + 45, y);
    doc.setFont("helvetica", "normal");
    y += 6;
  };

  // ==================== COVER PAGE ====================
  // Centered title
  doc.setFillColor(27, 108, 168);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, pageHeight / 2 - 40, 25, "F");
  doc.setFontSize(24);
  doc.setTextColor(27, 108, 168);
  doc.text("AA", pageWidth / 2, pageHeight / 2 - 35, { align: "center" });
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("AAROGYA AI", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(200, 220, 240);
  doc.text("Clinical Handoff Report", pageWidth / 2, pageHeight / 2 + 18, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 220);
  doc.text("Confidential Medical Document", pageWidth / 2, pageHeight / 2 + 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(150, 170, 190);
  doc.text(`Patient: ${patient.name}`, pageWidth / 2, pageHeight / 2 + 45, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, pageWidth / 2, pageHeight / 2 + 53, { align: "center" });
  doc.text(`Report ID: AAR-${Date.now()}`, pageWidth / 2, pageHeight / 2 + 61, { align: "center" });

  doc.addPage();
  pageNum++;

  // ==================== MAIN CONTENT ====================
  addHeader();

  // SECTION I: PATIENT INFORMATION
  drawSectionHeader("Patient Information", "I.");

  // 1. Demographics
  drawSubsectionHeader("Demographics", "1.");
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, "F");
  y += 5;
  
  drawField("Patient Name", patient.name, margin + 5);
  drawField("Age", `${patient.age} years`, margin + 5);
  drawField("Gender", patient.gender, margin + 5);
  drawField("Phone", patient.phone, margin + 5);
  drawField("Blood Group", patient.bloodGroup, margin + 5);
  y += 5;

  // 2. Medical History
  drawSubsectionHeader("Medical History", "2.");
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
  y += 5;
  
  drawField("Medical Condition", patient.condition, margin + 5);
  y += 5;

  // Total consultations note
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Total Consultations on Record: ${consultations.length}`, margin + 5, y);
  y += 10;

  // SECTION II: CURRENT STATUS & CONSULTATION HISTORY
  checkPageBreak(60);
  drawSectionHeader("Current Status & Consultation History", "II.");

  consultations.forEach((c, idx) => {
    const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;

    checkPageBreak(80);

    // Consultation header box
    doc.setFillColor(cfg.bg);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.setFont("helvetica", "bold");
    doc.text(`Consultation #${idx + 1}`, margin + 5, y + 7);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(c.createdAt), pageWidth - margin - 40, y + 7);
    
    // Urgency badge
    doc.setFillColor(cfg.color);
    doc.roundedRect(pageWidth - margin - 35, y + 3, 30, 10, 1, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(cfg.label, pageWidth - margin - 20, y + 9, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    y += 20;

    let subNum = 1;

    // 1. Chief Complaints / Symptoms
    drawSubsectionHeader("Chief Complaints / Symptoms", `${idx + 1}.${subNum++}`);
    
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
    y += 5;
    
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    
    // Ensure we handle strings if someone passed a string instead of an array
    let sympArray: string[] = [];
    if (Array.isArray(c.symptoms)) sympArray = c.symptoms;
    else if (typeof c.symptoms === "string") sympArray = [c.symptoms];
    
    const symptomsText = sympArray.length > 0 ? sympArray.join(", ") : "Not recorded";
    const symptomLines = doc.splitTextToSize(`• ${symptomsText}`, contentWidth - 10);
    doc.text(symptomLines, margin + 5, y);
    y += symptomLines.length * 5 + 6;

    // 2. Appointment Details
    if (c.doctorName || c.hospital || c.slot) {
      checkPageBreak(30);
      drawSubsectionHeader("Appointment Details", `${idx + 1}.${subNum++}`);
      
      doc.setFillColor(250, 252, 255);
      doc.roundedRect(margin, y, contentWidth, c.queueNo ? 22 : 17, 2, 2, "F");
      y += 5;
      
      if (c.doctorName) {
        const cleanName = c.doctorName.replace(/^(Dr\.?\s*)/i, "").trim();
        drawField("Doctor", `Dr. ${cleanName}`, margin + 5);
      }
      if (c.hospital) drawField("Hospital", c.hospital, margin + 5);
      if (c.slot) drawField("Time", `${c.slot}${c.queueNo ? ` | Queue No: #${c.queueNo}` : ""}`, margin + 5);
      y += 5;
    }

    // 3. AI Triage Analysis
    if (c.triageResult) {
      checkPageBreak(30);
      drawSubsectionHeader("AI Triage Analysis", `${idx + 1}.${subNum++}`);
      
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
      y += 5;
      
      if (c.triageResult.conditionEn) drawField("Condition", c.triageResult.conditionEn, margin + 5);
      if (c.triageResult.urgency) drawField("Urgency Level", c.triageResult.urgency, margin + 5);
      y += 5;
    }

    // 4. Attached Medical Records
    if (c.uploadedRecords && c.uploadedRecords.length > 0) {
      checkPageBreak(40);
      drawSubsectionHeader("Attached Medical Records", `${idx + 1}.${subNum++}`);
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Number of Records: ${c.uploadedRecords.length}`, margin + 5, y);
      y += 6;
      
      const imgSize = 22;
      const imgGap = 5;
      let imgX = margin + 5;
      let imgRow = 0;

      for (let i = 0; i < Math.min(c.uploadedRecords.length, 8); i++) {
        const rec = c.uploadedRecords[i];
        if (rec && rec.dataUrl) {
          try {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.rect(imgX, y + imgRow * (imgSize + imgGap), imgSize, imgSize);
            doc.addImage(rec.dataUrl, "JPEG", imgX + 1, y + 1 + imgRow * (imgSize + imgGap), imgSize - 2, imgSize - 2);

            if ((i + 1) % 5 === 0) {
              imgX = margin + 5;
              imgRow++;
            } else {
              imgX += imgSize + imgGap;
            }
          } catch (e) {}
        }
      }

      const totalRows = Math.ceil(Math.min(c.uploadedRecords.length, 8) / 5);
      y += totalRows * (imgSize + imgGap) + 8;
    }

    // 5. Doctor's Diagnosis
    if (c.doctorNotes) {
      checkPageBreak(35);
      drawSubsectionHeader("Doctor's Diagnosis & Notes", `${idx + 1}.${subNum++}`);
      
      doc.setFillColor(253, 245, 245);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const notesLines = doc.splitTextToSize(c.doctorNotes, contentWidth - 10);
      doc.text(notesLines, margin + 5, y);
      y += notesLines.length * 5 + 8;
    }

    // 6. Prescription / Treatment
    if (c.prescription) {
      checkPageBreak(35);
      drawSubsectionHeader("Prescription / Treatment", `${idx + 1}.${subNum++}`);
      
      doc.setFillColor(245, 255, 245);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(50, 80, 50);
      const rxLines = doc.splitTextToSize(c.prescription, contentWidth - 10);
      doc.text(rxLines, margin + 5, y);
      y += rxLines.length * 5 + 8;
    }

    // Status
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const statusText = c.status === "completed" ? "✓ Completed" : c.status === "in-review" ? "◐ Under Review" : "○ Pending";
    doc.text(`Status: ${statusText}`, margin + 5, y);
    y += 10;

    // Divider between consultations
    if (idx < consultations.length - 1) {
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin + 10, y, pageWidth - margin - 10, y);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
  });

  // ==================== SIGNATURE SECTION ====================
  checkPageBreak(50);
  y = pageHeight - 65;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  
  // First signature line
  doc.line(margin + 10, y + 12, margin + 80, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Attending Physician Signature", margin + 45, y + 18, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Date & Stamp", margin + 45, y + 23, { align: "center" });

  // Second signature line
  doc.line(pageWidth - margin - 80, y + 12, pageWidth - margin - 10, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Authorized by Aarogya AI Healthcare", pageWidth - margin - 45, y + 18, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Official Seal", pageWidth - margin - 45, y + 23, { align: "center" });

  // Disclaimer
  y += 32;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  const disclaimerText = "This Clinical Handoff Report is a confidential medical document prepared by Aarogya AI Healthcare System. " +
    "It contains protected health information (PHI) and is intended solely for authorized healthcare professionals. " +
    "If you have received this document in error, please notify the issuing facility immediately.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(disclaimerLines, margin + 5, y + 6);

  addFooter();

  // Save with professional filename
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`ClinicalHandoff_${patient.name.replace(/\s+/g, "_")}_${dateStr}.pdf`);
}