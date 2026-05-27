import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export const Auth = () => {
  const location = useLocation();
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (location.pathname.includes("signup")) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#e0f2fe] flex items-center justify-center p-4 md:p-8">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Static Info */}
        <div className="lg:w-[45%] bg-gradient-to-br from-[#0d4f5c] to-[#164e63] p-8 md:p-12 flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 bg-white rounded-2xl p-3 mb-6 shadow-lg">
            <img
              src="/logo.jpg"
              alt="Pharmacie Nouni"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Welcome to PharmaX
          </h2>
          <p className="text-teal-100 text-center mb-8">
            Your trusted online pharmacy solution
          </p>

          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-teal-200 text-sm">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">99%</div>
              <div className="text-teal-200 text-sm">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-teal-200 text-sm">Support</div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="lg:w-[55%] p-8 md:p-12 flex items-center justify-center min-h-[500px]">
          <div className="w-full max-w-md">
            {/* Login Form - Visible when NOT flipped */}
            <div
              className={`transition-all duration-500 ${isFlipped ? "hidden" : "block"}`}
            >
              <Outlet />
            </div>

            {/* Register Form - Visible when flipped */}
            <div
              className={`transition-all duration-500 ${isFlipped ? "block" : "hidden"}`}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
