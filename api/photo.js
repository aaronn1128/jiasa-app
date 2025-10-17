// api/photo.js
// 用途: 代理 Google Places Photo 請求，避免前端暴露 API Key

module.exports = async function (request, response) {
  const { photoName } = request.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // 驗證參數
  if (!photoName) {
    return response.status(400).json({ error: "Missing photoName parameter" });
  }

  if (!apiKey) {
    return response.status(500).json({ error: "Server configuration error" });
  }

  // 驗證 photoName 格式（防止惡意請求）
  if (!photoName.startsWith('places/')) {
    return response.status(400).json({ error: "Invalid photo name format" });
  }

  try {
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`;
    
    const photoResponse = await fetch(photoUrl);
    
    if (!photoResponse.ok) {
      return response.status(photoResponse.status).json({ 
        error: "Failed to fetch photo" 
      });
    }

    // 取得圖片內容和類型
    const contentType = photoResponse.headers.get('content-type');
    const imageBuffer = await photoResponse.arrayBuffer();

    // 設定快取（圖片通常不會變動）
    response.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    response.setHeader('Content-Type', contentType);
    
    return response.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Photo proxy error:', error);
    return response.status(500).json({ 
      error: "Failed to fetch photo",
      details: error.message 
    });
  }
};