// api/search.js
module.exports = async function (request, response) {
const { lat, lng, radius, lang } = request.query;
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  return response.status(500).json({ error: "Missing API key" });
}

// 把前端傳來的語系轉成 Google 需要的格式
const langMap = { 'zh': 'zh-TW', 'zh-TW': 'zh-TW', 'en': 'en', 'en-US': 'en' };
const languageCode = langMap[lang] || 'zh-TW';

const url = "https://places.googleapis.com/v1/places:searchNearby";
const payload = {
  includedTypes: ["restaurant", "cafe", "bar", "bakery"],
  maxResultCount: 20,
  languageCode,      // ✅ 加語系
  regionCode: "TW",  // ✅ 輔助在台灣場景
  locationRestriction: {
    circle: {
      center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
      radius: parseInt(radius, 10),
    },
  },
};

  try {
    const googleResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.rating",
          "places.priceLevel",
          "places.types",
          "places.photos.name",
          "places.regularOpeningHours.openNow",
          "places.regularOpeningHours.weekdayDescriptions",
        ].join(","),
      },
      body: JSON.stringify(payload),
    });

    if (!googleResponse.ok) {
      const text = await googleResponse.text();
      return response
        .status(googleResponse.status)
        .json({ error: text || "Google API error" });
    }

    const data = await googleResponse.json();
    return response.status(200).json(data);
  } catch (err) {
    console.error(err);
    return response
      .status(500)
      .json({ error: "Failed to fetch Google Places API", details: err.message });
  }
};
