// api/search.js (完整修正版 - 請完整複製替換)
module.exports = async function (request, response) {
  const { lat, lng, radius, lang, category } = request.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // CORS 設定
  const allowedOrigins = [
    'https://jiasa-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // 處理 preflight request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 參數驗證
  if (!lat || !lng || !radius) {
    return response.status(400).json({ 
      error: "Missing required parameters",
      required: ["lat", "lng", "radius"]
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMeters = parseInt(radius, 10);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return response.status(400).json({ error: "Invalid latitude" });
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return response.status(400).json({ error: "Invalid longitude" });
  }
  if (isNaN(radiusMeters) || radiusMeters < 100 || radiusMeters > 5000) {
    return response.status(400).json({ 
      error: "Invalid radius (must be between 100-5000 meters)" 
    });
  }

  // API Key 檢查
  if (!apiKey) {
    console.error('[Search API] Missing GOOGLE_PLACES_API_KEY');
    return response.status(500).json({ 
      error: "Server configuration error" 
    });
  }

  // 語言映射
  const langMap = { 
    zh: 'zh-TW', 
    'zh-TW': 'zh-TW', 
    'zh-CN': 'zh-CN',
    en: 'en', 
    'en-US': 'en' 
  };
  const languageCode = langMap[lang] || 'zh-TW';

  // 類別映射
  let includedTypes = ['restaurant'];
  if (category === 'cafe_dessert') {
    includedTypes = ['cafe', 'bakery'];
  } else if (category === 'bar') {
    includedTypes = ['bar', 'night_club'];
  }

  // 建立請求 Payload
  const payload = {
    includedTypes,
    languageCode,
    regionCode: "TW",
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { 
          latitude, 
          longitude 
        },
        radius: radiusMeters
      }
    }
  };

  try {
    // 呼叫 Google Places API
    const apiResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.location,places.photos,places.regularOpeningHours,places.websiteUri,places.googleMapsUri"
        },
        body: JSON.stringify(payload)
      }
    );

    // 處理 API 錯誤
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[Search API] Google API Error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        body: errorText
      });

      if (apiResponse.status === 429) {
        return response.status(429).json({ 
          error: "API rate limit exceeded. Please try again later." 
        });
      }
      
      if (apiResponse.status === 403) {
        return response.status(403).json({ 
          error: "API key is invalid or restricted" 
        });
      }

      return response.status(apiResponse.status).json({ 
        error: "Google Places API error",
        details: errorText 
      });
    }

    // 處理成功響應
    const data = await apiResponse.json();
    
    // 計算距離並排序
    if (data.places && data.places.length > 0) {
      data.places.forEach(place => {
        if (place.location) {
          const placeLat = place.location.latitude;
          const placeLng = place.location.longitude;
          place.distanceMeters = calculateDistance(
            latitude, 
            longitude, 
            placeLat, 
            placeLng
          );
        }
      });

      data.places.sort((a, b) => 
        (a.distanceMeters || 9999) - (b.distanceMeters || 9999)
      );
    }

    // 設定快取
    response.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    console.log('[Search API] Success:', {
      results: data.places?.length || 0,
      category,
      radius: radiusMeters,
      lang: languageCode
    });

    return response.status(200).json(data);

  } catch (err) {
    console.error('[Search API] Unexpected Error:', err);
    
    return response.status(500).json({ 
      error: "Failed to fetch places",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// 計算兩點間距離 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
