import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Loading Popup Component
const LoadingPopup = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1b3224] border border-[#36e27b]/30 rounded-2xl p-8 shadow-2xl shadow-[#36e27b]/10 flex flex-col items-center gap-4 animate-scaleIn">
        {/* Animated Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#254632]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#36e27b] animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#36e27b]/50 animate-spin-reverse"></div>
        </div>
        {/* Message */}
        <p className="text-white/90 font-medium text-sm">{message}</p>
        <p className="text-white/40 text-xs">Please wait...</p>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
      `}</style>
    </div>
  );
};

const Sidebar = ({
  sidebarOpen,
  chats = [],
  activeChat,
  uploadedFiles = [],
  isUploading,
  onNewChat,
  onFileUpload,
  onDeleteDocument,
  onDeleteChat,
  onOpenChat,
  isLoading,
}) => {
  const fileInputRef = useRef(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);

  // Handle new chat with loading state
  const handleNewChatClick = async () => {
    setIsCreatingChat(true);
    try {
      await onNewChat();
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle switching to another chat with loading state
  const handleOpenChatClick = async (chat) => {
    if (activeChat?.id === chat.id) return; // Already on this chat
    setIsSwitchingChat(true);
    try {
      await onOpenChat(chat);
    } finally {
      setIsSwitchingChat(false);
    }
  };

  return (
    <>
      {/* Loading Popups */}
      <LoadingPopup isVisible={isCreatingChat} message="Creating new chat..." />
      <LoadingPopup
        isVisible={isUploading}
        message="Uploading and processing code..."
      />
      <LoadingPopup isVisible={isSwitchingChat} message="Loading chat..." />
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 w-72 bg-[#1b3224] border-r border-[#254632] flex flex-col h-full transition-transform duration-300`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="container flex items-center justify-center  w-60 h-10 mb-4 gap-3 ">
            <img
              src="images/logo-image.png"
              width="150"
              height="150"
              alt="logo-image"
              className="object-cover"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChatClick}
            disabled={isCreatingChat}
            className="w-full flex items-center justify-center gap-2 bg-[#36e27b] text-[#122118] font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity mb-4 shadow-[0_0_15px_rgba(54,226,123,0.2)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add</span>
            New Chat
          </button>

          {/* Upload Code Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            accept=".py,.js,.jsx,.cpp"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-[#254632] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#2d5a3d] transition-colors mb-8 border border-[#254632] disabled:opacity-50"
          >
            <span className="material-symbols-outlined">
              {isUploading ? "hourglass_empty" : "upload_file"}
            </span>
            {isUploading ? "Uploading..." : "Upload Code"}
          </button>

          {/* Uploaded Files */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
              Uploaded Documents
            </h3>
            <nav className="flex flex-col gap-1">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-[#254632] text-white/90 text-sm"
                    >
                      <Skeleton circle width={18} height={18} />
                      <div className="flex-1">
                        <Skeleton width="80%" />
                      </div>
                    </div>
                  ))
              ) : uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-[#254632] text-white/90 text-sm group"
                  >
                    <span className="material-symbols-outlined text-[#36e27b] text-[18px]">
                      description
                    </span>
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-white/40">
                      {file.chunks} chunks
                    </span>
                    <button
                      onClick={() => onDeleteDocument(file.name)}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-white/30 italic">
                  No documents uploaded
                </div>
              )}
            </nav>
          </div>

          {/* Chat History */}
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                Chats
              </h3>
              <nav className="flex flex-col gap-1">
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="px-3 py-2">
                        <Skeleton height={24} />
                      </div>
                    ))
                ) : chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleOpenChatClick(chat)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors group cursor-pointer ${
                        activeChat?.id === chat.id
                          ? "bg-white/10 text-white border border-[#36e27b]/30"
                          : "hover:bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#36e27b] text-[18px]">
                        chat_bubble
                      </span>
                      <span className="truncate flex-1">
                        {chat.title || "Untitled"}
                      </span>
                      <button
                        onClick={(e) => onDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
                        title="Delete chat"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-white/30 italic">
                    No chats yet
                  </div>
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
