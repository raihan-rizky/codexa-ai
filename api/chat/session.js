import { handleCors } from "../_lib/cors.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } }
);

// Get or create session
async function ensureSession(sessionKey) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .upsert(
      { session_key: sessionKey, last_active_at: new Date().toISOString() },
      { onConflict: "session_key", ignoreDuplicates: false }
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// List chats for session
async function listChats(sessionId) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("session_id", sessionId)
    .order("last_active_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

// Create a new chat
async function createChat(sessionId, title) {
  const { data, error } = await supabase
    .from("chats")
    .insert({ session_id: sessionId, title: title || "New chat" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Get messages for a chat
async function getMessages(chatId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

// List documents for session
async function listDocuments(sessionKey) {
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("session_key", sessionKey)
    .maybeSingle();

  if (!session) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("metadata")
    .eq("session_id", session.id);

  if (error || !data) return [];

  const seen = new Set();
  return data
    .map((doc) => doc.metadata)
    .filter((meta) => {
      if (!meta || !meta.filename) return false;
      if (seen.has(meta.filename)) return false;
      seen.add(meta.filename);
      return true;
    });
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session_key } = req.body;
    if (!session_key) {
      return res.status(400).json({ error: "session_key is required" });
    }

    const session = await ensureSession(session_key);
    let chats = await listChats(session.id);

    // Auto-create first chat if none exist
    let activeChat = chats[0];
    if (!activeChat) {
      activeChat = await createChat(session.id, "New chat");
      chats = [activeChat];
    }

    const messages = await getMessages(activeChat.id);
    const docs = await listDocuments(session_key);

    return res.status(200).json({
      success: true,
      session,
      chats,
      activeChat,
      messages,
      docs,
    });
  } catch (err) {
    console.error("Chat Session Error:", err);
    return res.status(500).json({
      error: "Failed to load session",
      details: err.message,
    });
  }
}
