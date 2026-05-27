import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CART_URL, ROOT_URL_PREFIX, navLinks } from "../utils";
import { useCart } from "../context/CartContext";
import { ReusableSearchBar } from "./dev/core";
import { User, LogOut } from "lucide-react";

type HeaderProps = {
  cartItemCount?: number;
  onCartClick?: () => void;
};

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [atBottom, setAtBottom] = useState(false);
  const [passedHowItWorks, setPassedHowItWorks] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ username?: string; email?: string; profilePicture?: string } | null>(null);
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  // Use context value if props not provided
  const actualCartItemCount = cartItemCount ?? getItemCount();

  // Check auth status
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem('pharmacie_user');
      if (user) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(user));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkLoginStatus();

    // Listen for auth changes
    const handleAuthChange = () => checkLoginStatus();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleAccountClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pharmacie_user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      // Check if at bottom
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300;
      setAtBottom(isBottom);

      // Check if passed How It Works section (approximately 40% down the page)
      const pageHeight = document.documentElement.scrollHeight;
      const howItWorksPosition = pageHeight * 0.35; // Roughly where HowItWorks appears
      setPassedHowItWorks(window.scrollY > howItWorksPosition && !isBottom);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${
        atBottom
          ? "bg-linear-to-r from-[#1a7a8c] to-[#2d9caf] shadow-lg py-2"
          : passedHowItWorks
            ? "bg-linear-to-r from-[#0f3a4a] to-[#1a5a6e] shadow-lg py-2"
            : "bg-white py-4 border-b border-slate-200/50 shadow-sm"
      }`}
    >
      <div className="w-full px-4 md:px-8">
        <div className="max-w-screen-2xl mx-auto py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <NavLink
              className="flex items-center cursor-pointer shrink-0"
              to={ROOT_URL_PREFIX}
            >
              <img
                src="/logo.jpg"
                alt="PharmX"
                className="h-8 w-auto object-contain md:h-9"
                decoding="async"
              />
            </NavLink>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:block flex-1">
              <ul className="flex justify-center space-x-6">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      className={({ isActive }) => {
                        const onTealHeader = atBottom || passedHowItWorks;
                        const line =
                          "relative inline-flex pb-1.5 text-sm font-medium transition-colors after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:origin-center after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 " +
                          (onTealHeader
                            ? "after:bg-cyan-200 "
                            : "after:bg-primary ");
                        const activeLine = isActive ? "after:scale-x-100 " : "";
                        const colors = onTealHeader
                          ? isActive
                            ? "text-white"
                            : "text-white/70 hover:text-white"
                          : isActive
                            ? "text-slate-900"
                            : "text-slate-600 hover:text-slate-900";
                        return line + activeLine + colors;
                      }}
                      to={link.to}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Account - conditional based on login status */}
              {isLoggedIn && userData ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccountClick}
                    className={`flex items-center gap-2 transition-colors ${
                      atBottom || passedHowItWorks
                        ? "text-white/70 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center overflow-hidden">
                      {userData.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt={userData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {userData.username || 'User'}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-full transition-colors ${
                      atBottom || passedHowItWorks
                        ? "text-white/70 hover:text-white hover:bg-white/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                    }`}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAccountClick}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    atBottom || passedHowItWorks
                      ? "text-white/70 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login / Register</span>
                </button>
              )}

              {onCartClick ? (
                <button
                  onClick={onCartClick}
                  className={`relative transition-colors ${
                    atBottom || passedHowItWorks
                      ? "text-white/70 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                  {actualCartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {actualCartItemCount}
                    </span>
                  )}
                </button>
              ) : (
                <NavLink
                  to={CART_URL}
                  className={`relative transition-colors ${
                    atBottom || passedHowItWorks
                      ? "text-white/70 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                  {actualCartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {actualCartItemCount}
                    </span>
                  )}
                </NavLink>
              )}

              <button
                className={`lg:hidden transition-colors ${
                  atBottom || passedHowItWorks
                    ? "text-white/70 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search bar - Centered below */}
          <div className="mt-4 hidden md:block max-w-screen-2xl mx-auto">
            <ReusableSearchBar {...{}} />
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <nav className="mt-4 lg:hidden border-t border-slate-200 pt-4 max-w-screen-2xl mx-auto">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full text-left py-2 text-sm transition-colors ${
                          atBottom || passedHowItWorks
                            ? isActive
                              ? "text-white font-medium"
                              : "text-white/70 hover:text-white"
                            : isActive
                              ? "text-slate-900 font-medium"
                              : "text-slate-600 hover:text-slate-900"
                        }`
                      }
                      to={link.to}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
