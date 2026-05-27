import { Search, ShoppingCart, CreditCard, Truck } from "lucide-react";
import { Badge } from "./ui/badge";
import { useFadeInOnScroll } from "../hooks/useFadeInOnScroll";

const steps = [
  {
    icon: Search,
    title: "Browse Medicines",
    description:
      "Explore our wide range of health products and find what you need",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select your medicines and add them to your shopping cart",
  },
  {
    icon: CreditCard,
    title: "Easy Checkout",
    description: "Secure payment and choose your delivery options",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Receive your medicines delivered right to your door",
  },
];

export function HowItWorksSection() {
  const [ref, isVisible] = useFadeInOnScroll();
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div ref={ref} className={`fade-in-up ${isVisible ? "visible" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              How It Works
            </Badge>
            <h2 className="text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900">
              Simple Steps to Your Health
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting your medicines has never been easier. Follow these simple
              steps and get your prescriptions delivered in no time.
            </p>
          </div>

          <div className="relative">
            {/* Animated connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-200 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-0 w-32 h-2 -mt-1 bg-gradient-to-r from-transparent to-cyan-500 animate-flow rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative group flex flex-col items-center text-center gap-3"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-br from-[#1a7a8c] to-[#2d9caf] text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-2xl p-8 pt-12 border-2 border-cyan-100 hover:border-cyan-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center h-full w-full">
                    {/* Icon Circle with animation */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 mx-auto flex-shrink-0 mb-6">
                      <step.icon className="h-10 w-10 text-white" />
                      {/* Animated ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30\"></div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary">→</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-primary to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95">
              Start Shopping Now →
            </button>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-10 w-48 h-48 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <style>{`
          @keyframes flow {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          .animate-flow {
            animation: flow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
