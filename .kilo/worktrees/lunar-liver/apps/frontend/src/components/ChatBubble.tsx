import { useState } from "react";
import { MessageCircle, X, Phone } from "lucide-react";
import { Button } from "./ui/button";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartChat = () => {
    console.log("Starting chat...");
  };

  const handleCall = () => {
    console.log("Calling pharmacist...");
  };

  return (
    <div className="fixed bottom-6 right-6 z-1000">
      {/* Popup Card */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a7a8c] to-[#2d9caf] text-white rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  💊 Pharmacist Support
                </div>
                <div className="text-xs text-white/80 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-300"></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-gray-700 font-semibold mb-1">
              Chat with a licensed pharmacist
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Mon – Sat · 8:00am – 8:00pm
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleStartChat}
                className="w-full bg-[#1a7a8c] hover:bg-[#155d6e] text-white rounded-lg"
              >
                Start Chat
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="w-full border-[#1a7a8c] text-[#1a7a8c] hover:bg-[#f0f9fa] rounded-lg flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <div className="relative">
        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-full bg-[#1a7a8c]/30 animate-pulse"></div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-[#1a7a8c] hover:bg-[#155d6e] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
