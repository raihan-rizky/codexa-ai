import "dotenv/config";
import OpenAI from "openai";

const API_KEY = process.env.NEBIUS_API_KEY;

if (!API_KEY) {
  console.error("Error: NEBIUS_API_KEY is not set in .env file.");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://api.tokenfactory.nebius.com/v1/",
  apiKey: API_KEY,
});

async function main() {
  try {
    console.log("Checking Nebius API connection...");
    console.log("--------------------------------");

    // 1. List Models
    console.log("Fetching available models...");
    const models = await client.models.list();
    console.log("Available models:");
    models.data.forEach((m) => console.log(`- ${m.id}`));
    console.log("--------------------------------");

    // 2. Test Chat Completion with the configured model
    const testModel = "meta-llama/Llama-3.3-70B-Instruct"; // Switch to Llama 3.3 which is in the list
    console.log(`Testing chat completion with model: ${testModel}...`);

    const response = await client.chat.completions.create({
      model: testModel,
      messages: [{ role: "user", content: "Hello, are you working?" }],
      max_tokens: 50,
    });

    console.log("Chat completion successful!");
    console.log("Response:", response.choices[0].message.content);
    console.log("--------------------------------");
    console.log("Verification Passed!");
  } catch (error) {
    console.error("Verification Failed!");
    console.error("Error details:", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

main();
