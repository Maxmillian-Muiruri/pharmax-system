import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Apple, Smartphone, Star } from "lucide-react";

export function AppBannerSection() {
  return (
    <section className="py-24 bg-[#0d4f5c] text-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - CTA */}
          <div>
            <Badge className="mb-4 bg-[#1a7a8c] text-white hover:bg-[#155d6e] border-0">
              Now on mobile
            </Badge>

            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Order from anywhere, anytime
            </h2>

            <p className="text-lg text-gray-300 mb-8">
              Download the Pharmacie Nouni app and manage your health on the go.
              Prescriptions, orders and consultations in your pocket.
            </p>

            {/* Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button className="bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 rounded-lg py-6">
                <Apple className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>

              <Button className="bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 rounded-lg py-6">
                <Smartphone className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-white/80">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm">4.8 rating · 50K+ downloads</span>
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Phone Frame */}
              <div className="mx-auto w-52 h-96 bg-[#0a3d47] rounded-3xl border-8 border-[#0a3d47] shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-[#0d4f5c] rounded-b-3xl z-10"></div>

                {/* Screen */}
                <div className="w-full h-full bg-gradient-to-br from-[#1a7a8c] to-[#2d9caf] p-4 pt-8 flex flex-col justify-between">
                  {/* App Header */}
                  <div className="text-center text-white mb-4">
                    <div className="text-sm font-semibold">Pharmacie Nouni</div>
                  </div>

                  {/* Mock UI Cards */}
                  <div className="space-y-3 flex-1">
                    {/* Card 1 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs text-white/70">
                        Paracetamol 500mg
                      </div>
                      <div className="text-sm font-semibold text-white">
                        $8.99
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs text-white/70">
                        Vitamin C 1000mg
                      </div>
                      <div className="text-sm font-semibold text-white">
                        $12.99
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs text-white/70">
                        Omega-3 Fish Oil
                      </div>
                      <div className="text-sm font-semibold text-white">
                        $18.99
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="w-full bg-white text-[#1a7a8c] rounded-lg py-2 text-xs font-semibold">
                    Shop All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
