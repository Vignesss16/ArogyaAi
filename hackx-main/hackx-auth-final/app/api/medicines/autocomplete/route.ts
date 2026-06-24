export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
    
    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    let externalSuggestions: string[] = [];

    // 1. Fetch from the REAL external API (NIH RxTerms - US National Library of Medicine)
    try {
      const rxNavRes = await fetch(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(query)}&maxList=6`);
      if (rxNavRes.ok) {
        const rxData = await rxNavRes.json();
        if (rxData && Array.isArray(rxData[1])) {
          externalSuggestions = rxData[1].map((name: string) => {
            return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          });
        }
      }
    } catch (apiErr) {
      console.error("External Medicine API failed:", apiErr);
    }

    // 2. Parse the CSV file of Indian Medicines
    let localSuggestions: string[] = [];
    try {
      const csvPath = path.join(process.cwd(), "public", "data", "indian_medicines.csv");
      const csvData = fs.readFileSync(csvPath, "utf-8");
      
      // Parse CSV (ignoring header)
      const rows = csvData.split('\n').slice(1);
      
      // Extract medicine names from the first column and filter by query
      localSuggestions = rows
        .map(row => row.split(',')[0]?.trim())
        .filter(med => med && med.toLowerCase().includes(query))
        .slice(0, 6);
    } catch (csvErr) {
      console.error("Failed to parse CSV dataset:", csvErr);
    }

    // 3. Merge both datasets and remove duplicates
    const combinedSet = new Set([...localSuggestions, ...externalSuggestions]);
    let suggestions = Array.from(combinedSet).slice(0, 8); // Top 8 suggestions total

    // Sort exact matches to the top
    suggestions.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(query);
      const bStarts = b.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    return NextResponse.json({ 
      suggestions,
      source: externalSuggestions.length > 0 ? "NIH RxTerms + Local DB" : "Local DB"
    });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
