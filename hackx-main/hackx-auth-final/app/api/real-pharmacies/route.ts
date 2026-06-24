export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

// Cache to speed up repeated requests
const cache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Overpass API query to find real pharmacies near user location
export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get("lat");
    const lng = req.nextUrl.searchParams.get("lng");
    const radiusParam = req.nextUrl.searchParams.get("radius") || "1500"; // 1.5km default for faster queries

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const cacheKey = `${lat}-${lng}-${radiusParam}`;
    
    // Check cache first (fast!)
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("✅ Cache hit - returning cached result");
      return NextResponse.json(cached.data);
    }

    const radius = parseInt(radiusParam);

    // Overpass QL query to find pharmacies (optimized for speed)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        node["shop"="chemist"](around:${radius},${lat},${lng});
        node["shop"="medical_supply"](around:${radius},${lat},${lng});
      );
      out center qt 50;
    `;

    // Try multiple Overpass instances for speed and reliability
    const overpassInstances = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://z.overpass-api.de/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      "https://overpass.osm.ch/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];

    let data = null;
    let lastError = null;

    // Try each instance until one works (fastest first)
    for (const overpassUrl of overpassInstances) {
      try {
        console.log(`Trying Overpass: ${overpassUrl}`);
        const startTime = Date.now();
        const response = await fetch(overpassUrl, {
          method: "POST",
          body: `data=${encodeURIComponent(overpassQuery)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: AbortSignal.timeout(15000), // 15 second timeout to allow slower servers to respond
        });

        if (response.ok) {
          data = await response.json();
          console.log(`✅ Overpass responded in ${Date.now() - startTime}ms`);
          break;
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!data) {
      console.error("All Overpass instances failed:", lastError);
      return NextResponse.json({ 
        pharmacies: [], 
        count: 0,
        error: "Overpass API unavailable - Request timed out",
        source: "OpenStreetMap (Real Data)"
      });
    }

    // Transform Overpass response to our format
    const pharmacies = data.elements
      .filter((element: any) => element.tags)
      .slice(0, 50) // Limit to 50 for speed
      .map((element: any) => {
        const tags = element.tags;
        const elementLat = element.lat || element.center?.lat || parseFloat(lat);
        const elementLng = element.lon || element.center?.lon || parseFloat(lng);

        // Calculate distance from user
        const distance = haversineDistance(
          parseFloat(lat),
          parseFloat(lng),
          elementLat,
          elementLng
        );

        return {
          id: element.id.toString(),
          name: tags.name || "Medical Store",
          storeName: tags.name || "Medical Store",
          village: tags.suburb || tags.city || tags.city_district || "Nearby",
          address: tags["addr:full"] || tags["addr:street"] || "",
          phone: tags.phone || tags["contact:phone"] || "",
          lat: elementLat,
          lng: elementLng,
          distanceKm: distance.toFixed(2),
          distanceValue: distance,
          type: tags.operator?.toLowerCase().includes("govt") || tags.name?.toLowerCase().includes("govt") ? "Govt Free" : "Private",
          inStock: true,
          opening_hours: tags.opening_hours || "",
          website: tags.website || tags["contact:website"] || "",
        };
      })
      .sort((a: any, b: any) => a.distanceValue - b.distanceValue);

    const result = {
      pharmacies,
      count: pharmacies.length,
      source: "OpenStreetMap (Real Data)"
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error fetching real pharmacies:", error);
    return NextResponse.json({ 
      pharmacies: [], 
      count: 0,
      error: error.message 
    }, { status: 500 });
  }
}

// Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
