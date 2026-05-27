import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Percent, Gift, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFadeInOnScroll } from "../hooks/useFadeInOnScroll";
import { CountdownTimer } from "./CountdownTimer";

export function PromotionsSection() {
  const navigate = useNavigate();
  const [ref, isVisible] = useFadeInOnScroll();

  return (
    <section className="py-24 bg-gray-50">
      <div ref={ref} className={`fade-in-up ${isVisible ? "visible" : ""}`}>
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Special Offers
          </Badge>
          <h2 className="text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900">
            Exclusive Deals & Promotions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Save more on your healthcare essentials with our limited-time offers
            and exclusive deals
          </p>
        </div>

        <div className="max-w-screen-xl mx-auto px-8 mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#2d9caf] to-[#1a7a8c] p-8 md:p-12 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    New Customer Offer
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl mb-4 font-bold">
                  Get 20% OFF Your First Order
                </h3>
                <p className="text-white/90 text-lg mb-6">
                  Start your wellness journey with us and enjoy exclusive
                  savings on all products
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={() => navigate("/products")}
                  >
                    Shop Now
                  </Button>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                    <span className="text-sm">Use Code:</span>
                    <span className="font-bold text-lg">FIRST20</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="text-6xl md:text-7xl font-bold">20%</div>
                  <div className="text-xl md:text-2xl font-medium">OFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Clock className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    Limited Time
                  </Badge>
                </div>
                <h3 className="text-2xl mb-3 font-bold">
                  Flash Sale: Up to 30% OFF
                </h3>
                <p className="text-white/90 mb-6">
                  Selected vitamins & supplements. Hurry, while stocks last!
                </p>
                <CountdownTimer />
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm mt-6"
                  onClick={() => navigate("/products")}
                >
                  View Deals
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    Popular
                  </Badge>
                </div>
                <h3 className="text-2xl mb-3 font-bold">Buy 2 Get 1 Free</h3>
                <p className="text-white/90 mb-6">
                  On all personal care products. Mix & match your favorites!
                </p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => navigate("/products")}
                >
                  Shop Personal Care
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Daily Deals</div>
                <div className="text-xs text-muted-foreground">
                  New offers every day
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Free Shipping</div>
                <div className="text-xs text-muted-foreground">
                  On orders over $50
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Loyalty Rewards</div>
                <div className="text-xs text-muted-foreground">
                  Earn points on every purchase
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
