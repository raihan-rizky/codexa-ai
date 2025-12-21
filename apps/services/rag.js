import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { pipeline } from "@xenova/transformers";
import { supabase } from "../db/supabase.js";
import { getMessages } from "./chat_services.js";
console.log("[RAG] 🧠 Initializing RAG service...");

// Initialize LangChain ChatOpenAI client with Nebius endpoint
console.log("[RAG] 🔗 Connecting to Nebius AI API via LangChain...");
const llm = new ChatOpenAI({
  model: "meta-llama/Llama-3.3-70B-Instruct-fast",
  configuration: {
    baseURL: "https://api.tokenfactory.nebius.com/v1/",
  },
  apiKey: process.env.NEBIUS_API_KEY,
  temperature: 0.3,
  maxTokens: 800,
  timeout: 60000,
  maxRetries: 3,
});
console.log("[RAG] ✓ LangChain client initialized");

/**
 * SQL to create the documents table in Supabase:
 *
 * CREATE EXTENSION IF NOT EXISTS vector;
 *
 * CREATE TABLE documents (
 *   id BIGSERIAL PRIMARY KEY,
 *   content TEXT NOT NULL,
 *   embedding VECTOR(384),
 *   metadata JSONB DEFAULT '{}'::jsonb,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 *
 * CREATE OR REPLACE FUNCTION match_documents(
 *   query_embedding VECTOR(384),
 *   match_count INT DEFAULT 5,
 *   filter JSONB DEFAULT '{}'::jsonb
 * ) RETURNS TABLE (
 *   id BIGINT,
 *   content TEXT,
 *   metadata JSONB,
 *   similarity FLOAT
 * ) LANGUAGE plpgsql AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     d.id,
 *     d.content,
 *     d.metadata,
 *     1 - (d.embedding <=> query_embedding) AS similarity
 *   FROM documents d
 *   WHERE d.metadata @> filter
 *   ORDER BY d.embedding <=> query_embedding
 *   LIMIT match_count;
 * END;
 * $$;
 */

// Cache for the embedding model - load once, reuse always
let embeddingPipeline = null;

/**
 * Initialize the embedding pipeline (can be called at startup for preloading)
 */
export async function initEmbeddingModel() {
  if (embeddingPipeline) return embeddingPipeline;

  console.log(
    "[EMBEDDING] 🔄 Loading Xenova/multilingual-e5-small (first time only)..."
  );
  const startLoad = Date.now();

  try {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/multilingual-e5-small"
    );
    console.log(
      `[EMBEDDING] ✓ Model loaded successfully in ${Date.now() - startLoad}ms`
    );
    return embeddingPipeline;
  } catch (error) {
    console.error(
      "[EMBEDDING] ✗ Failed to load embedding model:",
      error.message
    );
    throw error;
  }
}

/**
 * Generate embeddings using Xenova/multilingual-e5-small (384 dimensions)
 */
async function getEmbedding(text) {
  console.log("[EMBEDDING] Generating embedding for text chunk...");

  // Use cached pipeline or initialize if not loaded
  const generateEmbedding = await initEmbeddingModel();

  const output = await generateEmbedding(text, {
    pooling: "mean",
    normalize: true,
  });
  const embedding = Array.from(output.data);
  console.log(
    `[EMBEDDING] ✓ Embedding generated (${embedding.length} dimensions)`
  );
  return embedding;
}

/**
 * Parse code file buffer and extract text
 * Code files are plain text, so we simply decode the buffer as UTF-8
 */
export function parseCodeFile(buffer) {
  console.log("[PARSING] Reading code file...");
  const text = buffer.toString("utf-8");
  console.log("[PARSING] ✓ Code file read successfully");
  console.log(`[PARSING] Extracted text length: ${text.length} characters`);
  return text;
}

/**
 * Split text into chunks for embedding
 */
export async function splitText(text) {
  console.log("[SPLITTING] Splitting text into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitText(text);
  console.log(`[SPLITTING] ✓ Text split into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Upload code file chunks to Supabase with embeddings
 */
export async function uploadDocument(codeBuffer, filename, session_id) {
  console.log("\n========================================");
  console.log("[UPLOAD] Starting code file upload...");
  console.log(`[UPLOAD] Filename: ${filename}`);
  console.log("========================================\n");

  // Parse code file
  const text = parseCodeFile(codeBuffer);

  // Split into chunks
  const chunks = await splitText(text);

  // Check file size to determine processing strategy
  const fileSizeKB = codeBuffer.length / 1024;
  const USE_BATCHING = fileSizeKB >= 10; // Batch for files >= 20KB
  const BATCH_SIZE = 32;
  const documents = [];
  const DB_INSERT_BATCH_SIZE = 100;
  let totalInserted = 0;

  if (USE_BATCHING) {
    // Large file: Use parallel batching for speed
    console.log(
      `\n[EMBEDDING] Large file (${fileSizeKB.toFixed(
        1
      )}KB) - using parallel batching...`
    );

    console.log("check filename in the database:");
    const { data: existingDocs, error: existingDocsError } = await supabase
      .from("documents")
      .select("id")
      .eq("session_id", session_id)
      .contains("metadata", { filename: filename })
      .limit(1);

    console.log("existingDocs", existingDocs);
    if (existingDocsError) {
      console.error(
        "[DATABASE] ✗ Failed to check existing documents:",
        existingDocsError.message
      );
      throw new Error(
        `Failed to check existing documents: ${existingDocsError.message}`
      );
    }

    if (existingDocs.length > 0) {
      console.log(
        `[DATABASE] ✓ Document with filename "${filename}" already exists in the database.`
      );
      return {
        success: false,
      };
    }

    for (
      let batchStart = 0;
      batchStart < chunks.length;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length);
      const batchChunks = chunks.slice(batchStart, batchEnd);
      let accumulatedDocs = [];

      console.log(
        `[EMBEDDING] Processing batch ${
          Math.floor(batchStart / BATCH_SIZE) + 1
        }/${Math.ceil(chunks.length / BATCH_SIZE)} (chunks ${
          batchStart + 1
        }-${batchEnd})...`
      );

      // Process batch in parallel
      const batchEmbeddings = await Promise.all(
        batchChunks.map((chunk) => getEmbedding(chunk))
      );

      // Add to documents array with metadata
      batchChunks.forEach((chunk, i) => {
        accumulatedDocs.push({
          content: chunk,
          embedding: batchEmbeddings[i],
          metadata: {
            filename: filename,
            chunk_index: batchStart + i,
            total_chunks: chunks.length,
          },
          session_id: session_id,
        });
      });
      //Cek Buffer DB udah cukup atau belum untuk di insert ke db

      if (
        accumulatedDocs.length >= DB_INSERT_BATCH_SIZE ||
        DB_INSERT_BATCH_SIZE + batchStart + 1 >= chunks.length
      ) {
        // Insert into Supabase
        console.log(
          `[DATABASE] Inserting batch of ${accumulatedDocs.length} rows to Supabase...`
        );
        const { error } = await supabase
          .from("documents")
          .insert(accumulatedDocs);

        if (error) {
          console.error(
            "[DATABASE] ✗ Failed to upload documents:",
            error.message
          );
          throw new Error(`Failed to upload documents: ${error.message}`);
        }
        totalInserted += accumulatedDocs.length;
        accumulatedDocs = []; // Kosongkan buffer setelah insert
      }

      console.log(
        "[EMBEDDING] ✓ All embeddings generated (parallel with batching)\n"
      );
    }
  } else {
    // Small file: Process sequentially (simpler, less memory)
    console.log(
      `\n[EMBEDDING] Small file (${fileSizeKB.toFixed(
        1
      )}KB) - processing sequentially...`
    );
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[EMBEDDING] Processing chunk ${i + 1}/${chunks.length}...`);
      const embedding = await getEmbedding(chunks[i]);

      documents.push({
        content: chunks[i],
        embedding: embedding,
        metadata: {
          filename: filename,
          chunk_index: i,
          total_chunks: chunks.length,
        },
        session_id: session_id,
      });
    }
    totalInserted += documents.length;
    console.log(`[DATABASE] Inserting ${totalInserted} rows to Supabase...`);
    const { error } = await supabase.from("documents").insert(documents);

    if (error) {
      console.error("[DATABASE] ✗ Failed to upload documents:", error.message);
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }
  console.log(`[DATABASE] ✓ Successfully inserted ${chunks.length} embeddings`);

  console.log("[EMBEDDING] ✓ All embeddings generated\n");

  console.log("\n========================================");
  console.log("[UPLOAD] ✓ Document upload complete!");
  console.log("========================================\n");

  return {
    success: true,
    filename: filename,
    chunks_count: chunks.length,
  };
}

/**
 * Query documents using similarity search and generate response
 * @param {string} queryText - The query/question
 * @param {string} chat_id - Chat ID for context
 * @param {number} topK - Number of documents to retrieve
 * @param {Array} existingHistory - Optional: pass existing history to avoid extra DB call
 */
export async function queryRAG(
  queryText,
  chat_id,
  topK = 5,
  existingHistory = null
) {
  console.log("\n========================================");
  console.log("[QUERY] Starting RAG query...");
  console.log(`[QUERY] Question: ${queryText}`);
  console.log("========================================\n");

  // Get query embedding
  console.log("[QUERY] Generating query embedding...");
  const queryEmbedding = await getEmbedding(queryText);
  console.log("[QUERY] ✓ Query embedding generated\n");

  // Search for similar documents using Supabase RPC
  console.log("[SEARCH] Performing similarity search...");
  const { data: documents, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: topK,
  });

  if (error) {
    console.error("[SEARCH] ✗ Similarity search failed:", error.message);
    throw new Error(`Similarity search fail ed: ${error.message}`);
  }

  if (!documents || documents.length === 0) {
    console.log("[SEARCH] No relevant documents found");
    return {
      answer: "No relevant documents found. Please upload a PDF first.",
      sources: [],
    };
  }

  console.log(`[SEARCH] ✓ Found ${documents.length} relevant documents`);
  documents.forEach((doc, i) => {
    console.log(
      `  - Source ${i + 1}: similarity ${(doc.similarity * 100).toFixed(1)}%`
    );
  });

  // Use provided history or fetch from DB
  let conversationHistory;
  if (existingHistory) {
    console.log(
      "[HISTORY] Using provided conversation history (no extra DB call)"
    );
    conversationHistory = existingHistory;
  } else {
    const history = await getMessages(chat_id);
    conversationHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Build context from retrieved documents
  const context = documents
    .map((doc, i) => `[Source ${i + 1}]: ${doc.content}`)
    .join("\n\n");
  const seen = new Set();
  const uploadedDocuments = documents
    .map((doc) => doc.metadata)
    .filter((meta) => {
      if (seen.has(meta.filename)) return false;
      seen.add(meta.filename);
      return true;
    });
  console.log("uploadedDocuments", uploadedDocuments[0].filename);
  // Generate response using LangChain LLM
  console.log("\n[LLM] Generating response with LangChain...");

  const systemPrompt = `You are a context-aware assistant.

Your task:
- Answer the user's question using ONLY the information provided in the Context.
- Do NOT use external knowledge or assumptions.

Rules:
- If the answer cannot be found in the Context, respond exactly with:
  "The information is not available in the provided context. Please upload a PDF first."
- Do NOT guess or hallucinate.
- Keep answers clear, concise, and factual.
- If the answer contains code parts, ALWAYS use the following format:
<code>
</code>
- DO NOT provide answers contains latex parts.
- When answering, ALWAYS cite the source(s) explicitly using:

  ${uploadedDocuments
    .filter((doc) => doc && doc.filename)
    .map((doc, i) => `Source ${i + 1}: ${doc.filename}`)
    .join(", ")}
- When mention sources, ALWAYS give the source file name.
Do not mention sources that are not relevant to the answer.`;

  // Build messages array for LangChain
  const messages = [
    new SystemMessage(systemPrompt),
    ...conversationHistory.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new SystemMessage(msg.content)
    ),
    new HumanMessage(`Context:\n${context}\n\nQuestion: ${queryText}`),
  ];

  const inferenceStart = Date.now();
  const response = await llm.invoke(messages);
  const inferenceTime = Date.now() - inferenceStart;
  const answer = response?.content;
  console.log(`[LLM] ✓ Response generated in ${inferenceTime}ms`);
  console.log("\n========================================");
  console.log("[QUERY] ✓ RAG query complete!");
  console.log(`[QUERY] ⏱️ LLM inference time: ${inferenceTime}ms`);
  console.log("========================================\n");

  return {
    answer: answer || "Failed to generate response",
    sources: documents.map((doc) => ({
      content: doc.content.substring(0, 200) + "...",
      filename: doc.metadata?.filename,
      similarity: doc.similarity,
    })),
  };
}

/**
 * List All documents from vectordb
 */
export async function listDocuments(sessionKey) {
  console.log("\n[LIST_DOCS] ========================================");
  console.log("[LIST_DOCS] Starting listDocuments...");
  console.log("[LIST_DOCS] Input session_key:", sessionKey);

  // Step 1: Get session ID from chat_sessions
  console.log("[LIST_DOCS] Step 1: Looking up session...");
  const { data: session, error: sessErr } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("session_key", sessionKey)
    .maybeSingle(); // FIX: Added parentheses!

  if (sessErr) {
    console.error("[LIST_DOCS] ✗ Session lookup failed:", sessErr.message);
    throw new Error(sessErr.message);
  }

  if (!session) {
    console.log("[LIST_DOCS] ✗ No session found for this session_key");
    return [];
  }

  console.log("[LIST_DOCS] ✓ Session found! ID:", session.id);

  // Step 2: Get documents by session_id
  console.log("[LIST_DOCS] Step 2: Fetching documents...");
  const { data, error } = await supabase
    .from("documents")
    .select("metadata")
    .eq("session_id", session.id);

  if (error) {
    console.error("[LIST_DOCS] ✗ Document fetch failed:", error.message);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.log("[LIST_DOCS] ✓ No documents found (empty)");
    return [];
  }

  console.log("[LIST_DOCS] ✓ Found", data.length, "document chunks");

  // Step 3: Deduplicate by filename
  console.log("[LIST_DOCS] Step 3: Deduplicating...");
  const seen = new Set();
  const documents = data
    .map((doc) => doc.metadata)
    .filter((meta) => {
      if (!meta || !meta.filename) return false; // Skip if no metadata
      if (seen.has(meta.filename)) return false;
      seen.add(meta.filename);
      return true;
    });

  console.log("[LIST_DOCS] ✓ Unique documents:", documents.length);
  console.log(
    "[LIST_DOCS] Files:",
    documents.map((d) => d.filename).join(", ")
  );
  console.log("[LIST_DOCS] ========================================\n");
  console.log("documents", documents);

  return documents;
}

/**
 * Delete all documents (for testing/cleanup)
 */
export async function clearDocuments() {
  console.log("[CLEANUP] Clearing all documents from database...");
  const { error } = await supabase.from("documents").delete().neq("id", 0);
  if (error) {
    console.error("[CLEANUP] ✗ Failed to clear documents:", error.message);
    throw new Error(`Failed to clear documents: ${error.message}`);
  }
  console.log("[CLEANUP] ✓ All documents cleared");
  return { success: true };
}

/**
 * Delete specific document by session_id and filename
 */
export async function deleteDocument(sessionId, filename) {
  console.log(
    "[DELETE_DOC] Deleting document:",
    filename,
    "from session:",
    sessionId
  );

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("session_id", sessionId)
    .filter("metadata->>filename", "eq", filename);

  if (error) {
    console.error("[DELETE_DOC] ✗ Failed to delete document:", error.message);
    throw new Error(`Failed to delete document: ${error.message}`);
  }

  console.log("[DELETE_DOC] ✓ Document deleted");
  return { success: true };
}
