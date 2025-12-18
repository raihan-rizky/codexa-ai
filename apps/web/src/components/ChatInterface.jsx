import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy, FaCheck } from "react-icons/fa";
import { getSessionKey } from "./actions/session_key";
import { postJSON } from "../lib/api";
import Sidebar from "./Sidebar/Sidebar";

import ThreeDot from "react-loading-indicators/ThreeDot";

const ChatInterface = () => {
  const [session, setSession] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState("code"); // "code" or "rag"
  const [title, setTitle] = useState([]);
  console.log("uploadedFiles", uploadedFiles);
  console.log("title", title);
  // Init: load session + chats + activeChat + messages + list documents
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSession(true);
        setError("");
        const session_key = getSessionKey();
        const data = await postJSON("/chat/session", { session_key });
        console.log(`data: ${data} , docs : ${data.docs}`);
        console.log(typeof data.chats.title);
        if (!mounted) return;
        setSession(data.session);
        setChats(data.chats || []);
        setActiveChat(data.activeChat);
        setMessages(data.messages || []);
        setMode(data.messages[0].meta.mode || "code");
        setUploadedFiles((prev) => [
          ...prev,
          ...data.docs.map((doc) => ({
            name: doc.filename,
            chunks: doc.total_chunks,
          })),
        ]);
        setTitle((prev) => [
          ...prev,
          ...data.chats.map((doc) => ({
            title: doc.title,
          })),
        ]);

        console.log(data);
        console.log("data_docs", data.docs);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
      } finally {
        if (mounted) setLoadingSession(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Send message to active chat with streaming
  async function onSend(e) {
    e?.preventDefault?.();
    if (!inputValue.trim() || sending || !activeChat?.id) return;

    const session_key = getSessionKey();
    const userText = inputValue.trim();
    const title = userText.split("\n")[0];

    setSending(true);
    setError("");
    setInputValue("");

    // Add optimistic user message
    const tempUserId = `temp-user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserId,
        role: "user",
        content: userText,
        created_at: new Date().toISOString(),
      },
    ]);

    // Add placeholder for AI response
    const tempAiId = `temp-ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempAiId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/send-stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_key,
            chat_id: activeChat.id,
            message: userText,
            mode,
            language,
            title,
          }),
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = ""; // Start empty - UI shows loading dots when empty

      while (true) {
        setSending(false);
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "chunk") {
                fullText += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAiId ? { ...m, content: fullText } : m
                  )
                );
              } else if (data.type === "done") {
                // Replace temp messages with final server messages
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAiId
                      ? { ...data.message, isStreaming: false }
                      : m
                  )
                );
              } else if (data.type === "user_saved") {
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempUserId ? data.message : m))
                );
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error("[ChatInterface] Stream error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiId
            ? {
                ...m,
                content: `Error: ${error.message}`,
                isError: true,
                isStreaming: false,
              }
            : m
        )
      );
      setError(error.message);
    } finally {
      setSending(false);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "60px";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  // Clean up documents when page is closed
  {
    /*
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery when page is closing
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE_URL}/documents/clear`
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
*/
  }
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle PDF upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const allowedExtensions = [".py", ".js", ".jsx", ".cpp"];
    if (!allowedExtensions.includes(ext)) {
      alert("Please upload a code file (.py, .js, .jsx, .cpp)");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("code", file);
      const session_key = getSessionKey();
      console.log("session_key", session_key);
      formData.append("session_key", session_key);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/upload-code`,
        {
          method: "POST",
          body: formData,
        }
      );
      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to upload code file");
      }

      const data = await response.json();
      setUploadedFiles((prev) => [
        ...prev,
        { name: file.name, chunks: data.chunks },
      ]);

      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: `✅ **${file.name}** uploaded successfully!\n\nProcessed ${data.chunks} text chunks. You can now switch to **RAG Mode** and ask questions about this code.`,
        },
      ]);

      // Auto-switch to RAG mode
      setMode("rag");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Create new chat in current session
  const handleNewChat = async () => {
    const session_key = getSessionKey();
    try {
      const data = await postJSON("/chat/new", {
        session_key,
        title: "New chat",
      });
      // Update sidebar list
      setChats((prev) => [data.chat, ...prev]);
      setActiveChat(data.chat);
      setMessages([]); // New chat = empty messages
      setInputValue("");
    } catch (e) {
      console.error("Failed to create new chat:", e);
      setError(e.message);
    }
  };

  // Switch to a different chat
  const openChat = async (chat) => {
    setActiveChat(chat);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/${chat.id}/messages`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to load chat messages:", e);
      setError(e.message);
    }
  };

  // Delete a chat
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent openChat from being called
    if (!confirm("Delete this chat?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat/${chatId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete chat");

      // Remove from state
      setChats((prev) => prev.filter((c) => c.id !== chatId));

      // If deleted chat was active, switch to another
      if (activeChat?.id === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId);
        if (remaining.length > 0) {
          openChat(remaining[0]);
        } else {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error("Failed to delete chat:", e);
      setError(e.message);
    }
  };

  // Delete a document
  const handleDeleteDocument = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      const session_key = getSessionKey();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/documents`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_key, filename }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete document");

      // Remove from state
      setUploadedFiles((prev) => prev.filter((f) => f.name !== filename));
    } catch (e) {
      console.error("Failed to delete document:", e);
      setError(e.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#112117] text-white font-['Spline_Sans',sans-serif] overflow-hidden antialiased">
      <Sidebar
        sidebarOpen={sidebarOpen}
        session={session}
        chats={chats}
        activeChat={activeChat}
        uploadedFiles={uploadedFiles}
        isUploading={isUploading}
        onNewChat={handleNewChat}
        onFileUpload={handleFileUpload}
        onDeleteDocument={handleDeleteDocument}
        onDeleteChat={handleDeleteChat}
        onOpenChat={openChat}
        isLoading={loadingSession}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen bg-[#112117] relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#254632] flex-shrink-0 z-10 bg-[#112117]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-white/60 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                {mode === "rag" ? "Document Q&A" : "Code Explainer"}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#36e27b]/10 text-[#36e27b] border border-[#36e27b]/20 hidden md:block">
                  {mode === "rag" ? "RAG Mode" : "Llama 3.3 70B"}
                </span>
              </h1>
              <p className="text-xs text-white/50">
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#1b3224] rounded-lg p-1 border border-[#254632]">
              <button
                onClick={() => setMode("code")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  mode === "code"
                    ? "bg-[#36e27b] text-[#122118]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setMode("rag")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  mode === "rag"
                    ? "bg-[#36e27b] text-[#122118]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                RAG
              </button>
            </div>

            {/* Language Selector (only in code mode) */}
            {mode === "code" && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#1b3224] border border-[#254632] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#36e27b]"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="typescript">TypeScript</option>
                <option value="c++">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            )}
            <button
              onClick={handleNewChat}
              className="text-white/60 hover:text-[#36e27b] transition-colors"
              title="New Chat"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Welcome Message */}
            {chats.length === 0 && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mt-1">
                  <span className="material-symbols-outlined text-lg">
                    smart_toy
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#1b3224] border border-[#254632] rounded-2xl rounded-tl-none p-4 shadow-sm">
                    {console.log("loading session", loadingSession)}
                    {loadingSession ? (
                      <ThreeDot
                        variant="pulsate"
                        color="#32cd32"
                        size="small"
                        text=""
                        textColor=""
                      />
                    ) : (
                      <div>
                        <p className="text-sm leading-relaxed text-white/90">
                          Hello! I&apos;m <strong>Codexa</strong>. I can help
                          you in two ways:
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-white/80">
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[#36e27b] text-sm mt-0.5">
                              code
                            </span>
                            <span>
                              <strong>Code Mode:</strong> Paste code and get
                              instant explanations
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[#36e27b] text-sm mt-0.5">
                              description
                            </span>
                            <span>
                              <strong>RAG Mode:</strong> Upload code files and
                              ask questions about them
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id ?? `${message.created_at}-${index}`}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full mt-1 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#36e27b] to-[#1b3224] border border-[#254632]"
                      : "bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b]"
                  }`}
                >
                  {message.role !== "user" && (
                    <span className="material-symbols-outlined text-lg">
                      smart_toy
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`flex flex-col gap-2 ${
                    message.role === "user"
                      ? "items-end max-w-[80%]"
                      : "max-w-2xl"
                  }`}
                >
                  <div
                    className={` text-wrap rounded-2xl p-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-[#36e27b] text-[#122118] rounded-tr-none"
                        : "bg-[#1b3224] border border-[#254632] rounded-tl-none"
                    }`}
                  >
                    {message.role === "user" ? (
                      <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </pre>
                    ) : message.content ? (
                      <div className="text-wrap prose prose-invert max-w-none text-sm text-white/90">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </Markdown>
                      </div>
                    ) : (
                      // Loading dots when AI content is empty
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    )}
                  </div>

                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 pl-2">
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        title="Copy"
                      >
                        {copiedIndex === index ? (
                          <FaCheck className="text-[#36e27b]" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator 
            {sending && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mt-1">
                  <span className="material-symbols-outlined text-lg">
                    smart_toy
                  </span>
                </div>
                <div className="bg-[#1b3224] border border-[#254632] rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1 w-16 h-10">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
              */}

            <div ref={messagesEndRef} className="h-4"></div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-[#112117] border-t border-[#254632]">
          <form onSubmit={onSend} className="max-w-3xl mx-auto relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#36e27b]/30 to-blue-500/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative flex flex-col gap-2 bg-[#1b3224] border border-[#254632] rounded-xl p-2 shadow-2xl">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(e);
                  }
                }}
                className="w-full bg-transparent border-0 text-white placeholder-white/40 focus:ring-0 focus:outline-none resize-none px-4 py-3 min-h-[60px] max-h-[200px] font-mono text-sm"
                placeholder={
                  mode === "rag"
                    ? "Ask a question about your documents..."
                    : "Paste your code here... (Press Enter to send)"
                }
                disabled={sending}
              />
              {/* Hidden file input for upload button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".py,.js,.jsx,.cpp"
                className="hidden"
              />
              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-[#36e27b] transition-colors disabled:opacity-50"
                    title="Upload Code"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      upload_file
                    </span>
                  </button>
                  <span className="text-xs text-white/40 px-2">
                    {mode === "rag" ? "RAG MODE" : language.toUpperCase()}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sending || !activeChat?.id}
                  onClick={onSend}
                  className="flex items-center justify-center p-2 rounded-lg bg-[#36e27b] text-[#122118] hover:bg-opacity-90 transition-colors shadow-[0_0_10px_rgba(54,226,123,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_upward
                  </span>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/30 mt-3">
              {mode === "rag"
                ? "RAG uses Supabase pgvector for semantic search"
                : "Codexa uses Llama 3.3 70B"}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
