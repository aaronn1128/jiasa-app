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
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.priceLevel,places.location,places.photos,places.regularOpeningHours,places.websiteUri,places.googleMapsUri',
      },
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