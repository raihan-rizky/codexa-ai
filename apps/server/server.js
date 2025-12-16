import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import OpenAI from "openai";

const app = express();

// Security Middleware

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", //server hanya bisa diakses oleh spesifik domain atau url
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 menit window
  max: 100, // maksimal 100 request per IP adress
  message: "Too many requests from this IP, please try again after some time",
});

app.use(limiter);

app.use(express.json({ limit: "10mb" }));

const API_KEY = process.env.NEBIUS_API_KEY;

const client = new OpenAI({
  baseURL: "https://api.tokenfactory.nebius.com/v1/",
  apiKey: API_KEY,
});

// buat end point
app.post("/api/explain-code", async (request, response) => {
  // tombol explain code, ngirim data (post) ke server side dari client side
  // "async () => {} "" ==> callback function, bakal otomatis dieksekusi abis pencet tombol explain code

  try {
    const { code, language } = request.body;

    if (!code) {
      return response.status(400).json({ error: "Code is required" });
    }
    const messages = [
      {
        role: "user",
        content: `Please explain this ${
          language || ""
        } code in simple terms:\n\n\`\`\`${language || ""}\n${code}
      \n\`\`\``,
      },
    ];

    const AI_response = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct", // otak ai
      messages,
      temperature: 0.3, // seberapa creative dan deterministic, makin besar temperature makin creative, makin kecil makin deterministic,
      // contoh kalo temperature 0.3, mungkin akan ada 30% kesalahan, tapi akan lebih creative
      // kalo temperature : 0, jawaban bakal sama kalo inputnya sama
      max_tokens: 400, // maksimal panjang jawaban dari ai
    });

    const explanation = AI_response?.choices[0]?.message?.content;
    if (!explanation) {
      return response.status(500).json({ error: "Failed to explain code" });
    }
    response.json({ explanation, language: language || "unknown" });
  } catch (err) {
    console.error("Code Explain API Error:", err);
    response.status(500).json({ error: "Server error", details: err.message });
  }
});

/* const checkNebiusConnection = async () => {
  try {
    console.log("Checking Nebius API connection...");
    const models = await client.models.list();
    console.log("Connection successful! Available models:");
    models.data.forEach((m) => console.log(`- ${m.id}`));
  } catch (error) {
    console.error("Error connecting to Nebius API:", error.message);
  }
};

checkNebiusConnection();
 */
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
