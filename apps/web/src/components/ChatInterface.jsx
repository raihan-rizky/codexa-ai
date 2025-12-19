import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy, FaCheck } from "react-icons/fa";
import { getSessionKey } from "./actions/session_key";
import { postJSON } from "../lib/api";
import Sidebar from "./Sidebar/Sidebar";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atelierDuneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ThreeDot from "react-loading-indicators/ThreeDot";
import { extractText } from "./actions/extractText";
import { languageMap } from "../lib/language_map";
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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [retryAction, setRetryAction] = useState(null); // Function to retry on error
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [mode, setMode] = useState("code"); // "code" or "rag"
  const [title, setTitle] = useState([]);
  console.log("uploadedFiles", uploadedFiles);
  console.log("title", title);

  // Helper to show error popup with retry action
  const showError = (message, retryFn = null) => {
    setError(message);
    setRetryAction(() => retryFn);
    setShowErrorPopup(true);
  };

  // Load session function (reusable for retry)
  const loadSession = async () => {
    try {
      setLoadingSession(true);
      setError("");
      setShowErrorPopup(false);
      const session_key = getSessionKey();
      const data = await postJSON("/chat/session", { session_key });
      console.log(`data: ${data} , docs : ${data.docs}`);
      console.log(typeof data.chats.title);
      setSession(data.session);
      setChats(data.chats || []);
      setActiveChat(data.activeChat);
      setMessages(data.messages || []);
      setMode(data.messages[0]?.meta?.mode || "code");
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
      showError(e.message, loadSession);
    } finally {
      setLoadingSession(false);
    }
  };

  // Init: load session + chats + activeChat + messages + list documents
  useEffect(() => {
    loadSession();
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
          content: `✅ **${file.name}** uploaded successfully!\n\nProcessed ${data.chunks} text chunks. Automatically switch to **RAG Mode**. You can now ask questions about this file code.`,
        },
      ]);

      // Auto-switch to RAG mode
      setMode("rag");
    } catch (error) {
      showError(`Upload failed: ${error.message}`, () =>
        fileInputRef.current?.click()
      );
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
    setIsCreatingChat(true);
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
      showError(e.message, handleNewChat);
    } finally {
      setIsCreatingChat(false);
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
      showError(e.message, () => openChat(chat));
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
      showError(e.message, null);
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
      showError(e.message, null);
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

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1b3224] border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-500/10 flex flex-col items-center gap-4 max-w-sm mx-4 animate-scaleIn">
            {/* Error Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-red-500">
                error
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white">
              {retryAction ? "Request Failed" : "Error"}
            </h3>

            {/* Error Message */}
            <p className="text-sm text-white/60 text-center">
              {error || "Something went wrong. Please try again."}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-2 w-full">
              <button
                onClick={() => {
                  setShowErrorPopup(false);
                  setRetryAction(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#254632] text-white/80 font-medium hover:bg-[#2d5a3d] transition-colors text-sm"
              >
                {retryAction ? "Cancel" : "Close"}
              </button>
              {retryAction && (
                <button
                  onClick={() => {
                    setShowErrorPopup(false);
                    retryAction();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#36e27b] text-[#122118] font-bold hover:bg-[#2bc968] transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  Try Again
                </button>
              )}
            </div>
          </div>

          {/* Animation styles */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
          `}</style>
        </div>
      )}

      {/* Loading Popup for Creating New Chat */}
      {isCreatingChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1b3224] border border-[#36e27b]/30 rounded-2xl p-8 shadow-2xl shadow-[#36e27b]/10 flex flex-col items-center gap-4 animate-scaleIn">
            {/* Animated Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#254632]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#36e27b] animate-spin"></div>
              <div
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#36e27b]/50 animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            {/* Message */}
            <p className="text-white/90 font-medium text-sm">
              Creating new chat...
            </p>
            <p className="text-white/40 text-xs">Please wait</p>
          </div>
        </div>
      )}

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
              <h1 className="text-base min-sm hidden md:flex font-bold text-white items-center gap-2">
                {mode === "rag" ? "Document Q&A" : "Code Explainer"}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#36e27b]/10 text-[#36e27b] border border-[#36e27b]/20 hidden md:block">
                  {mode === "rag" ? "RAG Mode" : "Llama 3.3 70B"}
                </span>
              </h1>
              <p className="text-xs hidden md:block text-white/50">
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mode Toggle with Animation */}
            <div className="relative flex items-center gap-1 bg-[#1b3224] rounded-lg p-1 border border-[#254632]">
              {/* Sliding Background Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-md transition-all duration-300 ease-out ${
                  mode === "code" ? "left-1" : "left-[calc(50%+1px)]"
                } ${
                  mode === "rag"
                    ? "bg-gradient-to-r from-[#36e27b] to-[#22d3ee] shadow-[0_0_15px_rgba(54,226,123,0.5)]"
                    : "bg-[#36e27b]"
                }`}
                style={{
                  animation:
                    mode === "rag"
                      ? "pulse-glow 2s ease-in-out infinite"
                      : "none",
                }}
              ></div>

              <button
                onClick={() => setMode("code")}
                className={`relative z-10 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${
                  mode === "code"
                    ? "text-[#122118] scale-105"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    code
                  </span>
                  Code
                </span>
              </button>

              <button
                onClick={() => setMode("rag")}
                className={`relative z-10 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${
                  mode === "rag"
                    ? "text-[#122118] scale-105"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      mode === "rag" ? "animate-pulse" : ""
                    }`}
                  >
                    auto_awesome
                  </span>
                  RAG
                </span>
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className="md:hidden flex items-center gap-1 text-white/60 hover:text-[#36e27b] transition-colors"
              title="New Chat"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth custom-scrollbar">
          <div className="max-w-[20rem] md:max-w-[30rem] lg:max-w-[40rem] xl:max-w-[50rem]  mx-auto flex flex-col gap-8">
            {/* Welcome Message */}
            {messages.length === 0 && (
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
                  className={`hidden md:flex flex-shrink-0 w-8 h-8 rounded-full mt-1 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#36e27b] to-[#1b3224] border border-[#254632]"
                      : "bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b]"
                  }`}
                >
                  {message.role !== "user" && (
                    <span className="hidden material-symbols-outlined text-lg">
                      smart_toy
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`flex max-w-[100%] md:max-w-[80%] xl:max-w-[88%] flex-col gap-2 ${
                    message.role === "user"
                      ? "items-end max-w-[100%]"
                      : "max-w-3xl"
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
                      <div className="whitespace-pre-wrap text-sm prose prose-invert lg:text-sm text-white/90">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            pre: ({ children }) => {
                              const codeEl = Array.isArray(children)
                                ? children[0]
                                : children;
                              if (!codeEl?.props) return null;

                              // Ambil isi <code> jadi string murni
                              const codeString = extractText(
                                codeEl.props.children
                              );
                              console.log("codeString :", codeString);
                              console.log(
                                "type of codeString :",
                                typeof codeString
                              );

                              const className = codeEl.props.className || "";
                              const match = /language-([a-z0-9-]+)/i.exec(
                                className
                              );
                              const language = match?.[1] || "text";

                              const terminal_language = languageMap(language);
                              console.log("codeEl.className:", className);
                              console.log("language :", language);

                              return (
                                <div className="terminal-container my-3 rounded-lg overflow-hidden border border-[#36e27b]/20 shadow-[0_0_15px_rgba(54,226,123,0.1)] animate-fadeIn">
                                  {/* Terminal Header */}
                                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1a12] border-b border-[#254632]">
                                    <div className="flex gap-1.5">
                                      <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_5px_#ff5f56]" />
                                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_#ffbd2e]" />
                                      <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_5px_#27c93f]" />
                                    </div>
                                    <span className="ml-2 text-[10px] text-white/40 font-mono">
                                      {terminal_language}
                                    </span>
                                  </div>

                                  {/* Terminal Body */}
                                  <div className="relative max-w-full overflow-x-auto bg-[#0a1510] p-4 font-mono">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
                                    <SyntaxHighlighter
                                      language={language}
                                      style={atelierDuneDark}
                                      customStyle={{
                                        margin: 0,
                                        background: "transparent",
                                        padding: 0,
                                      }}
                                      codeTagProps={{
                                        className:
                                          "font-mono text-xs text-white",
                                      }}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                  </div>
                                </div>
                              );
                            },

                            code: ({ inline, children, ...props }) => {
                              // ⛔ penting: block code biarkan pre yang handle (hindari double render)
                              if (inline) {
                                return (
                                  <code className=" whitespace-pre text-xs text-[#36e27b] relative">
                                    {" "}
                                    <span className="inline-block animate-pulse">
                                      {" "}
                                      {" >"}{" "}
                                    </span>{" "}
                                    {children}{" "}
                                  </code>
                                );
                              }

                              return (
                                <code
                                  className="bg-[#36e27b]/10 text-[#36e27b] px-1.5 py-0.5 rounded border border-[#36e27b]/20 text-xs font-mono"
                                  {...props}
                                >
                                  {extractText(children)}
                                </code>
                              );
                            },
                          }}
                        >
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
              <div className="flex  items-center justify-between px-2 pb-1">
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

                  {/* Language Selector (only in code mode) */}
                  {mode === "code" && (
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#0d1a12] border border-[#254632] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#36e27b]"
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

                  {mode === "rag" && (
                    <span className="text-xs text-white/40 px-2">RAG MODE</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || sending || !activeChat?.id}
                  onClick={onSend}
                  className=" flex items-center justify-center p-2 rounded-lg bg-[#36e27b] text-[#122118] hover:bg-opacity-90 transition-colors shadow-[0_0_10px_rgba(54,226,123,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #112117;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #36e27b40, #254632);
          border-radius: 10px;
          border: 1px solid #254632;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #36e27b80, #36e27b40);
          box-shadow: 0 0 10px rgba(54, 226, 123, 0.4);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #36e27b40 #112117;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(54, 226, 123, 0.5);
          }
          50% {
            box-shadow: 0 0 25px rgba(54, 226, 123, 0.8), 0 0 40px rgba(34, 211, 238, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
