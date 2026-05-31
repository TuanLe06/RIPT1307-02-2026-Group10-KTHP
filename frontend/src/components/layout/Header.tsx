import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

const Header = () => {
  const { theme, toggle } = useTheme();

  return (
    <header className="bg-surface-container-lowest shadow-sm z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center h-14 md:h-16 px-6 md:px-8 lg:px-10">
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={import.meta.env.VITE_CANDIDATE_URL}
            className="flex items-center gap-2"
          >
            <img
              alt="AdmisX Logo"
              className="h-8 w-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsZ8PgnmBWF7MzIsdKEp8EgUJYxYGTS6L0o70U_gJssmzKeeFRfri8zsvA6_71Rs09BLDMOzfSeizXC2eVpx13w5vzEiIHv6cX_4HpU7wjFVXioOxIvmNTbNN_7v9NR29Ps0aFrFp2VwfNVi8HUWDD5MrTkVMaLAEy2cWHJ8TKxRSXig1ci3Vcw1ziQw41-Gu09wYVHHpKuZpFG7pFJt8dDzOxVle9zRfVGUKbJtMwSbmwuhAU0FMI2rm_dPJiPtE7shKiyopZvEo"
            />
            <span className="font-h4-card-header text-h4-card-header font-black text-text-primary">
              AdmisX
            </span>
          </a>
        </div>

        <div className="flex items-center gap-md ml-auto">
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant mr-2"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === "light" ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-hover text-on-primary px-md py-2 rounded-lg font-body text-[15px] md:text-[16px] font-bold transition-all shadow-sm"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
