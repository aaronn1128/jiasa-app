// api/maps-config.js
// 用途: 動態提供 Google Maps SDK URL，避免前端暴露 API Key

module.exports = async function (request, response) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: "Server configuration error" });
  }

  // 設定 CORS（只允許你的域名）
  const allowedOrigins = [
    'https://yourdomain.vercel.app',
    'https://jiasa.app', // 你的正式域名
    'http://localhost:3000' // 本地開發
  ];

  const origin = request.headers.origin;
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }

  // 快取配置（短時間快取即可）
  response.setHeader('Cache-Control', 'public, max-age=3600');
  response.setHeader('Content-Type', 'application/json');

  return response.status(200).json({
    mapsUrl: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=zh-TW&v=beta`
  });
};