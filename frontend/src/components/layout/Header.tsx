import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type AuthMode = 'login' | 'register';

const CANDIDATE_URL =
  import.meta.env.VITE_CANDIDATE_URL || "http://localhost:3000";
const LOGO_URL = "/logo_3.png";

const PUBLIC_NAV_LINKS = [
  { href: `${CANDIDATE_URL}/`, label: "Trang chủ", icon: "home" },
  { href: `${CANDIDATE_URL}/#admissions-process`, label: "Quy trình", icon: "route" },
  { href: `${CANDIDATE_URL}/#featured-programs`, label: "Chương trình", icon: "school" },
  { href: `${CANDIDATE_URL}/contact`, label: "Liên hệ", icon: "support_agent" },
];

interface HeaderProps {
  onAuthNavigate?: (mode: AuthMode) => void;
}

const Header = ({ onAuthNavigate }: HeaderProps) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileOpenRef = useRef(mobileOpen);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpenRef.current) return;
    const id = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#dee2e6] bg-white">
      <div className="grid h-[72px] w-full max-w-[1280px] grid-cols-[1fr_auto] items-center gap-4 mx-auto px-4 sm:px-8 md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden md:flex items-center justify-start gap-8">
          {PUBLIC_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative flex h-[72px] items-center px-1 text-[14px] font-semibold text-[#6c757d] transition-all duration-200 hover:text-[#343A40]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="order-first flex items-center justify-start h-full md:order-none md:justify-center">
          <a
            href={CANDIDATE_URL}
            className="group flex shrink-0 items-center gap-3 px-3 py-2 transition-all"
          >
            <img
              alt="AdmiSX Logo"
              className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
              src={LOGO_URL}
            />
            <div className="leading-tight">
              <span className="block text-xl font-bold text-[#343A40]">
                AdmiSX
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-[#667085] sm:block">
                Tuyển sinh
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center justify-end gap-4">

          {onAuthNavigate ? (
            <button
              onClick={() => onAuthNavigate('login')}
              className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#6c757d] transition-all duration-200 hover:text-[#343A40] active:scale-[0.98] md:inline-flex"
            >
              Đăng nhập
            </button>
          ) : (
            <Link
              to="/login"
              className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#6c757d] transition-all duration-200 hover:text-[#343A40] active:scale-[0.98] md:inline-flex"
            >
              Đăng nhập
            </Link>
          )}
          {onAuthNavigate ? (
            <button
              onClick={() => onAuthNavigate('register')}
              className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#007BFF] transition-all duration-200 hover:text-[#0069d9] active:scale-[0.98] md:inline-flex"
            >
              Đăng ký
            </button>
          ) : (
            <Link
              to="/register"
              className="relative hidden h-[72px] items-center px-1 text-sm font-semibold text-[#007BFF] transition-all duration-200 hover:text-[#0069d9] active:scale-[0.98] md:inline-flex"
            >
              Đăng ký
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden text-[#6c757d] hover:text-[#343A40] p-2.5 rounded hover:bg-[#F8F9FA] transition-all"
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
        className={`md:hidden overflow-hidden border-t border-[#dee2e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out ${
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
                className="flex items-center gap-3 rounded px-3 py-3 text-[15px] font-semibold text-[#6c757d] transition-all duration-200 hover:text-[#343A40] hover:bg-[#F8F9FA] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#dee2e6] pt-3">
            {onAuthNavigate ? (
              <button
                onClick={() => { setMobileOpen(false); onAuthNavigate('login'); }}
                className="rounded border border-[#dee2e6] px-4 py-2.5 text-center text-sm font-bold text-[#495057] transition-all duration-200 hover:border-[#007BFF]/30 hover:bg-[#F8F9FA] active:scale-[0.98]"
              >
                Đăng nhập
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded border border-[#dee2e6] px-4 py-2.5 text-center text-sm font-bold text-[#495057] transition-all duration-200 hover:border-[#007BFF]/30 hover:bg-[#F8F9FA] active:scale-[0.98]"
              >
                Đăng nhập
              </Link>
            )}
            {onAuthNavigate ? (
              <button
                onClick={() => { setMobileOpen(false); onAuthNavigate('register'); }}
                className="rounded bg-[#007BFF] px-4 py-2.5 text-center text-sm font-bold text-white transition-all duration-200 hover:bg-[#0069d9] shadow-[0_2px_4px_rgba(0,123,255,0.3)] active:scale-[0.98]"
              >
                Đăng ký
              </button>
            ) : (
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded bg-[#007BFF] px-4 py-2.5 text-center text-sm font-bold text-white transition-all duration-200 hover:bg-[#0069d9] shadow-[0_2px_4px_rgba(0,123,255,0.3)] active:scale-[0.98]"
              >
                Đăng ký
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
