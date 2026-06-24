# Aarogya.AI - Development Changelog & Upgrades

This document outlines the major bug fixes, architectural upgrades, and feature enhancements implemented to prepare Aarogya.AI for production and live demonstration.

## 🏥 1. Core Data & Backend Architecture
*   **Auto-Creation of Patient Profiles:** Fixed a critical bug where ASHA workers were logging visits and tests for unregistered patients, causing the records to "disappear". Now, the backend APIs (`/api/asha/visits`, `/api/blood-tests`, `/api/vital-signs`) automatically detect if a patient doesn't exist and intelligently generates a new master profile in the background.
*   **Database Synchronization:** Executed a custom database script directly on the live MongoDB to retroactively fix orphaned patient records (like "Jeeva") so no medical data was lost.
*   **Real-time Dashboard Refreshing:** Re-engineered the ASHA Dashboard tabs. Now, when a worker switches back to the "Patients" tab, the app automatically re-fetches the latest data from the server without requiring a hard page reload.
*   **Chronological Sorting:** Updated the `/api/patients` endpoint to sort by `createdAt: -1` so the most recently registered patients appear at the very top of the dashboard.

## 🔍 2. Advanced Search Capabilities
*   **Smart "Name or Phone" Search:** The original system only allowed searching by exact phone numbers. We rewrote the backend APIs to support Regex pattern matching. Now, if a user types letters instead of numbers, the system seamlessly transitions to a case-insensitive search by Patient Name across Visits, Blood Tests, and Vitals.
*   **Live Dashboard Search Integration:** Hooked up the live MongoDB data to the ASHA Worker dashboard search bar, entirely replacing the old hardcoded placeholder data.

## 📹 3. Telemedicine & WebRTC Infrastructure
*   **Production WebRTC Video Calls:** Fixed an issue where the video/audio call worked locally but failed to show video on the live website. We implemented public **TURN Servers** (`openrelay.metered.ca`) into the `ICE_SERVERS` configuration. This allows the video stream to bypass strict symmetric NAT firewalls (like 4G/5G mobile networks) and relay data globally.

## 🚀 4. Vercel Deployment & DevOps
*   **Dynamic Server Pre-rendering Fix:** Next.js 14 crashed on Vercel because it aggressively tried to statically build dynamic routes. We ran a script across all 25+ API routes to inject `export const dynamic = 'force-dynamic';`, allowing seamless deployment.
*   **NextAuth Production Configuration:** Diagnosed and fixed the production login system by overriding the faulty `NEXTAUTH_URL` and ensuring `MONGODB_URI` and `NEXTAUTH_SECRET` were securely injected into the Vercel edge environment.
*   **Sub-directory Build Routing:** Successfully mapped Vercel's build pipeline to your nested GitHub directory structure.

## 🎨 5. UI/UX & Quality of Life Improvements
*   **Patient Context in Medical History:** Medical records (Blood Tests and Vitals) were confusing because they didn't explicitly label the patient. We updated the UI cards in the Patient History view to prominently display the Patient's Name, Phone Number, and Date of the test.
*   **Professional Password Toggles:** Replaced informal emojis (🙈/👁️) with professional, clinical SVG icons for the "Show/Hide Password" toggles across the Pharmacist, Patient, and Admin login portals.
*   **Hydration Error Resolution:** Fixed the severe Next.js React Hydration crashes (e.g., `"आपातकालीन सतर्कता" vs "Emergency Alert"`) on the SOS page by ensuring server-rendered text matched the client-rendered output.
*   **Clickable Navigation:** Fixed broken routing for the Logout and SOS buttons on the ASHA worker dashboard, making the portal fully navigable.
