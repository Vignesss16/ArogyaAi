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
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "AarogyaAI/1.0 (Health Hackathon App; contact@arogya.ai)"
          },
          signal: AbortSignal.timeout(3500),
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

    if (!data || !data.elements || data.elements.length === 0) {
      console.error("Overpass failed or returned 0 results. Trying Nominatim fallback...");
      const nominatimPharmacies = await fetchNominatimPharmacies(parseFloat(lat), parseFloat(lng));
      
      if (nominatimPharmacies.length > 0) {
        return NextResponse.json({ 
          pharmacies: nominatimPharmacies, 
          count: nominatimPharmacies.length,
          error: "Used backup Nominatim API",
          source: "OpenStreetMap (Real Data via Nominatim)"
        });
      }

      console.error("Both Overpass and Nominatim failed.");
      return NextResponse.json({ 
        pharmacies: [], 
        count: 0,
        error: "All real map APIs failed (Vercel IP Block)",
        source: "None"
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

// Nominatim fallback (REAL OpenStreetMap Data) if Overpass blocks Vercel
async function fetchNominatimPharmacies(lat: number, lng: number) {
  try {
    const radiusDeg = 0.02; // approx 2km
    const url = `https://nominatim.openstreetmap.org/search.php?q=pharmacy&format=jsonv2&extratags=1&limit=30&viewbox=${lng - radiusDeg},${lat + radiusDeg},${lng + radiusDeg},${lat - radiusDeg}&bounded=1`;
    console.log("Nominatim fallback URL:", url);
    const response = await fetch(url, {
      headers: { "User-Agent": "AarogyaAI/1.0 (contact@arogya.ai)" },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map((item: any, i: number) => {
      const pLat = parseFloat(item.lat);
      const pLng = parseFloat(item.lon);
      const distance = haversineDistance(lat, lng, pLat, pLng);
      const name = item.name || (item.extratags && item.extratags.name) || "Medical Store";
      
      return {
        id: `nom-${item.place_id || i}`,
        name: name,
        storeName: name,
        village: item.address?.suburb || "Nearby Area",
        address: item.display_name?.split(',').slice(0, 3).join(',') || "",
        phone: (item.extratags && item.extratags.phone) || "",
        lat: pLat,
        lng: pLng,
        distanceKm: distance.toFixed(2),
        distanceValue: distance,
        type: name.toLowerCase().includes("govt") ? "Govt Free" : "Private",
        inStock: true,
        opening_hours: (item.extratags && item.extratags.opening_hours) || "24/7",
        website: ""
      };
    }).sort((a: any, b: any) => a.distanceValue - b.distanceValue);
  } catch (error) {
    console.error("Nominatim fallback failed:", error);
    return [];
  }
}
