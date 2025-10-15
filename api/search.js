// 這就是我們的「中間人」程式
// 它會在 Vercel 的伺服器上運行，而不是在用戶的瀏覽器裡

export default async function handler(request, response) {
  // 從前端的請求中，取得經緯度和半徑
  // 例如: /api/search?lat=25.03&lng=121.56&radius=1500
  const { lat, lng, radius } = request.query;

  // 這是我們要藏起來的秘密金鑰。 process.env.GOOGLE_PLACES_API_KEY 的意思是
  // 去 Vercel 網站上一個叫「環境變數」的安全地方，找出叫做 GOOGLE_PLACES_API_KEY 的值。
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // 組合出真正要送給 Google Places API 的網址
  const url = `https://places.googleapis.com/v1/places:searchNearby`;

  // 準備要用 POST 方式送給 Google 的請求內容 (Payload)
  const googleRequestPayload = {
    includedTypes: ['restaurant', 'cafe', 'bar', 'bakery'],
    maxResultCount: 20, // 這是 API 允許的上限
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
    // 帶著我們的秘密金鑰，去跟 Google 溝通
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey, // 在這裡附上金鑰！這是伺服器端的行為，前端看不到。
        // 'X-Goog-FieldMask' 告訴 Google 我們需要哪些具體的欄位，避免傳輸不必要的資料
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.priceLevel,places.location,places.photos,places.regularOpeningHours,places.websiteUri,places.googleMapsUri',
      },
      body: JSON.stringify(googleRequestPayload),
    });

    // 如果 Google 回報錯誤 (例如 4xx 或 5xx)，我們也跟著回報錯誤
    if (!googleResponse.ok) {
      // 將 Google 的錯誤訊息也記錄下來，方便除錯
      const errorBody = await googleResponse.text();
      console.error(`Google API Error: ${googleResponse.status}`, errorBody);
      throw new Error(`Google API responded with ${googleResponse.status}`);
    }

    // 取得 Google 回傳的 JSON 格式餐廳資料
    const data = await googleResponse.json();

    // 成功！將乾淨的餐廳資料回傳給我們的 App 前端
    // response.status(200) 代表 HTTP 狀態碼 200 OK
    response.status(200).json(data);

  } catch (error) {
    // 如果中間有任何錯誤，例如網路問題或 Google API 錯誤
    console.error('Error fetching from Google Places API:', error);
    // 回傳一個伺服器錯誤的訊息給前端
    response.status(500).json({ error: 'Failed to fetch data from Google Places API' });
  }
}