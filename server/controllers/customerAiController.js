const buildMenuContext = (menu = []) =>
  menu
    .filter((item) => item && item.isAvailable !== false)
    .slice(0, 120)
    .map((item) => ({
      name: item.name,
      price: Number(item.price || 0),
      category: item.category || "",
      description: item.description || "",
      veg: item.veg,
      rating: item.rating,
    }));

exports.customerAssistant = async (req, res) => {
  try {
    if (req.user && req.user.role && req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer AI is available only for customer accounts.",
      });
    }

    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Gemini is not configured. Add GEMINI_API_KEY to server/.env.",
      });
    }

    const menu = buildMenuContext(req.body?.menu);
    const recentOrders = Array.isArray(req.body?.recentOrders)
      ? req.body.recentOrders.slice(0, 5)
      : [];

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemContext = `
You are RestroSphere AI, a restaurant food assistant.

STRICT RULES:
1. Use only the supplied live menu for dish names, prices, categories and availability.
2. Never invent a dish, price, discount, table, reservation or restaurant policy.
3. If a requested item is not in the live menu, clearly say it is not currently available.
4. For recommendations, consider the user's budget, vegetarian preference, category and wording.
5. You may explain general food information, but restaurant-specific facts must come from the supplied data.
6. Keep answers concise, friendly and useful.
7. If the user asks about their order, use only the supplied recent order data.

LIVE MENU:
${JSON.stringify(menu)}

RECENT CUSTOMER ORDERS:
${JSON.stringify(recentOrders)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${systemContext}\n\nCUSTOMER QUESTION:\n${prompt}`,
    });

    const reply = response?.text?.trim();

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned an empty response.",
      });
    }

    return res.json({
      success: true,
      provider: "gemini",
      reply,
    });
  } catch (error) {
    console.error("CUSTOMER GEMINI AI ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to get a response from Gemini right now.",
    });
  }
};
