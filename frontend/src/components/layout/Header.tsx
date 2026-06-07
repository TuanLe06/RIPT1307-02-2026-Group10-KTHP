import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const CANDIDATE_URL =
  import.meta.env.VITE_CANDIDATE_URL || "http://localhost:3000";
const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDsZ8PgnmBWF7MzIsdKEp8EgUJYxYGTS6L0o70U_gJssmzKeeFRfri8zsvA6_71Rs09BLDMOzfSeizXC2eVpx13w5vzEiIHv6cX_4HpU7wjFVXioOxIvmNTbNN_7v9NR29Ps0aFrFp2VwfNVi8HUWDD5MrTkVMaLAEy2cWHJ8TKxRSXig1ci3Vcw1ziQw41-Gu09wYVHHpKuZpFG7pFJt8dDzOxVle9zRfVGUKbJtMwSbmwuhAU0FMI2rm_dPJiPtE7shKiyopZvEo";

const PUBLIC_NAV_LINKS = [
  { href: `${CANDIDATE_URL}/`, label: "Home", icon: "home" },
  { href: `${CANDIDATE_URL}/#admissions-process`, label: "Process", icon: "route" },
  { href: `${CANDIDATE_URL}/#featured-programs`, label: "Programs", icon: "school" },
  { href: `${CANDIDATE_URL}/contact`, label: "Contact", icon: "support_agent" },
];

const Header = () => {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileOpenRef = useRef(mobileOpen);

  // keep ref in sync without causing effect dependency on `mobileOpen`
  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  // close mobile menu after navigation — schedule state update asynchronously
  useEffect(() => {
    if (!mobileOpenRef.current) return;
    const id = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);
  

  return (
    <header className="sticky top-0 z-50 border-b border-[#E4E7EC]/80 bg-white/90 shadow-[0_8px_30px_rgba(16,24,40,0.05)] backdrop-blur-xl">
      <div className="grid h-[72px] w-full max-w-[1280px] grid-cols-[1fr_auto] items-center gap-4 mx-auto px-4 sm:px-8 md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden md:flex items-center justify-start gap-8">
          {PUBLIC_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative flex h-[72px] items-center px-1 text-[14px] font-semibold text-[#667085] transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:rounded-full after:bg-[#84CFFF] after:transition-all after:duration-200 hover:font-bold hover:text-[#101828] hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="order-first flex items-center justify-start h-full md:order-none md:justify-center">
          <a
            href={CANDIDATE_URL}
            className="group flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-[#F4F6F9]"
          >
            <img
              alt="AdmiSX Logo"
              className="h-9 w-9 object-contain rounded-xl border border-[#E4E7EC] bg-white shadow-sm transition-transform group-hover:scale-105"
              src={LOGO_URL}
            />
            <div className="leading-tight">
              <span className="block text-xl font-bold text-[#101828]">
                AdmiSX
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-[#667085] sm:block">
                Admissions
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            onClick={toggle}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#667085] transition-all hover:bg-[#F4F6F9] hover:text-[#101828] md:inline-flex"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[22px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <Link
            to="/login"
            className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#667085] transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:rounded-full after:bg-[#032D60] after:transition-all after:duration-200 hover:font-bold hover:text-[#101828] hover:after:w-full hover:after:bg-[#84CFFF] md:inline-flex"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#032D60] transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:rounded-full after:bg-[#032D60] after:transition-all after:duration-200 hover:font-bold hover:text-[#021A40] hover:after:w-full hover:after:bg-[#84CFFF] md:inline-flex"
          >
            Register
          </Link>
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden text-[#667085] hover:text-[#101828] p-2.5 rounded-full hover:bg-[#F4F6F9] transition-all"
            aria-expanded={mobileOpen}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      <div
        aria-hidden={!mobileOpen}
        className={`md:hidden overflow-hidden border-t border-[#E4E7EC] bg-white/95 shadow-lg backdrop-blur-xl transition-all duration-300 ease-out ${
          mobileOpen
            ? "max-h-[520px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3">
          <nav className="flex flex-col gap-1">
            {PUBLIC_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-[#667085] transition-all duration-200 hover:translate-x-1 hover:text-[#101828] hover:bg-[#F4F6F9] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={toggle}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#E4E7EC] px-3 py-3 text-[15px] font-semibold text-[#667085] transition-all duration-200 hover:bg-[#F4F6F9] hover:text-[#101828]"
          >
            <span>Theme</span>
            <span className="material-symbols-outlined text-[20px]">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#E4E7EC] pt-3">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-[#D0D5DD] px-4 py-2.5 text-center text-sm font-bold text-[#344054] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#032D60]/30 hover:bg-[#F4F6F9] active:scale-[0.98]"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-[#2563EB] px-4 py-2.5 text-center text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-md active:scale-[0.98]"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
