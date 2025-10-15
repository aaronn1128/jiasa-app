// api/search.js (偵錯版)

export default async function handler(request, response) {
  const { lat, lng, radius } = request.query;

  // 這是我們要藏起來的秘密金鑰。
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // ===== 監視器：印出我們拿到的金鑰是什麼 =====
  // 為了安全，我們只印出金鑰的最後 4 位，或者顯示它不存在
  console.log('Attempting to use API Key. Is it present?', !!apiKey);
  if (apiKey) {
    console.log(`API Key's last 4 characters: ...${apiKey.slice(-4)}`);
  } else {
    console.error('CRITICAL: GOOGLE_PLACES_API_KEY environment variable is NOT DEFINED!');
  }
  // ===========================================

  if (!apiKey) {
    // 如果沒有金鑰，直接回報錯誤，不要再往下執行
    return response.status(500).json({ error: 'Server configuration error: API Key is missing.' });
  }

  const url = `https://places.googleapis.com/v1/places:searchNearby`;
  const googleRequestPayload = {
    includedTypes: ['restaurant', 'cafe', 'bar', 'bakery'],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        radius: parseInt(radius, 10),
      },
    },
  };

  try {
    const googleResponse = await fetch(url, {
      method: 'POST',
// api/search.js（修正版：正確的 FieldMask 子欄位）

export default async function handler(request, response) {
  const { lat, lng, radius } = request.query;

  // 後端環境變數金鑰（Vercel 環境變數：GOOGLE_PLACES_API_KEY）
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // 簡易健檢輸出（僅最後 4 碼）
  console.log('Attempting to use API Key. Is it present?', !!apiKey);
  if (apiKey) {
    console.log(`API Key's last 4 characters: ...${apiKey.slice(-4)}`);
  } else {
    console.error('CRITICAL: GOOGLE_PLACES_API_KEY environment variable is NOT DEFINED!');
  }

  if (!apiKey) {
    return response
      .status(500)
      .json({ error: 'Server configuration error: API Key is missing.' });
  }

  const url = `https://places.googleapis.com/v1/places:searchNearby`;

  const googleRequestPayload = {
    includedTypes: ['restaurant', 'cafe', 'bar', 'bakery'],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        radius: parseInt(radius, 10),
      },
    },
  };

  try {
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // ✅ 展開子欄位，確保 openNow / weekdayDescriptions / photos.name 會回來
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.types',
          'places.rating',
          'places.priceLevel',
          'places.location',
          'places.websiteUri',
          'places.googleMapsUri',
          // photos 只要 name（之後前端用 /media 取圖）
          'places.photos.name',
          // regularOpeningHours 需要這兩個欄位
          'places.regularOpeningHours.openNow',
          'places.regularOpeningHours.weekdayDescriptions'
        ].join(','),
      },
      body: JSON.stringify(googleRequestPayload),
    });

if (!googleResponse.ok) {
  const errorBody = await googleResponse.text();
  console.error("🔴 Google API Error:", googleResponse.status, errorBody);
  return response.status(googleResponse.status).json({
    error: 'Google Places API failed',
    status: googleResponse.status,
    body: errorBody
  });
}

    const data = await googleResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    console.error('Error in fetch process:', error);
    return response.status(500).json({
      error: 'Failed to fetch data from Google Places API',
      details: error.message
    });
  }
}
      body: JSON.stringify(googleRequestPayload),
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text();
      console.error(`Google API Error: ${googleResponse.status}`, errorBody);
      throw new Error(`Google API responded with status: ${googleResponse.status}`);
    }

    const data = await googleResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error('Error in fetch process:', error);
    response.status(500).json({ error: 'Failed to fetch data from Google Places API', details: error.message });
  }
}