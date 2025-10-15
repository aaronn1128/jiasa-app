// api/search.js（Nearby：距離 + 類型 + 語言）
module.exports = async function (request, response) {
  const { lat, lng, radius, lang, category } = request.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return response.status(500).json({ error: "Missing API key" });

  const langMap = { zh: 'zh-TW', 'zh-TW': 'zh-TW', en: 'en', 'en-US': 'en' };
  const languageCode = langMap[lang] || 'zh-TW';

  // 類型：餐廳 / 下午茶&輕食(cafe|bakery) / 酒吧
  let includedTypes = ['restaurant'];
  if (category === 'cafe_dessert') includedTypes = ['cafe','bakery'];
  else if (category === 'bar') includedTypes = ['bar'];

  const payload = {
    includedTypes,
    maxResultCount: 20,
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
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.rating",
          "places.priceLevel",
          "places.types",
          "places.location",
          "places.photos.name",
          "places.regularOpeningHours.openNow",
          "places.regularOpeningHours.weekdayDescriptions",
          "places.websiteUri",
          "places.googleMapsUri"
        ].join(",")
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return response.status(r.status).json({ error: text || "Google API error" });
    }
    const data = await r.json();
    response.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    return response.status(200).json(data);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to fetch Google Places API", details: err.message });
  }
};

