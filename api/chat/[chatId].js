import { handleCors } from "../_lib/cors.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { chatId } = req.query;

  if (req.method === "GET") {
    // Get messages for a chat
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      res.json({ success: true, messages: data || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "DELETE") {
    // Delete a chat
    try {
      const { error } = await supabase.from("chats").delete().eq("id", chatId);
      if (error) throw new Error(error.message);
      res.json({ success: true, message: "Chat deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
