const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full px-4 py-20 max-w-7xl">
      <div className="flex flex-col items-center gap-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl">
          {/* Mission Statement */}
          <div
            className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b3224] mb-6 overflow-hidden"
            style={{ animation: "badge-pulse 3s ease-in-out infinite" }}
          >
            {/* Animated border gradient */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #36e27b, #22d3ee, #a855f7, #36e27b)",
                backgroundSize: "300% 100%",
                animation: "border-flow 4s linear infinite",
                padding: "1px",
              }}
            >
              <div className="absolute inset-[1px] rounded-full bg-[#1b3224]"></div>
            </div>
            {/* Content */}
            <span className="material-symbols-outlined text-[#36e27b] text-sm relative z-10">
              upload_file
            </span>
            <span className="text-sm font-medium text-[#36e27b] relative z-10">
              RAG-Powered
            </span>
            <style>{`
            @keyframes border-flow {
              0% { background-position: 0% 50%; }
              100% { background-position: 300% 50%; }
            }
            @keyframes badge-pulse {
              0%, 100% { box-shadow: 0 0 20px rgba(54, 226, 123, 0.3); }
              50% { box-shadow: 0 0 35px rgba(54, 226, 123, 0.5), 0 0 60px rgba(54, 226, 123, 0.2); }
            }
          `}</style>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Upload Any Code File.
            <br />
            <span className="text-[#36e27b]">Get Instant Clarity.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Codexa uses Retrieval-Augmented Generation to deeply understand your
            code and provide accurate, context-aware explanations.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Step 1 */}
          <div className="relative group">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:-left-4 md:translate-x-0 w-10 h-10 rounded-full bg-[#36e27b] flex items-center justify-center text-[#112117] font-bold text-lg shadow-[0_0_20px_rgba(54,226,123,0.4)] z-10">
              1
            </div>
            <div className="h-full p-6 pt-8 rounded-2xl bg-gradient-to-br from-[#1b3224] to-[#112117] border border-[#254632] hover:border-[#36e27b]/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  cloud_upload
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Upload Your Code
              </h3>
              <p className="text-white/60 leading-relaxed">
                Drag & drop or click to upload any coding file—
                <span className="text-[#36e27b]">.py, .js, .jsx, .cpp</span>,
                and more. No size limits, no formatting required.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-md bg-[#254632] text-xs text-white/80">
                  Python
                </span>
                <span className="px-2 py-1 rounded-md bg-[#254632] text-xs text-white/80">
                  JavaScript
                </span>
                <span className="px-2 py-1 rounded-md bg-[#254632] text-xs text-white/80">
                  C++
                </span>
                <span className="px-2 py-1 rounded-md bg-[#254632] text-xs text-white/80">
                  Java
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:-left-4 md:translate-x-0 w-10 h-10 rounded-full bg-[#36e27b] flex items-center justify-center text-[#112117] font-bold text-lg shadow-[0_0_20px_rgba(54,226,123,0.4)] z-10">
              2
            </div>
            <div className="h-full p-6 pt-8 rounded-2xl bg-gradient-to-br from-[#1b3224] to-[#112117] border border-[#254632] hover:border-[#36e27b]/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">
                  psychology
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                AI Processes & Indexes
              </h3>
              <p className="text-white/60 leading-relaxed">
                The RAG engine intelligently chunks your code, creates
                embeddings, and indexes it for lightning-fast semantic search
                and retrieval.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-[#112117] border border-[#254632]">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="material-symbols-outlined text-[#36e27b] text-sm">
                    memory
                  </span>
                  <span>Semantic chunking enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:-left-4 md:translate-x-0 w-10 h-10 rounded-full bg-[#36e27b] flex items-center justify-center text-[#112117] font-bold text-lg shadow-[0_0_20px_rgba(54,226,123,0.4)] z-10">
              3
            </div>
            <div className="h-full p-6 pt-8 rounded-2xl bg-gradient-to-br from-[#1b3224] to-[#112117] border border-[#254632] hover:border-[#36e27b]/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Ask & Get Answers
              </h3>
              <p className="text-white/60 leading-relaxed">
                Ask anything about your code in natural language. Get detailed,
                accurate explanations with context from your actual codebase.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-[#112117] border border-[#36e27b]/30">
                <p className="text-xs text-white/80 italic">
                  {'"What does the handleSubmit function do?"'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-[#1b3224] via-[#112117] to-[#1b3224] border border-[#254632]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#36e27b]">
                bolt
              </span>
              <span className="text-white/80">Instant Processing</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#36e27b]">
                security
              </span>
              <span className="text-white/80">Secure & Private</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#36e27b]">
                all_inclusive
              </span>
              <span className="text-white/80">Unlimited Uploads</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#36e27b]">
                history
              </span>
              <span className="text-white/80">Chat History Saved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
