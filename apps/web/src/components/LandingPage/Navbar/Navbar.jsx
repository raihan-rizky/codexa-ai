import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#112117]/80 border-b border-solid border-[#254632]">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center w-40 h-10 gap-3">
          <img
            src="images/logo-image.png"
            width="130"
            height="128"
            alt="logo-image"
            className="relative"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "About"].map((item) => (
            <a
              key={item}
              className="group relative text-sm font-medium text-white/80 hover:text-white transition-colors"
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#36e27b] transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="relative flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#36e27b] text-[#122118] text-sm font-bold shadow-[0_0_15px_rgba(54,226,123,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(54,226,123,0.5)] group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
