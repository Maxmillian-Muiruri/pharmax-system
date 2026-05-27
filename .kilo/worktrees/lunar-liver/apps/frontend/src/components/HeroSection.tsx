import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Truck, ShoppingBag, DollarSign, Heart, Award } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const navigate = useNavigate();

  const [scrollY, setScrollY] = useState<number>(0);
  const [clickedCard, setClickedCard] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCardClick = (cardIndex: number) => {
    setClickedCard(cardIndex);
    setTimeout(() => setClickedCard(null), 600);
  };

  return (
    <section className="relative bg-gradient-to-br from-[#1a7a8c] via-[#1f7a8c] to-[#2d9caf] py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(https://maxmillin.edgeone.app/2151684858.jpg)",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a7a8c]/95 via-[#0d4a5a]/90 to-[#2d9caf]/90"></div>
      <div className="absolute inset-0 bg-black/25"></div>

      {/* Background decorative elements with parallax */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-300 rounded-full blur-3xl transition-transform duration-200"
          style={{
            transform: `translate(${scrollY * 0.15}px, ${scrollY * 0.1}px)`,
          }}
        ></div>
        <div
          className="absolute bottom-10 right-20 w-96 h-96 bg-teal-300 rounded-full blur-3xl transition-transform duration-200"
          style={{
            transform: `translate(${-scrollY * 0.2}px, ${scrollY * 0.15}px)`,
          }}
        ></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-white">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30 backdrop-blur-sm text-[13px]">
              ✓ Your Health: Anytime, Anywhere!
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Your Digital
              <br />
              Healthcare Partner
            </h1>

            <p className="text-xl text-white/90 max-w-lg leading-relaxed">
              Experience seamless healthcare with Pharmacie Nouni. Connect with
              healthcare professionals, manage appointments, access
              prescriptions, and take control of your health journey all in one
              secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-base px-8 shadow-lg transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                onClick={() => navigate("/products")}
              >
                Shop Medicines
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-black border-white/30 hover:bg-white/10 backdrop-blur-sm text-base px-8 [&>span]:text-white"
                onClick={() => navigate("/prescription")}
              >
                <span className="font-bold">Upload Prescription</span>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-sm">
              <div className="flex items-center gap-2 text-white/90">
                <Heart className="h-5 w-5" />
                <span>FHIR-Native</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Award className="h-5 w-5" />
                <span>99.99% Uptime</span>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative hidden lg:block">
            <div className="space-y-6">
              {/* Fast Delivery Card */}
              <div
                className={`ml-auto w-80 bg-gradient-to-br from-white to-gray-50 rounded-[24px] p-6 cursor-pointer transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-slide-fade-float-1 shadow-ambient ${
                  clickedCard === 1 ? "animate-click-pulse" : ""
                }`}
                onClick={() => handleCardClick(1)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-[#1f7a8c] to-[#2d9caf] p-3 rounded-[16px] shadow-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 font-bold">
                      Fast Delivery
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get your medicines delivered to your door
                    </p>
                  </div>
                </div>
              </div>

              {/* Easy Shopping Card */}
              <div
                className={`mr-auto w-80 bg-gradient-to-br from-white to-gray-50 rounded-[24px] p-6 cursor-pointer transform hover:scale-105 hover:-rotate-1 transition-all duration-300 animate-slide-fade-float-2 shadow-ambient ${
                  clickedCard === 2 ? "animate-click-pulse" : ""
                }`}
                onClick={() => handleCardClick(2)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-[#2d9caf] to-[#1f7a8c] p-3 rounded-[16px] shadow-lg">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Easy Shopping
                    </h3>
                    <p className="text-sm text-gray-600">
                      Browse and order with just a few clicks
                    </p>
                  </div>
                </div>
              </div>

              {/* Fair Prices Card */}
              <div
                className={`ml-auto w-80 bg-gradient-to-br from-white to-gray-50 rounded-[24px] p-6 cursor-pointer transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-slide-fade-float-3 shadow-ambient ${
                  clickedCard === 3 ? "animate-click-pulse" : ""
                }`}
                onClick={() => handleCardClick(3)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-[#1a7a8c] to-[#2d9caf] p-3 rounded-[16px] shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Fair Prices
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quality healthcare at affordable prices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Bento-style animations */}
      <style>{`
        /* Ambient shadow for floating effect */
        .shadow-ambient {
          box-shadow: 
            0 10px 30px -5px rgba(31, 122, 140, 0.15),
            0 20px 60px -15px rgba(31, 122, 140, 0.1),
            0 0 0 1px rgba(31, 122, 140, 0.05);
        }
        
        @keyframes slideInThenFloat {
          0% {
            opacity: 0;
            transform: translateX(60px) translateY(20px);
          }
          50% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          75% {
            transform: translateX(0) translateY(-8px);
          }
          100% {
            transform: translateX(0) translateY(0);
          }
        }
        
        @keyframes continuousFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        
        .animate-slide-fade-float-1 {
          animation: 
            slideInThenFloat 1.2s ease-out 0.2s both,
            continuousFloat 4s ease-in-out 1.4s infinite;
        }
        
        .animate-slide-fade-float-2 {
          animation: 
            slideInThenFloat 1.2s ease-out 0.4s both,
            continuousFloat 4.5s ease-in-out 1.6s infinite;
        }
        
        .animate-slide-fade-float-3 {
          animation: 
            slideInThenFloat 1.2s ease-out 0.6s both,
            continuousFloat 5s ease-in-out 1.8s infinite;
        }
        
        @keyframes clickPulse {
          0% {
            transform: scale(1);
            box-shadow: 
              0 10px 30px -5px rgba(31, 122, 140, 0.15),
              0 20px 60px -15px rgba(31, 122, 140, 0.1),
              0 0 0 1px rgba(31, 122, 140, 0.05);
          }
          50% {
            transform: scale(0.95);
            box-shadow: 
              0 5px 15px -5px rgba(31, 122, 140, 0.3),
              0 10px 30px -15px rgba(31, 122, 140, 0.2),
              0 0 0 2px rgba(31, 122, 140, 0.15);
          }
          100% {
            transform: scale(1);
            box-shadow: 
              0 15px 40px -5px rgba(31, 122, 140, 0.2),
              0 25px 70px -15px rgba(31, 122, 140, 0.15),
              0 0 0 1px rgba(31, 122, 140, 0.08);
          }
        }
        
        .animate-click-pulse {
          animation: clickPulse 0.6s ease-out;
        }
        
        .shadow-ambient:hover {
          box-shadow: 
            0 15px 40px -5px rgba(31, 122, 140, 0.2),
            0 25px 70px -15px rgba(31, 122, 140, 0.15),
            0 0 0 1px rgba(31, 122, 140, 0.08);
        }
      `}</style>
    </section>
  );
}
