import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy, FaCheck } from "react-icons/fa";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      language: language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/explain-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: inputValue, language }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();
      const aiMessage = {
        type: "ai",
        content: data.explanation,
        language: data.language,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: `Error: ${error.message}. Please try again.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
  };

  return (
    <div className="flex h-screen w-full bg-[#112117] text-white font-['Spline_Sans',sans-serif] overflow-hidden antialiased">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 w-72 bg-[#1b3224] border-r border-[#254632] flex flex-col h-full transition-transform duration-300`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center size-8 text-[#36e27b]">
              <span className="material-symbols-outlined text-3xl">code</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              CodeExplainAI
            </h2>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[#36e27b] text-[#122118] font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity mb-8 shadow-[0_0_15px_rgba(54,226,123,0.2)]"
          >
            <span className="material-symbols-outlined">add</span>
            New Chat
          </button>

          {/* Chat History */}
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                Today
              </h3>
              <nav className="flex flex-col gap-1">
                {messages.length > 0 && (
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-[#254632] text-white/90 text-sm font-medium"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-[#36e27b] text-[18px]">
                      chat_bubble
                    </span>
                    <span className="truncate">Current Session</span>
                  </a>
                )}
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                Quick Actions
              </h3>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    home
                  </span>
                  <span className="truncate">Back to Home</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-auto pt-4 border-t border-[#254632]">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#36e27b] to-[#1b3224] border border-[#254632]"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  Developer
                </p>
                <p className="text-xs text-white/50 truncate">Free Plan</p>
              </div>
              <span className="material-symbols-outlined text-white/40 text-[20px]">
                settings
              </span>
            </div>
          </div>
        </div>
      </aside>

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
                Code Explainer
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#36e27b]/10 text-[#36e27b] border border-[#36e27b]/20">
                  Llama 3.3 70B
                </span>
              </h1>
              <p className="text-xs text-white/50">
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Selector */}
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
            {messages.length === 0 && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mt-1">
                  <span className="material-symbols-outlined text-lg">
                    smart_toy
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#1b3224] border border-[#254632] rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-white/90">
                      Hello! I&apos;m <strong>CodeExplainAI</strong>, your
                      personal code assistant. Paste any code snippet below and
                      I&apos;ll explain it in simple terms. Select your
                      programming language from the dropdown above for better
                      accuracy!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.type === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full mt-1 ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-[#36e27b] to-[#1b3224] border border-[#254632]"
                      : "bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b]"
                  }`}
                >
                  {message.type === "ai" && (
                    <span className="material-symbols-outlined text-lg">
                      smart_toy
                    </span>
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col gap-2 ${
                    message.type === "user"
                      ? "items-end max-w-[80%]"
                      : "max-w-2xl"
                  }`}
                >
                  <div
                    className={`rounded-2xl p-4 shadow-sm ${
                      message.type === "user"
                        ? "bg-[#36e27b] text-[#122118] rounded-tr-none"
                        : message.isError
                        ? "bg-red-900/30 border border-red-500/30 rounded-tl-none"
                        : "bg-[#1b3224] border border-[#254632] rounded-tl-none"
                    }`}
                  >
                    {message.type === "user" ? (
                      <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </pre>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm text-white/90">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </Markdown>
                      </div>
                    )}
                  </div>

                  {/* Action buttons for AI messages */}
                  {message.type === "ai" && !message.isError && (
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

            {/* Loading indicator */}
            {isLoading && (
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

            <div ref={messagesEndRef} className="h-4"></div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-[#112117] border-t border-[#254632]">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto relative group"
          >
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
                    handleSubmit(e);
                  }
                }}
                className="w-full bg-transparent border-0 text-white placeholder-white/40 focus:ring-0 focus:outline-none resize-none px-4 py-3 min-h-[60px] max-h-[200px] font-mono text-sm"
                placeholder="Paste your code here... (Press Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 px-2">
                    {language.toUpperCase()}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex items-center justify-center p-2 rounded-lg bg-[#36e27b] text-[#122118] hover:bg-opacity-90 transition-colors shadow-[0_0_10px_rgba(54,226,123,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_upward
                  </span>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/30 mt-3">
              CodeExplainAI uses Llama 3.3 70B. Responses may not always be
              accurate.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
