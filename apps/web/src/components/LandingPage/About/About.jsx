const About = () => {
  return (
    <section
      id="about"
      className="w-full px-4 py-20 bg-[#1b3224]/30 border-y border-[#254632]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Mission Statement */}
        <div className="text-center mb-16">
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
              diversity_3
            </span>
            <span className="text-sm font-medium text-[#36e27b] relative z-10">
              Our Mission
            </span>
          </div>
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
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 max-w-4xl mx-auto">
            {"We're building a world where anyone can "}
            <span className="text-[#36e27b]">understand any code</span>
          </h2>
          <p className="text-white/70 text-lg max-w-3xl mx-auto leading-relaxed">
            Codexa uses Conversational AI to help developers, students, and
            curious minds understand complex code instantly. We make
            expert-level code explanations accessible to everyone, anytime.
          </p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Our Story
            </h3>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                We started Codexa because understanding code is hard. Whether
                you{"'"}re a student learning to program, a developer joining a
                new team, or someone trying to understand a complex codebase—you
                deserve clarity.
              </p>
              <p>
                Traditional documentation is often outdated or incomplete.
                Senior developers are limited by time. Knowledge stays locked in
                codebases, unreachable to most who need it.
              </p>
              <p>
                <span className="text-[#36e27b] font-semibold">
                  AI changes this.
                </span>{" "}
                With RAG-powered analysis, we can now help thousands understand
                code at once. Upload any file, ask any question, get instant
                clarity.
              </p>
              <p>
                Today, Codexa is building the platform where code understanding
                is no longer a barrier. {"We're"} creating a world where
                learning from the best is no longer a privilege—
                {"it's"} a reality for everyone.
              </p>
            </div>
          </div>

          {/* Founder Card */}
          <div className="flex items-center justify-center">
            <div className="relative group">
              {/* Animated Glow Effect */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-50 blur-[60px] -z-10"
                style={{
                  background:
                    "radial-gradient(circle, #36e27b 0%, #22d3ee 50%, transparent 70%)",
                  animation: "glow-rotate 8s linear infinite",
                }}
              ></div>

              {/* Card with animated border */}
              <div
                className="relative p-[2px] rounded-3xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #36e27b, #22d3ee, #a855f7, #36e27b)",
                  backgroundSize: "300% 300%",
                  animation: "shimmer-border 4s ease infinite",
                }}
              >
                <div className="p-8 rounded-3xl bg-[#112117]/95 backdrop-blur-xl">
                  <div className="flex flex-col items-center text-center">
                    {/* Animated Avatar */}
                    <div
                      className="relative w-32 h-32 rounded-full p-[3px] mb-6"
                      style={{
                        background:
                          "linear-gradient(135deg, #36e27b, #22d3ee, #36e27b)",
                        backgroundSize: "200% 200%",
                        animation: "shimmer-border 3s ease infinite",
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full bg-[#112117] flex items-center justify-center"
                        style={{
                          animation: "pulse-glow 2s ease-in-out infinite",
                        }}
                      >
                        <span className="material-symbols-outlined text-[#36e27b] text-6xl">
                          person
                        </span>
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-[#36e27b] border-2 border-[#112117] animate-pulse"></div>
                    </div>

                    {/* Animated Badge */}
                    <div
                      className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(90deg, #36e27b, #22d3ee, #36e27b)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-border 3s ease infinite",
                      }}
                    >
                      <div className="absolute inset-[1px] rounded-full bg-[#112117]"></div>
                      <span className="material-symbols-outlined text-[#36e27b] text-sm relative z-10">
                        star
                      </span>
                      <span className="text-xs font-bold text-[#36e27b] relative z-10">
                        Founder & Creator
                      </span>
                    </div>

                    {/* Name with gradient */}
                    <h4
                      className="text-2xl font-black mb-1 text-transparent bg-clip-text"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #ffffff, #36e27b, #ffffff)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-border 4s ease infinite",
                      }}
                    >
                      Raihan Rizki Dwiputra
                    </h4>
                    <p className="text-[#22d3ee] font-medium mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse"></span>
                      Physics Graduate • Tech Enthusiast
                    </p>

                    {/* Bio */}
                    <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
                      Combining{" "}
                      <span className="text-[#36e27b] font-semibold">
                        scientific thinking
                      </span>{" "}
                      with
                      <span className="text-[#22d3ee] font-semibold">
                        {" "}
                        software engineering
                      </span>{" "}
                      to make code understanding accessible to everyone.
                    </p>

                    {/* Animated Skills Tags */}
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-[#36e27b]/10 border border-[#36e27b]/30 text-xs text-[#36e27b] font-medium">
                        ⚛️ Physics
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-xs text-[#22d3ee] font-medium">
                        🤖 AI/ML
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-xs text-[#a855f7] font-medium">
                        💻 Full Stack
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs text-[#f59e0b] font-medium">
                        🔍 RAG Systems
                      </span>
                    </div>

                    {/* Social Links Placeholder */}
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
                      <a
                        href="https://github.com/raihan-rizky"
                        className="text-white/40 hover:text-[#36e27b] transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/raihan-rizki/"
                        className="text-white/40 hover:text-[#22d3ee] transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="https://x.com/raihnrz"
                        className="text-white/40 hover:text-[#a855f7] transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animation keyframes */}
              <style>{`
                @keyframes shimmer-border {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes pulse-glow {
                  0%, 100% { box-shadow: 0 0 20px rgba(54, 226, 123, 0.3); }
                  50% { box-shadow: 0 0 40px rgba(54, 226, 123, 0.5), 0 0 60px rgba(34, 211, 238, 0.3); }
                }
                @keyframes glow-rotate {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Values/Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#112117] border border-[#254632] text-center">
            <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mx-auto mb-4">
              <span className="material-symbols-outlined">
                accessibility_new
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              Accessibility First
            </h4>
            <p className="text-white/60 text-sm">
              Code understanding should be available to everyone, regardless of
              experience level.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#112117] border border-[#254632] text-center">
            <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mx-auto mb-4">
              <span className="material-symbols-outlined">psychology_alt</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              AI-Powered Clarity
            </h4>
            <p className="text-white/60 text-sm">
              Leveraging cutting-edge AI to provide accurate, context-aware
              explanations.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#112117] border border-[#254632] text-center">
            <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] mx-auto mb-4">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              Continuous Innovation
            </h4>
            <p className="text-white/60 text-sm">
              Always pushing boundaries to make code learning faster and more
              intuitive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
