import { startTime } from "./env_setup.js";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import multer from "multer";

console.log(
  "[IMPORT] ✓ Core dependencies loaded (express, cors, helmet, rate-limit, multer, langchain)",
);
import {
  ensureSession,
  getSessionWithChats,
  createChat,
  listChats,
  getMessages,
  addMessage,
  deleteChat,
} from "../services/chat_services.js";
console.log("[IMPORT] ✓ Chat services loaded");
import {
  uploadDocument,
  queryRAG,
  clearDocuments,
  listDocuments,
  deleteDocument,
  initEmbeddingModel,
  prepareRAGContext,
  llm as ragLlm,
} from "../services/rag.js";
console.log("[IMPORT] ✓ RAG services loaded");
import { initCronJob } from "../services/cleanup.js";
console.log("[IMPORT] ✓ Cleanup services loaded");
console.log("[STARTUP] 📦 All imports completed\n");

// ============ GLOBAL ERROR HANDLERS ============
// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[ERROR] ❌ Unhandled Rejection at:", promise);
  console.error("[ERROR] Reason:", reason);
});

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[ERROR] ❌ Uncaught Exception:", error.message);
  console.error("[ERROR] Stack:", error.stack);
  // Give time to log before exiting
  setTimeout(() => process.exit(1), 1000);
});

console.log("[STARTUP] ✓ Global error handlers registered");

// Initialize Daily Cleanup Job
console.log("[STARTUP] 🕐 Initializing scheduled tasks...");
initCronJob();

// Preload embedding model at startup (avoid cold start on first query)
console.log("[STARTUP] 🧠 Preloading embedding model...");
initEmbeddingModel()
  .then(() => console.log("[STARTUP] ✓ Embedding model preloaded"))
  .catch((err) =>
    console.error("[STARTUP] ⚠️ Failed to preload model:", err.message),
  );

// Configure multer for code file uploads
const ALLOWED_EXTENSIONS = [".py", ".js", ".jsx", ".cpp", ".go", ".rs"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only code files (.py, .js, .jsx, .cpp, .go, .rs) are allowed",
        ),
        false,
      );
    }
  },
});

const app = express();
console.log("[SERVER] ✓ Express app created");

console.log("\n[MIDDLEWARE] 🔧 Setting up middleware...");
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://www.codexa-ai.site",
    "https://codexa-ai-server.vercel.app",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else {
    // Default to allowing all if not strictly enforcing (or change to * for development)
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(helmet());
console.log("[MIDDLEWARE] ✓ Helmet (security headers) configured");

app.set("trust proxy", 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Limit tiap IP
  standardHeaders: true,
  legacyHeaders: false,
  // TAMBAHIN INI buat matiin warning/error ValidationError tadi
  validate: { xForwardedForHeader: false },
});

app.use(limiter);
console.log("[MIDDLEWARE] ✓ Rate limiter configured (100 req/15min)");

app.use(express.json({ limit: "10mb" }));
console.log("[MIDDLEWARE] ✓ JSON body parser configured (10mb limit)");

// Request Logger Middleware
// Request Logger Middleware
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    try {
      console.log(
        "[BODY]",
        JSON.stringify(req.body, null, 2).substring(0, 500) + "...",
      );
    } catch (e) {
      console.log("[BODY] (Could not stringify body, likely binary/multipart)");
    }
  }
  next();
});

console.log("\n[AI] 🤖 Initializing LangChain AI client...");
const API_KEY = process.env.NEBIUS_API_KEY;

if (!API_KEY) {
  console.error("[AI] ✗ NEBIUS_API_KEY is not set!");
} else {
  console.log("[AI] ✓ NEBIUS_API_KEY configured");
}

const client = new ChatOpenAI({
  model: "meta-llama/Llama-3.3-70B-Instruct-fast",
  configuration: {
    baseURL: "https://api.tokenfactory.nebius.com/v1/",
  },
  apiKey: API_KEY,
  temperature: 0.3,
  maxTokens: 1024,
});
console.log("[AI] ✓ LangChain client created (Nebius endpoint)");

// buat end point
app.post("/api/explain-code", async (request, response) => {
  // tombol explain code, ngirim data (post) ke server side dari client side
  // "async () => {} "" ==> callback function, bakal otomatis dieksekusi abis pencet tombol explain code
  try {
    const { code, language } = request.body;

    if (!code) {
      return response.status(400).json({ error: "code is required" });
    }
    const systemPrompt = `You are a helpful code assistant.

Your ONLY responsibility is to explain programming-related code
(such as JavaScript, Python, C++, etc.) in simple, beginner-friendly language.

Rules:
- Only answer questions related to programming or source code.
- If the user asks about anything outside programming or code,
  respond exactly with: "That’s outside my information. Please ask something related to programming or code.".
- Do NOT add extra explanations when rejecting.
- When explaining code, break down each syntax and explain what it does.
- Keep explanations concise, clear, and beginner-friendly.`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Please explain this ${
        language || ""
      } code in simple terms:

\`\`\`${language || ""}
${code}
\`\`\`
`),
    ];

    const AI_response = await client.invoke(messages);

    const explanation = AI_response?.content;
    if (!explanation) {
      return response.status(500).json({ error: "Failed to explain code" });
    }
    response.json({ explanation, language: language || "unknown" });
  } catch (err) {
    console.error("code Explain API Error:", err);
    response.status(500).json({ error: "Server error", details: err.message });
  }
});

// ============ RAG Endpoints ============

// Upload code file and process for RAG
app.post("/api/upload-code", upload.single("code"), async (req, res) => {
  try {
    const { session_key } = req.body;

    if (!session_key) {
      return res.status(400).json({ error: "session_key is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No code file uploaded" });
    }
    const session = await ensureSession(session_key);
    console.log(`Processing code file: ${req.file.originalname}`);
    const result = await uploadDocument(
      req.file.buffer,
      req.file.originalname,
      session.id,
    );
    //console.log("result", result);
    if (result.success == false) {
      console.log("result false", result);
      return res.status(500).json({
        error: `${req.file.originalname} already exists in the database, please upload another file`,
      });
    }

    res.json({
      success: true,
      message: `Code file processed successfully`,
      filename: result.filename,
      chunks: result.chunks_count,
    });
  } catch (err) {
    console.error("PDF Upload Error:", err);
    res
      .status(500)
      .json({ error: "Failed to process PDF", details: err.message });
  }
});

// Query RAG with similarity search
app.post("/api/query-rag", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`RAG Query: ${query.substring(0, 50)}...`);
    const result = await queryRAG(query);

    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (err) {
    console.error("RAG Query Error:", err);
    if (err.response) {
      console.error("API Response Error:", err.response.data);
    }
    console.error("Stack Trace:", err.stack);
    res
      .status(500)
      .json({ error: "Failed to query documents", details: err.message });
  }
});

// Clear all documents (for testing)
app.delete("/api/documents", async (req, res) => {
  try {
    await clearDocuments();
    res.json({ success: true, message: "All documents cleared" });
  } catch (err) {
    console.error("Clear Documents Error:", err);
    res
      .status(500)
      .json({ error: "Failed to clear documents", details: err.message });
  }
});

// Clear all documents via POST (for sendBeacon on page close)
app.post("/api/documents/clear", async (req, res) => {
  try {
    await clearDocuments();
    res.json({ success: true, message: "All documents cleared" });
  } catch (err) {
    console.error("Clear Documents Error:", err);
    res
      .status(500)
      .json({ error: "Failed to clear documents", details: err.message });
  }
});

// Chat SERVICE ENDPOINTS

// Get session with chats + activeChat + messages
app.post("/api/chat/session", async (req, res) => {
  try {
    const { session_key } = req.body;
    if (!session_key)
      return res.status(400).json({ error: "session_key is required" });

    const { session, chats, activeChat, messages, title } =
      await getSessionWithChats(session_key);

    const docs = await listDocuments(session_key);

    console.log("docs", docs);
    console.log("title", title);

    return res.status(200).json({
      success: true,
      session,
      chats,
      activeChat,
      messages,
      docs,
      title,
    });
  } catch (err) {
    console.error("Chat Session Error:", err);
    return res.status(err.statusCode || 500).json({
      error: "Failed to load session",
      details: err.message,
    });
  }
});

// Create new chat in session
app.post("/api/chat/new", async (req, res) => {
  try {
    const { session_key, title } = req.body;
    if (!session_key)
      return res.status(400).json({ error: "session_key is required" });

    const session = await ensureSession(session_key);
    const chat = await createChat({
      sessionId: session.id,
      title: title ?? "New chat",
    });

    res.json({ success: true, chat });
  } catch (err) {
    console.error("Create Chat Error:", err);
    res
      .status(500)
      .json({ error: "Failed to create chat", details: err.message });
  }
});

// Get messages for a specific chat
app.get("/api/chat/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await getMessages(chatId);
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Get Messages Error:", err);
    res
      .status(500)
      .json({ error: "Failed to load messages", details: err.message });
  }
});

//Get list of uploaded documents
app.get("/api/list-documents", async (req, res) => {
  try {
    const { session_key } = req.body;
    const documents = await listDocuments(session_key);
    if (documents.length === 0) {
      return res.status(404).json({ error: "No documents found" });
    }
    res.json({ success: true, documents });
  } catch (err) {
    console.error("Get Documents Error:", err);
    res
      .status(500)
      .json({ error: "Failed to load documents", details: err.message });
  }
});

// Delete a chat
app.delete("/api/chat/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" });
    }

    await deleteChat(chatId);
    res.json({ success: true, message: "Chat deleted" });
  } catch (err) {
    console.error("Delete Chat Error:", err);
    res
      .status(500)
      .json({ error: "Failed to delete chat", details: err.message });
  }
});

// Delete a document by filename
app.delete("/api/documents", async (req, res) => {
  try {
    const { session_key, filename } = req.body;
    if (!session_key || !filename) {
      return res
        .status(400)
        .json({ error: "session_key and filename are required" });
    }

    // Get session to get session.id
    const session = await ensureSession(session_key);
    await deleteDocument(session.id, filename);
    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error("Delete Document Error:", err);
    res
      .status(500)
      .json({ error: "Failed to delete document", details: err.message });
  }
});

// Send message to a chat
app.post("/api/chat/send", async (req, res) => {
  try {
    console.log("[ENDPOINT] /api/chat/send hit");
    const {
      session_key,
      chat_id,
      message,
      mode,
      language,
      title = "New chat",
    } = req.body;
    console.log({ session_key, chat_id, message, mode, language, title });

    if (!session_key || !chat_id || !message) {
      console.warn("[ENDPOINT] Missing required fields");
      return res
        .status(400)
        .json({ error: "session_key, chat_id, message are required" });
    }

    console.log(`[ENDPOINT] processing message for chat: ${chat_id}`);
    const session = await ensureSession(session_key);

    const userMsg = await addMessage({
      sessionId: session.id,
      chatId: chat_id,
      role: "user",
      content: message,
      meta: { mode, language },
      title: title,
    });

    // Get AI response based on mode
    let aiText;
    if (mode === "rag") {
      const ragResult = await queryRAG(message);
      aiText = ragResult.answer;
    } else {
      // Code explanation
      const codeSystemPrompt = `You are a helpful code assistant.

Your ONLY responsibility is to explain programming-related code
(such as JavaScript, Python, C++, etc.) in simple, beginner-friendly language.

Rules:
- Only answer questions related to programming or source code.
- If the user asks about anything outside programming or code,
  respond exactly with: "It is outside my information, please ask something else".
- Do NOT add extra explanations when rejecting.
- When explaining code, break down each syntax and explain what it does.
- Keep explanations concise, clear, and beginner-friendly.`;

      const codeMessages = [
        new SystemMessage(codeSystemPrompt),
        new HumanMessage(message),
      ];

      const response = await client.invoke(codeMessages);
      aiText = response.content;
    }

    const assistantMsg = await addMessage({
      sessionId: session.id,
      chatId: chat_id,
      role: "assistant",
      content: aiText,
      meta: { mode, language },
    });

    res.json({ success: true, messages: [userMsg, assistantMsg] });
  } catch (err) {
    console.error("Chat Send Error:", err);
    res
      .status(500)
      .json({ error: "Failed to send message", details: err.message });
  }
});

// Streaming endpoint for chat messages
app.post("/api/chat/send-stream", async (req, res) => {
  try {
    console.log("[STREAM] /api/chat/send-stream hit");
    const {
      session_key,
      chat_id,
      message,
      mode,
      language,
      title = "New chat",
    } = req.body;

    if (!session_key || !chat_id || !message) {
      return res
        .status(400)
        .json({ error: "session_key, chat_id, message are required" });
    }

    const session = await ensureSession(session_key);
    const history = await getMessages(chat_id);
    const conversationHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    console.log(
      "conversation history exist :",
      conversationHistory ? "yes" : "no",
    );
    console.log("conversation history content", conversationHistory);

    // Save user message
    const userMsg = await addMessage({
      sessionId: session.id,
      chatId: chat_id,
      role: "user",
      content: message,
      meta: { mode, language },
      title: title,
    });

    // Send user message confirmation
    res.write(
      `data: ${JSON.stringify({ type: "user_saved", message: userMsg })}\n\n`,
    );

    let fullAiText = "";

    if (mode === "rag") {
      // TRUE STREAMING: Prepare RAG context then stream LLM response
      console.log("[STREAM] Using true RAG streaming...");
      const ragContext = await prepareRAGContext(
        message,
        chat_id,
        5,
        conversationHistory,
      );

      // Handle case where no documents found
      if (ragContext.noDocuments) {
        fullAiText = ragContext.noDocsMessage;
        res.write(
          `data: ${JSON.stringify({ type: "chunk", content: fullAiText })}\n\n`,
        );
      } else {
        // Stream LLM response token by token
        console.log("[STREAM] Starting true token streaming for RAG...");
        const stream = await ragLlm.stream(ragContext.messages);

        for await (const chunk of stream) {
          const content = chunk.content || "";
          if (content) {
            fullAiText += content;
            res.write(
              `data: ${JSON.stringify({ type: "chunk", content })}\n\n`,
            );
          }
        }
        console.log("[STREAM] ✓ RAG streaming complete");
      }
    } else {
      // Stream code explanation using LangChain stream
      const streamSystemPrompt = `You are a helpful code assistant.

Your ONLY responsibility is to explain programming-related code
(such as JavaScript, Python, C++, etc.) in simple, beginner-friendly language.

Rules:
- Only answer questions related to programming or source code.
- If the user asks about anything outside programming or code,
  respond exactly with: "That’s outside my information. Please ask something related to programming or code.".
- Do NOT add extra explanations when rejecting.
- When explaining code, break down each syntax and explain what it does.
- Keep explanations concise, clear, and beginner-friendly.
- ALWAYS answer with example code`;

      const streamMessages = [
        new SystemMessage(streamSystemPrompt),
        ...conversationHistory.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new SystemMessage(msg.content),
        ),
        new HumanMessage(message),
      ];

      const stream = await client.stream(streamMessages);

      for await (const chunk of stream) {
        const content = chunk.content || "";
        if (content) {
          fullAiText += content;
          res.write(
            `data: ${JSON.stringify({ type: "chunk", content })}\\n\\n`,
          );
        }
      }
    }

    // Save assistant message
    const assistantMsg = await addMessage({
      sessionId: session.id,
      chatId: chat_id,
      role: "assistant",
      content: fullAiText,
      meta: { mode, language },
    });

    // Send completion
    res.write(
      `data: ${JSON.stringify({ type: "done", message: assistantMsg })}\n\n`,
    );
    res.end();
  } catch (err) {
    console.error("Chat Stream Error:", err);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`,
    );
    res.end();
  }
});

console.log("\n[ENDPOINTS] 📡 API endpoints registered:");
console.log("  POST /api/explain-code");
console.log("  POST /api/upload-code");
console.log("  POST /api/query-rag");
console.log("  DELETE /api/documents");
console.log("  POST /api/documents/clear");
console.log("  POST /api/chat/session");
console.log("  POST /api/chat/new");
console.log("  GET /api/chat/:chatId/messages");
console.log("  GET /api/list-documents");
console.log("  DELETE /api/chat/:chatId");
console.log("  POST /api/chat/send");
console.log("  POST /api/chat/send-stream");

const PORT = process.env.PORT || 8080;

console.log("\n[SERVER] 🌐 Starting HTTP server...");
app.listen(PORT, "0.0.0.0", () => {
  const startupDuration = Date.now() - startTime;
  console.log("\n" + "=".repeat(60));
  console.log("✅ SERVER STARTED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log(`[SERVER] 🚀 Server is running on port ${PORT}`);
  console.log(`[SERVER] 🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`[SERVER] ⏱️  Startup time: ${startupDuration}ms`);
  console.log(`[SERVER] 📅 Started at: ${new Date().toISOString()}`);
  console.log("=".repeat(60) + "\n");
});

export default app;
