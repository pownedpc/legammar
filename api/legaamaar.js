export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const { messages, model = "openrouter/auto", openRouterKey = "" } = req.body || {};
  const apiKey = process.env.OPENROUTER_API_KEY || openRouterKey;

  if (!apiKey) {
    return res.status(400).json({
      error: {
        message: "Missing OpenRouter API key. Set OPENROUTER_API_KEY in Vercel or add it in app settings."
      }
    });
  }

  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: { message: "Missing chat messages" } });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost",
        "X-Title": "Le Gamaar Cinema"
      },
      body: JSON.stringify({ model, messages })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: { message: error.message || "OpenRouter request failed" }
    });
  }
}
