import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("announcementBarDismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("announcementBarDismissed", "true");
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] bg-[#1a7a8c] text-white h-10 overflow-hidden transition-all duration-500 ${
        isDismissed ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-full text-sm md:text-base">
        <span className="flex-1">
          🚚 Free delivery on orders over $30 · Use code HEALTH10 for 10% off
          your first order
        </span>
        <button
          onClick={handleDismiss}
          className="ml-4 flex-shrink-0 hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
