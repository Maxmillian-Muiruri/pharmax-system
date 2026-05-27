import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0d4f5c] text-white w-full">
      <div className="w-full px-4 md:px-8 py-12">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate("/")}
              >
                <span className="text-xl font-medium tracking-tight">
                  <span className="text-xs text-cyan-300">PharmX </span>
                  <span className="text-base font-semibold text-white">
                    NOUN
                  </span>
                </span>
              </div>

              <p className="text-cyan-100 text-sm">
                Your trusted online pharmacy providing authentic medicines,
                health products, and expert healthcare advice since 2014.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-200 hover:text-white hover:bg-cyan-600/30 p-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5L14.17.5C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-200 hover:text-white hover:bg-cyan-600/30 p-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.32,6.44A2.93,2.93,0,0,0,21.26,4.3a2.83,2.83,0,0,0-2.11-.91,5.71,5.71,0,0,0-3,.93,11.09,11.09,0,0,0-3.7,2.68,11.47,11.47,0,0,0-3.7-2.68,5.58,5.58,0,0,0-3-.93,2.83,2.83,0,0,0-2.11.91,2.93,2.93,0,0,0-2.06,2.14,2.81,2.81,0,0,0,.23,1.63,2.9,2.9,0,0,0,1.34,1.38,5.59,5.59,0,0,0,1.86,3.19A3.56,3.56,0,0,0,4.33,14.4a4.79,4.79,0,0,0,2.52.67,5.61,5.61,0,0,0,2.88-.74,9.43,9.43,0,0,0,2.64-1.92,12.56,12.56,0,0,0,2.64,1.92,5.61,5.61,0,0,0,2.88.74,4.79,4.79,0,0,0,2.52-.67,3.56,3.56,0,0,0,1.23-2.55,5.59,5.59,0,0,0,1.86-3.19A2.9,2.9,0,0,0,23.32,6.44Z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-200 hover:text-white hover:bg-cyan-600/30 p-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,2.16c3.2,0,3.58,0,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.64.07,4.85s0,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.64.07-4.85.07s-3.58,0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s0-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.79,2.16,12,2.16ZM12,0C8.74,0,8.33,0,7.05.07C3.64.15.58,3.21.5,6.62.44,7.9.42,8.31.42,11.57s0,3.68.07,4.95c.14,4.83,4.13,8.79,8.96,8.93C8.28,25.58,8.67,25.57,11.94,25.57h.13s3.67,0,4.95-.07c4.83-.14,8.79-4.13,8.93-8.96.06-1.27.07-1.68.07-4.95s0-3.68-.07-4.95c-.14-4.83-4.13-8.79-8.96-8.93C15.72.44,15.33.43,12,.43ZM12,5.83A6.13,6.13,0,0,0,5.82,12,6.13,6.13,0,0,0,12,18.17,6.13,6.13,0,0,0,18.17,12,6.13,6.13,0,0,0,12,5.83Zm0,10A3.81,3.81,0,0,1,8.19,12,3.81,3.81,0,0,1,12,8.19,3.81,3.81,0,0,1,15.81,12,3.81,3.81,0,0,1,12,15.81Zm6.41-1.12A1.44,1.44,0,0,1,16.59,12a1.45,1.45,0,0,1-1.12,1.44,1.43,1.43,0,0,1-1.44-1.12A1.43,1.43,0,0,1,15.17,12,1.44,1.44,0,0,1,18.41,10.88Z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-200 hover:text-white hover:bg-cyan-600/30 p-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.45,20.45H16.89V14.88c0-1.33,0-3-1.85-3s-2.14,1.44-2.14,2.93v5.66H10.32V9h3.31v1.56h.05a3.1,3.1,0,0,1,2.79-1.54c3,0,3.56,2,3.56,4.58V20.45ZM5.34,7.43A2.06,2.06,0,1,1,3.28,5.37,2.06,2.06,0,0,1,5.34,7.43Zm1.78,13H8.9V9H7.12ZM22.22,0H1.78A1.75,1.75,0,0,0,0,1.73V22.27A1.75,1.75,0,0,0,1.78,24H22.22A1.75,1.75,0,0,0,24,22.27V1.73A1.75,1.75,0,0,0,22.22,0Z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Our Services
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Upload Prescription
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Health Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">
                Customer Service
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Return Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-cyan-100 hover:text-cyan-300 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Get In Touch</h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-300" />
                  <span className="text-cyan-100">+1-800-PHARMACY</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-300" />
                  <span className="text-cyan-100">
                    support@pharmacienouni.com
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  <span className="text-cyan-100">
                    123 Health St, Medical City
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-300" />
                  <span className="text-cyan-100">24/7 Support Available</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-white">Newsletter</h5>
                <p className="text-xs text-cyan-100">
                  Get health tips and exclusive offers
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your email"
                    className="bg-[#0a3d47] border-cyan-700 text-white placeholder:text-cyan-400/60"
                  />
                  <Button
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-cyan-700/50" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-cyan-100">
            <p>© 2024 Pharmacie Nouni. All rights reserved.</p>

            <div className="flex gap-6">
              <span>🏥 Licensed Pharmacy</span>
              <span>🔒 Secure Payments</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
