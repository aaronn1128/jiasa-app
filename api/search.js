// api/search.js
module.exports = async function (request, response) {
  const { lat, lng, radius, lang, category } = request.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "Missing API key" });
  }

  const langMap = { zh: 'zh-TW', 'zh-TW': 'zh-TW', en: 'en', 'en-US': 'en' };
  const languageCode = langMap[lang] || 'zh-TW';

  let includedTypes = ['restaurant'];
  if (category === 'cafe_dessert') {
    includedTypes = ['cafe', 'bakery'];
  } else if (category === 'bar') {
    includedTypes = ['bar'];
  }

  const payload = {
    includedTypes,
    languageCode,
    regionCode: "TW",
    locationRestriction: {
      circle: {
        center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        radius: parseInt(radius, 10)
      }
    }
  };

  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.location,places.photos,places.regularOpeningHours,places.websiteUri,places.googleMapsUri"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return response.status(r.status).json({ error: text || "Google API error" });
    }
    const data = await r.json();
    
    // 手動計算距離
    if (data.places && data.places.length > 0) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      data.places = data.places.map(place => {
        if (place.location) {
          const distance = calculateDistance(
            userLat, 
            userLng, 
            place.location.latitude, 
            place.location.longitude
          );
          return { ...place, distanceMeters: Math.round(distance) };
        }
        return place;
      });
      
      data.places.sort((a, b) => (a.distanceMeters || 9999) - (b.distanceMeters || 9999));
    }

    response.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    return response.status(200).json(data);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to fetch Google Places API", details: err.message });
  }
};

// Haversine 公式計算兩點間距離（米）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // 地球半徑（米）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}