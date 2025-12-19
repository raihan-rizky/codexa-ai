import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Navbar = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#112117]/80 border-b border-solid border-[#254632]">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center w-40 h-10 gap-3">
          {isLoading ? (
            <Skeleton
              width={130}
              height={32}
              baseColor="#1b3224"
              highlightColor="#254632"
            />
          ) : (
            <img
              src="images/logo-image.png"
              width="130"
              height="128"
              alt="logo-image"
              className="relative animate-fadeIn"
            />
          )}
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    width={70}
                    height={20}
                    baseColor="#1b3224"
                    highlightColor="#254632"
                  />
                ))
            : ["Features", "How it Works", "About"].map((item) => (
                <a
                  key={item}
                  className="group relative text-sm font-medium text-white/80 hover:text-white transition-colors animate-fadeIn"
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#36e27b] transition-all group-hover:w-full"></span>
                </a>
              ))}
        </nav>

        {/* Get Started Button */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton
              width={130}
              height={40}
              borderRadius={9999}
              baseColor="#1b3224"
              highlightColor="#36e27b33"
            />
          ) : (
            <Link
              to="/app"
              className="relative flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#36e27b] text-[#122118] text-sm font-bold shadow-[0_0_15px_rgba(54,226,123,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(54,226,123,0.5)] group animate-fadeIn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </header>
  );
};

export default Navbar;
