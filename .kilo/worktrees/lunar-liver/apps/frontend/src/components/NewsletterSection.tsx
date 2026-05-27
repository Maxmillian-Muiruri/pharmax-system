import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-[#1a7a8c] to-[#2d9caf]">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 text-center">
        <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-white/30">
          Stay in the loop
        </Badge>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Get health tips & exclusive deals
        </h2>

        <p className="text-white/80 mb-8 text-lg">
          Join 10,000+ subscribers. No spam, unsubscribe anytime.
        </p>

        {isSubscribed ? (
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4 mb-8 inline-block">
            <div className="flex items-center gap-2 text-white">
              <Check className="h-5 w-5" />
              <span>✓ You're subscribed! Check your inbox.</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="mb-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-5 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <Button
              type="submit"
              className="bg-white text-[#1a7a8c] hover:bg-[#f0f0f0] px-8 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Subscribe
            </Button>
          </form>
        )}

        <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Weekly health tips</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Exclusive discounts</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>New product alerts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
