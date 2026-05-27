import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useFadeInOnScroll } from "../hooks/useFadeInOnScroll";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
  initials: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, NY",
    rating: 5,
    review:
      "PharmX made managing my prescriptions so easy. Fast delivery and excellent customer service. I've been using them for 8 months now!",
    initials: "SJ",
    avatarColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "San Francisco, CA",
    rating: 4,
    review:
      "Great selection of health products and vitamins. The app is intuitive and my orders arrive within 24 hours. Highly recommend!",
    initials: "MC",
    avatarColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    name: "Emma Williams",
    location: "London, UK",
    rating: 5,
    review:
      "Professional pharmacists, reliable delivery, and affordable prices. PharmX has become my trusted pharmacy partner.",
    initials: "EW",
    avatarColor: "bg-purple-100 text-purple-700",
  },
];

export function TestimonialsSection() {
  const [ref, isVisible] = useFadeInOnScroll();
  return (
    <section className="py-24 bg-gray-50">
      <div ref={ref} className={`fade-in-up ${isVisible ? "visible" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Patient Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust PharmX for their
              healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="border-2 border-cyan-100 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <CardContent className="p-8">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    "{testimonial.review}"
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-6"></div>

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`${testimonial.avatarColor} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md font-bold text-sm`}
                    >
                      {testimonial.initials}
                    </div>

                    {/* Name and Location */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Statement */}
          <div className="mt-16 bg-gradient-to-r from-primary/5 to-cyan-500/5 rounded-2xl p-8 border border-cyan-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8 ★</div>
              <p className="text-gray-700">
                Rated excellent by{" "}
                <span className="font-semibold">5,000+ customers</span> across
                the globe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
