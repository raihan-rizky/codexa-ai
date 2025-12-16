import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.tokenfactory.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const AI_response = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      messages: [
        {
          role: "user",
          content: `Please explain this ${
            language || ""
          } code in simple terms:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const explanation = AI_response?.choices[0]?.message?.content;
    if (!explanation)
      return res.status(500).json({ error: "Failed to explain code" });

    res.json({ explanation, language: language || "unknown" });
  } catch (err) {
    console.error("Code Explain API Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
