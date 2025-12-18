import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#112117] text-white font-['Spline_Sans',sans-serif] overflow-x-hidden antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#112117]/80 border-b border-solid border-[#254632]">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 text-[#36e27b]">
              <span className="material-symbols-outlined text-3xl">code</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              CodeExplainAI
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-sm font-medium hover:text-[#36e27b] transition-colors"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-medium hover:text-[#36e27b] transition-colors"
              href="#testimonials"
            >
              Testimonials
            </a>
            <a
              className="text-sm font-medium hover:text-[#36e27b] transition-colors"
              href="#about"
            >
              About
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#36e27b] text-[#122118] text-sm font-bold hover:bg-opacity-90 transition-all shadow-[0_0_15px_rgba(54,226,123,0.3)]"
            >
              <span className="truncate">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full px-4 py-12 md:py-20 lg:py-24 max-w-7xl">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            {/* Hero Text */}
            <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b3224] border border-[#254632] w-fit mx-auto lg:mx-0">
                  <span className="material-symbols-outlined text-[#36e27b] text-sm">
                    auto_awesome
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    Powered by Llama 3.3 70B
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70">
                  Understand Any Code in Seconds.
                </h1>
                <h2 className="text-base md:text-lg font-normal text-white/70 max-w-xl mx-auto lg:mx-0">
                  Type your code and get clear, instant explanations—powered by
                  AI.
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/app"
                  className="flex h-12 px-8 items-center justify-center rounded-full bg-[#36e27b] text-[#122118] text-base font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(54,226,123,0.4)]"
                >
                  Try for Free
                </Link>
                <button className="flex h-12 px-8 items-center justify-center rounded-full bg-[#1b3224] border border-[#254632] text-white text-base font-bold hover:bg-[#254632] transition-colors">
                  <span className="material-symbols-outlined mr-2 text-[#36e27b]">
                    play_circle
                  </span>
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4 opacity-80 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#112117] bg-gradient-to-br from-[#36e27b] to-[#1b3224]"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#112117] bg-gradient-to-br from-[#254632] to-[#36e27b]"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#112117] bg-gradient-to-br from-[#36e27b] to-[#112117]"></div>
                </div>
                <p className="text-sm text-white/60">
                  Trusted by 5,000+ developers
                </p>
              </div>
            </div>

            {/* Hero Visual / Mockup */}
            <div className="w-full flex-1 relative">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#36e27b]/20 blur-[100px] rounded-full -z-10"></div>
              <div className="w-full bg-[#1b3224] border border-[#254632] rounded-xl p-2 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                <div className="w-full h-full bg-[#112117] rounded-lg overflow-hidden relative p-4">
                  {/* Code Input Mockup */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-[#1b3224] border border-[#254632] p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <pre className="text-xs text-[#36e27b] font-mono overflow-hidden">
                        <code>{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`}</code>
                      </pre>
                    </div>
                  </div>
                  {/* AI Response Mockup */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-[#36e27b]/10 border border-[#36e27b]/20 p-3 rounded-2xl rounded-tl-none backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#36e27b] text-sm">
                          smart_toy
                        </span>
                        <span className="text-xs font-bold text-[#36e27b]">
                          CodeExplainAI
                        </span>
                      </div>
                      <p className="text-xs text-white/90">
                        This is a recursive implementation of the Fibonacci
                        sequence. It returns the nth Fibonacci number by
                        recursively calling itself...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section
          id="features"
          className="w-full px-4 py-16 bg-[#1b3224]/30 border-y border-[#254632]"
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-4 text-center md:text-left max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
                Supercharge Your Code Understanding
              </h2>
              <p className="text-white/70 text-lg">
                Built for developers, students, and anyone who wants to
                understand code faster.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-[#1b3224] border border-[#254632] hover:border-[#36e27b]/50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">flash_on</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">
                    Instant Explanations
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Paste any code snippet and get a clear, concise explanation
                    in seconds. No waiting, no complexity.
                  </p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-[#1b3224] border border-[#254632] hover:border-[#36e27b]/50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">code</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">
                    Multi-Language Support
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    JavaScript, Python, Java, and more. Our AI understands
                    syntax and logic across popular languages.
                  </p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-[#1b3224] border border-[#254632] hover:border-[#36e27b]/50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#36e27b]/10 flex items-center justify-center text-[#36e27b] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">
                    Learn as You Go
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Perfect for students and beginners. Understand complex
                    algorithms and patterns with simple explanations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full px-4 py-20 max-w-7xl">
          <div className="flex flex-col items-center gap-10">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Loved by Developers
              </h2>
              <p className="text-white/60">
                Join thousands of developers who understand code faster.
              </p>
            </div>
            <div className="w-full overflow-x-auto pb-6 scrollbar-hide">
              <div className="flex gap-6 min-w-max px-4">
                {/* Card 1 */}
                <div className="w-[320px] p-6 rounded-2xl bg-[#1b3224] border border-[#254632] flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#36e27b] to-[#1b3224]"></div>
                    <div>
                      <p className="text-white font-bold text-sm">Alex M.</p>
                      <p className="text-[#36e27b] text-xs">Senior Developer</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {
                      '"CodeExplainAI helped me onboard to a new codebase 3x faster. It\'s like having a senior dev explain every function."'
                    }
                  </p>
                </div>
                {/* Card 2 */}
                <div className="w-[320px] p-6 rounded-2xl bg-[#1b3224] border border-[#254632] flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#254632] to-[#36e27b]"></div>
                    <div>
                      <p className="text-white font-bold text-sm">Sarah K.</p>
                      <p className="text-[#36e27b] text-xs">CS Student</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {
                      '"Finally understand recursion! This tool explains complex algorithms in a way my textbooks never could."'
                    }
                  </p>
                </div>
                {/* Card 3 */}
                <div className="w-[320px] p-6 rounded-2xl bg-[#1b3224] border border-[#254632] flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#36e27b] to-[#112117]"></div>
                    <div>
                      <p className="text-white font-bold text-sm">James T.</p>
                      <p className="text-[#36e27b] text-xs">Tech Lead</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {
                      '"I use it for code reviews. It catches logic issues I sometimes miss and explains them clearly."'
                    }
                  </p>
                </div>
                {/* Card 4 */}
                <div className="w-[320px] p-6 rounded-2xl bg-[#1b3224] border border-[#254632] flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1b3224] to-[#36e27b]"></div>
                    <div>
                      <p className="text-white font-bold text-sm">Emily R.</p>
                      <p className="text-[#36e27b] text-xs">Junior Dev</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {
                      '"The interface is beautiful and the explanations are spot on. Best coding assistant I\'ve used."'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          id="about"
          className="w-full px-4 py-20 bg-[#112117] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b3224] to-transparent opacity-50 pointer-events-none"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Ready to understand code faster?
            </h2>
            <p className="text-white/70 text-lg">
              Start explaining code instantly. No signup required.
            </p>
            <Link
              to="/app"
              className="flex h-14 px-10 items-center justify-center rounded-full bg-[#36e27b] text-[#122118] text-lg font-bold hover:scale-105 transition-all shadow-[0_0_25px_rgba(54,226,123,0.5)]"
            >
              Get Started for Free
            </Link>
            <p className="text-xs text-white/40 mt-2">
              No credit card required • Unlimited explanations
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#254632] bg-[#112117] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#36e27b]">
              code
            </span>
            <span className="text-white font-bold tracking-tight">
              CodeExplainAI
            </span>
          </div>
          <div className="flex gap-8 text-sm text-white/60">
            <a className="hover:text-[#36e27b] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-[#36e27b] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-[#36e27b] transition-colors" href="#">
              Contact
            </a>
          </div>
          <div className="flex gap-4">
            <a
              className="text-white/60 hover:text-white transition-colors"
              href="#"
            >
              <span className="sr-only">Twitter</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a
              className="text-white/60 hover:text-white transition-colors"
              href="#"
            >
              <span className="sr-only">GitHub</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  fillRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
